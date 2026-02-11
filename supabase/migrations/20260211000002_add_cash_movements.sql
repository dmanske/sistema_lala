-- Migration: Add Cash Movements
-- Date: 2026-02-11

-- Table: cash_movements
CREATE TABLE IF NOT EXISTS cash_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('IN', 'OUT')),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    method TEXT NOT NULL CHECK (method IN ('CASH', 'PIX', 'CARD', 'TRANSFER', 'WALLET')),
    source_type TEXT NOT NULL CHECK (source_type IN ('SALE', 'REFUND', 'PURCHASE', 'MANUAL')),
    source_id UUID,
    description TEXT,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID, -- references auth.users(id)
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_cash_movements_tenant_occurred ON cash_movements(tenant_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_cash_movements_tenant_type_occurred ON cash_movements(tenant_id, type, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_cash_movements_tenant_method_occurred ON cash_movements(tenant_id, method, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_cash_movements_source ON cash_movements(tenant_id, source_type, source_id);

-- RLS
ALTER TABLE cash_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cash_movements_all" ON cash_movements
    FOR ALL
    USING (tenant_id = auth.tenant_id())
    WITH CHECK (tenant_id = auth.tenant_id());

-- Grant access
GRANT ALL ON cash_movements TO authenticated;
GRANT ALL ON cash_movements TO service_role;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_updated_at ON cash_movements;
CREATE TRIGGER trigger_updated_at BEFORE UPDATE ON cash_movements FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RPC: pay_sale (Updated to insert into cash_movements)
CREATE OR REPLACE FUNCTION pay_sale(
    p_sale_id UUID,
    p_payments JSONB, -- [{method, amount}]
    p_stock_items JSONB DEFAULT '[]'::JSONB,
    p_credit_debit JSONB DEFAULT NULL,
    p_change_amount NUMERIC DEFAULT 0
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

        INSERT INTO sale_payments (sale_id, method, amount, paid_at)
        VALUES (
            p_sale_id,
            v_method,
            v_amount,
            now()
        );

        -- UPDATE for Cash Ledger (MVP)
        -- Only insert compliant methods (exclude credit/fiado/etc if not in list)
        -- Map common methods to UPPERCASE
        IF v_method IN ('cash', 'pix', 'card', 'transfer', 'wallet') THEN
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
                v_amount,
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


-- RPC: refund_sale (Updated for Cash Ledger)
CREATE OR REPLACE FUNCTION refund_sale(
    p_sale_id UUID
)
RETURNS VOID AS $$
DECLARE
    v_sale RECORD;
    v_stock RECORD;
    v_credit RECORD;
    v_payment RECORD;
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

    -- UPDATE for Cash Ledger (Reverse Payments)
    FOR v_payment IN SELECT * FROM sale_payments WHERE sale_id = p_sale_id LOOP
        IF v_payment.method IN ('cash', 'pix', 'card', 'transfer', 'wallet') THEN
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
                v_payment.amount,
                UPPER(v_payment.method),
                'REFUND',
                p_sale_id,
                'Estorno Venda #' || substring(p_sale_id::text, 1, 8),
                now(),
                auth.uid()
            );
        END IF;
    END LOOP;

    -- Reverter estoque
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

    -- Reverter crédito
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
