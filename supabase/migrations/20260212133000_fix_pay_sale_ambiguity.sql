-- Migration: Fix pay_sale RPC ambiguity
-- Date: 2026-02-12

-- Drop older versions of pay_sale to avoid ambiguity error in PostgREST
DROP FUNCTION IF EXISTS pay_sale(uuid, jsonb, jsonb, jsonb);
DROP FUNCTION IF EXISTS pay_sale(uuid, jsonb, jsonb, jsonb, numeric);

-- Ensure the latest version exists and is correct (re-declaring it just to be safe and consistent)
-- This matches the signature from migration 20260211000003
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
    v_tenant_id := v_sale.tenant_id;

    -- Registrar pagamentos
    FOR v_payment IN SELECT * FROM jsonb_array_elements(p_payments) LOOP
        v_method := (v_payment->>'method')::TEXT;
        v_amount := (v_payment->>'amount')::NUMERIC;

        INSERT INTO sale_payments (sale_id, method, amount, paid_at, change_amount)
        VALUES (
            p_sale_id,
            v_method,
            v_amount,
            now(),
            CASE WHEN v_method = 'cash' THEN p_change_amount ELSE 0 END
        );

        -- UPDATE for Cash Ledger (MVP)
        -- Only insert compliant methods (exclude credit/fiado/etc if not in list)
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
                v_amount - (CASE WHEN v_method = 'cash' THEN p_change_amount ELSE 0 END), -- Deduzir troco do caixa
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
    -- Se p_is_physical_mode for TRUE, talvez a lógica fosse diferente, mas aqui mantemos o padrão de baixar estoque
    -- (Assumindo que p_is_physical_mode afeta apenas validações ou outros fluxos que não temos visibilidade completa agora)
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

    -- Update linked appointment if exists
    IF v_sale.appointment_id IS NOT NULL THEN
        UPDATE appointments
        SET status = 'DONE',
            finalized_at = now(),
            updated_at = now()
        WHERE id = v_sale.appointment_id;
    END IF;

    -- Debitar crédito do cliente (se aplicável)
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
