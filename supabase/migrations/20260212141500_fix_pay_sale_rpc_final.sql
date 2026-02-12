-- Migration: Fix pay_sale RPC ambiguity and logic (Final Version)
-- Date: 2026-02-12 13:40

-- Step 1: Drop all variants of pay_sale to clear ambiguity
DROP FUNCTION IF EXISTS pay_sale(uuid, jsonb, jsonb, jsonb);
DROP FUNCTION IF EXISTS pay_sale(uuid, jsonb, jsonb, jsonb, numeric);
DROP FUNCTION IF EXISTS pay_sale(uuid, jsonb, jsonb, jsonb, numeric, boolean);

-- Step 2: Ensure tables have necessary columns (idempotent checks)
DO $$
BEGIN
    -- Ensure change_amount exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sale_payments' AND column_name = 'change_amount') THEN
        ALTER TABLE sale_payments ADD COLUMN change_amount NUMERIC(10, 2) DEFAULT 0.00;
    END IF;
END $$;

-- Step 3: Recreate pay_sale function with complete logic
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
    
    -- Check if already paid
    IF v_sale.status = 'paid' THEN
        -- Should we silently return or raise? 
        -- Raising might cause frontend error if retrying. 
        -- But for now it's safer to not double charge.
        -- Let's assume frontend checks status too.
        RAISE EXCEPTION 'Sale is already paid.';
    END IF;

    v_tenant_id := v_sale.tenant_id;

    -- Registrar pagamentos
    FOR v_payment IN SELECT * FROM jsonb_array_elements(p_payments) LOOP
        v_method := (v_payment->>'method')::TEXT;
        v_amount := (v_payment->>'amount')::NUMERIC;

        -- Insert into sale_payments with explicit columns
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
        -- Only insert compliant methods
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
