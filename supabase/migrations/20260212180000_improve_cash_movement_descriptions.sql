-- Migration: Improve cash movement descriptions
-- Description: Add customer name and payment method to sale descriptions
-- Date: 2026-02-12

CREATE OR REPLACE FUNCTION pay_sale(
    p_sale_id UUID,
    p_payments JSONB, -- [{method, amount, bankAccountId}]
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
    v_bank_account_id UUID;
    v_account_active BOOLEAN;
    v_customer_name TEXT;
    v_description TEXT;
    v_method_label TEXT;
BEGIN
    -- Buscar venda e nome do cliente
    SELECT s.*, c.name as customer_name 
    INTO v_sale 
    FROM sales s
    LEFT JOIN clients c ON c.id = s.customer_id
    WHERE s.id = p_sale_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Sale not found: %', p_sale_id;
    END IF;
    
    -- Check if already paid
    IF v_sale.status = 'paid' THEN
        RAISE EXCEPTION 'Sale is already paid.';
    END IF;

    v_tenant_id := v_sale.tenant_id;
    v_customer_name := COALESCE(v_sale.customer_name, 'Cliente não identificado');

    -- Registrar pagamentos
    FOR v_payment IN SELECT * FROM jsonb_array_elements(p_payments) LOOP
        v_method := (v_payment->>'method')::TEXT;
        v_amount := (v_payment->>'amount')::NUMERIC;
        v_bank_account_id := (v_payment->>'bankAccountId')::UUID;

        -- Validate bank account exists and is active
        IF v_bank_account_id IS NULL THEN
            RAISE EXCEPTION 'Bank account ID is required for payment method: %', v_method;
        END IF;

        SELECT is_active INTO v_account_active
        FROM bank_accounts
        WHERE id = v_bank_account_id AND tenant_id = v_tenant_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Bank account not found: %', v_bank_account_id;
        END IF;

        IF NOT v_account_active THEN
            RAISE EXCEPTION 'Bank account is inactive: %', v_bank_account_id;
        END IF;

        -- Insert into sale_payments
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

        -- Traduzir método para português
        v_method_label := CASE LOWER(v_method)
            WHEN 'pix' THEN 'PIX'
            WHEN 'card' THEN 'Cartão'
            WHEN 'cash' THEN 'Dinheiro'
            WHEN 'transfer' THEN 'Transferência'
            WHEN 'wallet' THEN 'Carteira'
            ELSE UPPER(v_method)
        END;

        -- Montar descrição melhorada
        v_description := 'Venda - ' || v_method_label || ' - ' || v_customer_name;
        
        -- Adicionar informação de troco se aplicável
        IF LOWER(v_method) = 'cash' AND p_change_amount > 0 THEN
            v_description := v_description || ' (troco R$ ' || ROUND(p_change_amount, 2)::TEXT || ')';
        END IF;

        -- Insert into cash_movements with improved description
        IF LOWER(v_method) IN ('cash', 'pix', 'card', 'transfer', 'wallet') THEN
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
                v_tenant_id,
                v_bank_account_id,
                'IN',
                CASE WHEN LOWER(v_method) = 'cash' THEN v_amount - p_change_amount ELSE v_amount END,
                UPPER(v_method),
                'SALE',
                p_sale_id,
                v_description,
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
            'Pagamento de venda - ' || v_customer_name
        );

        UPDATE clients
        SET credit_balance = credit_balance - (p_credit_debit->>'amount')::NUMERIC,
            updated_at = now()
        WHERE id = (p_credit_debit->>'clientId')::UUID;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
