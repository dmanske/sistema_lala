-- Migration: Fix refund_sale case sensitivity and allow re-payment
-- Date: 2026-02-12 14:00

-- ============================================================
-- 1. FIX pay_sale RPC (Allow 'refunded' status to be paid again)
-- ============================================================
CREATE OR REPLACE FUNCTION pay_sale(
    p_sale_id UUID,
    p_payments JSONB, -- [{method, amount}]
    p_stock_items JSONB DEFAULT '[]'::JSONB,
    p_credit_debit JSONB DEFAULT NULL,
    p_change_amount NUMERIC DEFAULT 0,
    p_is_physical_mode BOOLEAN DEFAULT FALSE
)
RETURNS VOID AS $$
DECLARE
    v_payment JSONB;
    v_item JSONB;
    v_sale RECORD;
    v_tenant_id UUID;
    v_method TEXT;
    v_amount NUMERIC;
BEGIN
    -- Buscar venda
    SELECT * INTO v_sale FROM sales WHERE id = p_sale_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Sale not found: %', p_sale_id;
    END IF;
    
    -- Check if already paid (Allow 'refunded' to be re-paid)
    IF v_sale.status = 'paid' THEN
        RAISE EXCEPTION 'Sale is already paid.';
    END IF;

    v_tenant_id := v_sale.tenant_id;

    -- Registrar pagamentos
    FOR v_payment IN SELECT * FROM jsonb_array_elements(p_payments) LOOP
        v_method := (v_payment->>'method')::TEXT;
        v_amount := (v_payment->>'amount')::NUMERIC;

        INSERT INTO sale_payments (
            sale_id, 
            method, 
            amount, 
            paid_at, 
            change_amount
        )
        VALUES (
            p_sale_id,
            v_method,
            v_amount,
            now(),
            CASE WHEN LOWER(v_method) = 'cash' THEN p_change_amount ELSE 0 END
        );

        -- UPDATE for Cash Ledger
        -- Use LOWER() for robust checking
        IF LOWER(v_method) IN ('cash', 'pix', 'card', 'transfer', 'wallet') THEN
            INSERT INTO cash_movements (
                tenant_id,
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
                v_tenant_id,
                'IN',
                CASE WHEN LOWER(v_method) = 'cash' THEN v_amount - p_change_amount ELSE v_amount END,
                UPPER(v_method),
                'SALE',
                p_sale_id,
                'Venda #' || substring(p_sale_id::text, 1, 8),
                now(),
                auth.uid()
            );
        END IF;
    END LOOP;

    -- Atualizar status da venda
    UPDATE sales
    SET status = 'paid', updated_at = now()
    WHERE id = p_sale_id;

    -- Movimentar estoque (saída)
    -- This handles initial payment AND re-payment (since refund puts stock back IN)
    IF p_stock_items IS NOT NULL AND jsonb_array_length(p_stock_items) > 0 THEN
        FOR v_item IN SELECT * FROM jsonb_array_elements(p_stock_items) LOOP
            INSERT INTO stock_movements (tenant_id, product_id, type, qty, reason, reference_type, reference_id, created_by)
            VALUES (
                v_tenant_id,
                (v_item->>'productId')::UUID,
                'out',
                (v_item->>'qty')::INTEGER,
                'sale',
                'sale',
                p_sale_id,
                'system'
            );

            UPDATE products
            SET current_stock = current_stock - (v_item->>'qty')::INTEGER,
                last_movement = now(),
                updated_at = now()
            WHERE id = (v_item->>'productId')::UUID;
        END LOOP;
    END IF;

    -- Atualizar appointment se houver
    IF v_sale.appointment_id IS NOT NULL THEN
        UPDATE appointments
        SET status = 'DONE',
            finalized_at = now(),
            updated_at = now()
        WHERE id = v_sale.appointment_id;
    END IF;

    -- Debitar crédito (Carteira)
    IF p_credit_debit IS NOT NULL AND (p_credit_debit->>'amount')::NUMERIC > 0 THEN
        INSERT INTO credit_movements (tenant_id, client_id, type, amount, origin, note)
        VALUES (
            v_tenant_id,
            (p_credit_debit->>'clientId')::UUID,
            'DEBIT',
            (p_credit_debit->>'amount')::NUMERIC,
            'WALLET',
            'Pagamento de venda #' || p_sale_id::TEXT
        );

        UPDATE clients
        SET credit_balance = credit_balance - (p_credit_debit->>'amount')::NUMERIC,
            updated_at = now()
        WHERE id = (p_credit_debit->>'clientId')::UUID;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- 2. FIX refund_sale RPC (Case Insensitive + Logic Check)
