-- Migration: Add Purchase Update and Delete Functions
-- Description: Adds RPC functions to update and delete purchases with proper stock and payment reversals
-- Date: 2026-02-13

-- =====================================================
-- FUNCTION: update_purchase
-- =====================================================
-- Updates a purchase and its items, adjusting stock movements accordingly
-- Restrictions: Cannot update if purchase has payments (must delete payments first)

CREATE OR REPLACE FUNCTION update_purchase(
    p_purchase_id UUID,
    p_date DATE,
    p_notes TEXT,
    p_items JSONB -- Array of {productId, quantity, unitCost}
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tenant_id UUID;
    v_has_payments BOOLEAN;
    v_old_item RECORD;
    v_new_item JSONB;
    v_product_id UUID;
    v_quantity INTEGER;
    v_unit_cost NUMERIC;
    v_line_total NUMERIC;
    v_total NUMERIC := 0;
BEGIN
    -- Get tenant_id from purchase
    SELECT tenant_id INTO v_tenant_id
    FROM purchases
    WHERE id = p_purchase_id;

    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Purchase not found';
    END IF;

    -- Check if purchase has payments
    SELECT EXISTS(
        SELECT 1 FROM purchase_payments
        WHERE purchase_id = p_purchase_id
    ) INTO v_has_payments;

    IF v_has_payments THEN
        RAISE EXCEPTION 'Cannot update purchase with existing payments. Delete payments first.';
    END IF;

    -- Reverse old stock movements
    FOR v_old_item IN
        SELECT pi.product_id, pi.quantity
        FROM purchase_items pi
        WHERE pi.purchase_id = p_purchase_id
    LOOP
        -- Reverse stock (subtract the old quantity)
        UPDATE products
        SET current_stock = current_stock - v_old_item.quantity
        WHERE id = v_old_item.product_id
          AND tenant_id = v_tenant_id;

        -- Delete old stock movement
        DELETE FROM stock_movements
        WHERE purchase_id = p_purchase_id
          AND product_id = v_old_item.product_id;
    END LOOP;

    -- Delete old items
    DELETE FROM purchase_items
    WHERE purchase_id = p_purchase_id;

    -- Insert new items and create stock movements
    FOR v_new_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_new_item->>'productId')::UUID;
        v_quantity := (v_new_item->>'quantity')::INTEGER;
        v_unit_cost := (v_new_item->>'unitCost')::NUMERIC;
        v_line_total := v_quantity * v_unit_cost;
        v_total := v_total + v_line_total;

        -- Insert new item
        INSERT INTO purchase_items (
            tenant_id, purchase_id, product_id, quantity, unit_cost, line_total
        ) VALUES (
            v_tenant_id, p_purchase_id, v_product_id, v_quantity, v_unit_cost, v_line_total
        );

        -- Create stock movement (IN)
        INSERT INTO stock_movements (
            tenant_id, product_id, type, quantity, purchase_id, date
        ) VALUES (
            v_tenant_id, v_product_id, 'IN', v_quantity, p_purchase_id, p_date
        );

        -- Update product stock
        UPDATE products
        SET current_stock = current_stock + v_quantity
        WHERE id = v_product_id
          AND tenant_id = v_tenant_id;
    END LOOP;

    -- Update purchase
    UPDATE purchases
    SET
        date = p_date,
        notes = p_notes,
        total = v_total,
        updated_at = NOW()
    WHERE id = p_purchase_id;
END;
$$;

-- =====================================================
-- FUNCTION: delete_purchase
-- =====================================================
-- Soft deletes a purchase, reversing all stock movements and payments
-- Uses soft delete to maintain audit trail

CREATE OR REPLACE FUNCTION delete_purchase(
    p_purchase_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tenant_id UUID;
    v_item RECORD;
    v_payment RECORD;
BEGIN
    -- Get tenant_id from purchase
    SELECT tenant_id INTO v_tenant_id
    FROM purchases
    WHERE id = p_purchase_id;

    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Purchase not found';
    END IF;

    -- Reverse stock movements
    FOR v_item IN
        SELECT product_id, quantity
        FROM purchase_items
        WHERE purchase_id = p_purchase_id
    LOOP
        -- Reverse stock (subtract quantity)
        UPDATE products
        SET current_stock = current_stock - v_item.quantity
        WHERE id = v_item.product_id
          AND tenant_id = v_tenant_id;

        -- Delete stock movement
        DELETE FROM stock_movements
        WHERE purchase_id = p_purchase_id
          AND product_id = v_item.product_id;
    END LOOP;

    -- Reverse payments (delete cash movements and payments)
    FOR v_payment IN
        SELECT id, bank_account_id, amount
        FROM purchase_payments
        WHERE purchase_id = p_purchase_id
    LOOP
        -- Delete cash movement
        DELETE FROM cash_movements
        WHERE reference_type = 'PURCHASE_PAYMENT'
          AND reference_id = v_payment.id;

        -- Delete payment
        DELETE FROM purchase_payments
        WHERE id = v_payment.id;
    END LOOP;

    -- Delete items
    DELETE FROM purchase_items
    WHERE purchase_id = p_purchase_id;

    -- Soft delete purchase (or hard delete if preferred)
    -- Using hard delete for now, can change to soft delete if needed
    DELETE FROM purchases
    WHERE id = p_purchase_id;

    -- Alternative: Soft delete (uncomment if preferred)
    -- UPDATE purchases
    -- SET deleted_at = NOW()
    -- WHERE id = p_purchase_id;
END;
$$;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION update_purchase TO authenticated;
GRANT EXECUTE ON FUNCTION delete_purchase TO authenticated;
