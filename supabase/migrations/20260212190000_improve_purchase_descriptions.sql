-- Migration: Improve purchase cash movement descriptions
-- Description: Add supplier name and payment method to purchase descriptions
-- Date: 2026-02-12

CREATE OR REPLACE FUNCTION create_purchase_with_movements(
    p_tenant_id UUID,
    p_supplier_id UUID,
    p_date DATE,
    p_notes TEXT,
    p_items JSONB,
    p_payment_method TEXT DEFAULT NULL,
    p_paid_amount NUMERIC DEFAULT 0,
    p_paid_at TIMESTAMPTZ DEFAULT NULL,
    p_bank_account_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_purchase_id UUID;
    v_total NUMERIC := 0;
    v_item JSONB;
    v_account_active BOOLEAN;
    v_supplier_name TEXT;
    v_description TEXT;
    v_method_label TEXT;
BEGIN
    SELECT name INTO v_supplier_name
    FROM suppliers
    WHERE id = p_supplier_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Supplier not found: %', p_supplier_id;
    END IF;

    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
        v_total := v_total + (v_item->>'quantity')::INTEGER * (v_item->>'unitCost')::NUMERIC;
    END LOOP;

    INSERT INTO purchases (tenant_id, supplier_id, date, notes, total, payment_method, paid_amount, paid_at)
    VALUES (p_tenant_id, p_supplier_id, p_date, p_notes, v_total, p_payment_method, p_paid_amount, p_paid_at)
    RETURNING id INTO v_purchase_id;

    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
        INSERT INTO purchase_items (purchase_id, product_id, quantity, unit_cost)
        VALUES (v_purchase_id, (v_item->>'productId')::UUID, (v_item->>'quantity')::INTEGER, (v_item->>'unitCost')::NUMERIC);

        INSERT INTO product_movements (tenant_id, product_id, type, quantity, reason, reference_id, reference_type, unit_cost, supplier_id)
        VALUES (p_tenant_id, (v_item->>'productId')::UUID, 'IN', (v_item->>'quantity')::INTEGER, 'Compra', v_purchase_id, 'PURCHASE', (v_item->>'unitCost')::NUMERIC, p_supplier_id);

        UPDATE products
        SET current_stock = current_stock + (v_item->>'quantity')::INTEGER, last_movement = now(), updated_at = now()
        WHERE id = (v_item->>'productId')::UUID;
    END LOOP;

    IF p_paid_amount > 0 AND p_payment_method IS NOT NULL THEN
        IF p_bank_account_id IS NULL THEN
            RAISE EXCEPTION 'Bank account ID is required for purchase payment';
        END IF;

        SELECT is_active INTO v_account_active
        FROM bank_accounts
        WHERE id = p_bank_account_id AND tenant_id = p_tenant_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Bank account not found: %', p_bank_account_id;
        END IF;

        IF NOT v_account_active THEN
            RAISE EXCEPTION 'Bank account is inactive: %', p_bank_account_id;
        END IF;

        v_method_label := CASE LOWER(p_payment_method)
            WHEN 'pix' THEN 'PIX'
            WHEN 'card' THEN 'Cartão'
            WHEN 'cash' THEN 'Dinheiro'
            WHEN 'transfer' THEN 'Transferência'
            WHEN 'wallet' THEN 'Carteira'
            ELSE UPPER(p_payment_method)
        END;

        v_description := 'Compra - ' || v_method_label || ' - ' || v_supplier_name;

        IF LOWER(p_payment_method) IN ('cash', 'pix', 'card', 'transfer', 'wallet') THEN
            INSERT INTO cash_movements (
                tenant_id, 
                bank_account_id,
                type, 
                amount, 
                method, 
                source_type, 
                source_id, 
                description, 
                occurred_at, 
                created_by
            )
            VALUES (
                p_tenant_id,
                p_bank_account_id,
                'OUT', 
                p_paid_amount, 
                UPPER(p_payment_method), 
                'PURCHASE', 
                v_purchase_id, 
                v_description,
                COALESCE(p_paid_at, now()), 
                auth.uid()
            );
        END IF;
    END IF;

    RETURN v_purchase_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