-- ============================================================
CREATE OR REPLACE FUNCTION refund_sale(
    p_sale_id UUID
)
RETURNS VOID AS $$
DECLARE
    v_sale RECORD;
    v_item RECORD;
    v_stock RECORD;
    v_credit RECORD;
    v_payment RECORD; -- Added variable for payment loop
    v_tenant_id UUID;
BEGIN
    -- Buscar venda
    SELECT * INTO v_sale FROM sales WHERE id = p_sale_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Sale not found: %', p_sale_id;
    END IF;
    IF v_sale.status != 'paid' THEN
        RAISE EXCEPTION 'Can only refund paid sales. Current status: %', v_sale.status;
    END IF;
    v_tenant_id := v_sale.tenant_id;

    -- Atualizar status da venda
    UPDATE sales
    SET status = 'refunded', updated_at = now()
    WHERE id = p_sale_id;

    -- [FIX] Reverter movimentações financeiras (Cash Ledger)
    FOR v_payment IN SELECT * FROM sale_payments WHERE sale_id = p_sale_id LOOP
        -- Use LOWER() to match case-insensitive payment methods
        IF LOWER(v_payment.method) IN ('cash', 'pix', 'card', 'transfer', 'wallet') THEN
            INSERT INTO cash_movements (
                tenant_id,
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
                v_tenant_id,
                'OUT',
                -- If cash, refund the net amount (amount - change) or full amount if distinct record?
                -- Usually change is given back to customer immediately, so net cash IN was (amount - change).
                -- Refund should be net amount out.
                CASE WHEN LOWER(v_payment.method) = 'cash' THEN v_payment.amount - COALESCE(v_payment.change_amount, 0) ELSE v_payment.amount END,
                UPPER(v_payment.method),
                'REFUND',
                p_sale_id,
                'Estorno Venda #' || substring(p_sale_id::text, 1, 8),
                now(),
                auth.uid()
            );
        END IF;
    END LOOP;

    -- Reverter movimentações de estoque (stock_movements com referenceId = sale_id)
    FOR v_stock IN SELECT * FROM stock_movements WHERE reference_id = p_sale_id AND type = 'out' LOOP
        INSERT INTO stock_movements (tenant_id, product_id, type, qty, reason, reference_type, reference_id, created_by)
        VALUES (
            v_tenant_id,
            v_stock.product_id,
            'in',
            v_stock.qty,
            'refund',
            'sale',
            p_sale_id,
            'system'
        );

        UPDATE products
        SET current_stock = current_stock + v_stock.qty,
            last_movement = now(),
            updated_at = now()
        WHERE id = v_stock.product_id;
    END LOOP;

    -- Reverter débitos de crédito
    FOR v_credit IN 
        SELECT * FROM credit_movements 
        WHERE note LIKE '%' || p_sale_id::TEXT || '%' 
        AND type = 'DEBIT'
    LOOP
        INSERT INTO credit_movements (tenant_id, client_id, type, amount, origin, note)
        VALUES (
            v_tenant_id,
            v_credit.client_id,
            'CREDIT',
            v_credit.amount,
            'WALLET',
            'Estorno de venda #' || p_sale_id::TEXT
        );

        UPDATE clients
        SET credit_balance = credit_balance + v_credit.amount,
            updated_at = now()
        WHERE id = v_credit.client_id;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
