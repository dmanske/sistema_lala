-- Migration: Purchase Payments and Cash Ledger Fixes
-- Date: 2026-02-11

-- 1. Add payment columns to purchases
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS paid_amount NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- 2. Update create_purchase_with_movements RPC
CREATE OR REPLACE FUNCTION create_purchase_with_movements(
    p_tenant_id UUID,
    p_supplier_id UUID,
    p_date DATE,
    p_notes TEXT,
    p_items JSONB, -- [{productId, quantity, unitCost}]
    p_payment_method TEXT DEFAULT NULL,
    p_paid_amount NUMERIC DEFAULT 0,
    p_paid_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_purchase_id UUID;
    v_total NUMERIC := 0;
    v_item JSONB;
BEGIN
    -- Calcular total
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
        v_total := v_total + (v_item->>'quantity')::INTEGER * (v_item->>'unitCost')::NUMERIC;
    END LOOP;

    -- Inserir compra
    INSERT INTO purchases (tenant_id, supplier_id, date, notes, total, payment_method, paid_amount, paid_at)
    VALUES (p_tenant_id, p_supplier_id, p_date, p_notes, v_total, p_payment_method, p_paid_amount, p_paid_at)
    RETURNING id INTO v_purchase_id;

    -- Inserir itens e movimentações de estoque
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
        INSERT INTO purchase_items (purchase_id, product_id, quantity, unit_cost)
        VALUES (v_purchase_id, (v_item->>'productId')::UUID, (v_item->>'quantity')::INTEGER, (v_item->>'unitCost')::NUMERIC);

        INSERT INTO product_movements (tenant_id, product_id, type, quantity, reason, reference_id, reference_type, unit_cost, supplier_id)
        VALUES (p_tenant_id, (v_item->>'productId')::UUID, 'IN', (v_item->>'quantity')::INTEGER, 'Compra', v_purchase_id, 'PURCHASE', (v_item->>'unitCost')::NUMERIC, p_supplier_id);

        UPDATE products
        SET current_stock = current_stock + (v_item->>'quantity')::INTEGER, last_movement = now(), updated_at = now()
        WHERE id = (v_item->>'productId')::UUID;
    END LOOP;

    -- Registrar saída no caixa se houver pagamento
    IF p_paid_amount > 0 AND p_payment_method IS NOT NULL THEN
        -- Case insensitive check for valid ledger methods
        IF LOWER(p_payment_method) IN ('cash', 'pix', 'card', 'transfer', 'wallet') THEN
            INSERT INTO cash_movements (
                tenant_id, type, amount, method, source_type, source_id, description, occurred_at, created_by
            )
            VALUES (
                p_tenant_id, 
                'OUT', 
                p_paid_amount, 
                UPPER(p_payment_method), 
                'PURCHASE', 
                v_purchase_id, 
                'Compra #' || substring(v_purchase_id::text, 1, 8), 
                COALESCE(p_paid_at, now()), 
                auth.uid()
            );
        END IF;
    END IF;

    RETURN v_purchase_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update pay_sale RPC for robustness and change handling
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
    v_method TEXT;
    v_amount NUMERIC;
    v_item JSONB;
    v_sale RECORD;
    v_tenant_id UUID;
    v_remaining_change NUMERIC := p_change_amount;
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

        -- UPDATE for Cash Ledger
        -- Case insensitive check
        IF LOWER(v_method) IN ('cash', 'pix', 'card', 'transfer', 'wallet') THEN
            DECLARE
                v_ledger_amount NUMERIC := v_amount;
            BEGIN
                -- MODO FÍSICO: Registra entrada cheia e saída de troco separada
                IF p_is_physical_mode AND LOWER(v_method) = 'cash' AND v_remaining_change > 0 THEN
                    -- Registra entrada cheia
                    INSERT INTO cash_movements (
                        tenant_id, type, amount, method, source_type, source_id, description, occurred_at, created_by
                    )
                    VALUES (
                        v_tenant_id, 'IN', v_amount, UPPER(v_method), 'SALE', p_sale_id, 
                        'Venda #' || substring(p_sale_id::text, 1, 8) || ' (Recebido)', now(), auth.uid()
                    );

                    -- Registra saída de troco
                    INSERT INTO cash_movements (
                        tenant_id, type, amount, method, source_type, source_id, description, occurred_at, created_by
                    )
                    VALUES (
                        v_tenant_id, 'OUT', v_remaining_change, UPPER(v_method), 'REFUND', p_sale_id, 
                        'Troco Venda #' || substring(p_sale_id::text, 1, 8), now(), auth.uid()
                    );
                    
                    v_remaining_change := 0;
                    v_ledger_amount := 0; -- Já registrado acima
                
                -- MODO LÍQUIDO (Default):
                ELSIF NOT p_is_physical_mode AND LOWER(v_method) = 'cash' AND v_remaining_change > 0 THEN
                    IF v_amount >= v_remaining_change THEN
                       v_ledger_amount := v_amount - v_remaining_change;
                       v_remaining_change := 0;
                    ELSE
                       v_ledger_amount := 0;
                       v_remaining_change := v_remaining_change - v_amount;
                    END IF;
                END IF;

                IF v_ledger_amount > 0 THEN
                    INSERT INTO cash_movements (
                        tenant_id, type, amount, method, source_type, source_id, description, occurred_at, created_by
                    )
                    VALUES (
                        v_tenant_id, 'IN', v_ledger_amount, UPPER(v_method), 'SALE', p_sale_id, 
                        'Venda #' || substring(p_sale_id::text, 1, 8), now(), auth.uid()
                    );
                END IF;
            END;
        END IF;
    END LOOP;

    -- Atualizar status da venda
    UPDATE sales
    SET status = 'paid', updated_at = now()
    WHERE id = p_sale_id;

    -- Movimentar estoque
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_stock_items) LOOP
        INSERT INTO stock_movements (tenant_id, product_id, type, qty, reason, reference_type, reference_id, created_by)
        VALUES (v_tenant_id, (v_item->>'productId')::UUID, 'out', (v_item->>'qty')::INTEGER, 'sale', 'sale', p_sale_id, 'system');

        UPDATE products
        SET current_stock = current_stock - (v_item->>'qty')::INTEGER, last_movement = now(), updated_at = now()
        WHERE id = (v_item->>'productId')::UUID;
    END LOOP;

    -- Update linked appointment
    IF v_sale.appointment_id IS NOT NULL THEN
        UPDATE appointments SET status = 'DONE', finalized_at = now(), updated_at = now() WHERE id = v_sale.appointment_id;
    END IF;

    -- Debitar crédito
    IF p_credit_debit IS NOT NULL AND (p_credit_debit->>'amount')::NUMERIC > 0 THEN
        INSERT INTO credit_movements (tenant_id, client_id, type, amount, origin, note)
        VALUES (v_tenant_id, (p_credit_debit->>'clientId')::UUID, 'DEBIT', (p_credit_debit->>'amount')::NUMERIC, 'WALLET', 'Pagamento de venda #' || p_sale_id::TEXT);

        UPDATE clients SET credit_balance = credit_balance - (p_credit_debit->>'amount')::NUMERIC, updated_at = now() WHERE id = (p_credit_debit->>'clientId')::UUID;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
