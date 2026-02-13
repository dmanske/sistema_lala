-- Melhorar descrição das vendas nos cash_movements
-- Formato: "Venda - {Cliente} ({Serviços/Produtos})"

CREATE OR REPLACE FUNCTION pay_sale(
    p_sale_id UUID,
    p_payments JSONB
) RETURNS void AS $$
DECLARE
    v_payment JSONB;
    v_customer_id UUID;
    v_customer_name TEXT;
    v_sale_items TEXT;
    v_description TEXT;
    v_bank_account_id UUID;
    v_method TEXT;
    v_amount NUMERIC;
BEGIN
    -- Get customer info and sale items
    SELECT 
        s.customer_id,
        c.name,
        string_agg(
            COALESCE(srv.name, prd.name), 
            ', ' 
            ORDER BY si.created_at
        )
    INTO v_customer_id, v_customer_name, v_sale_items
    FROM sales s
    LEFT JOIN clients c ON c.id = s.customer_id
    LEFT JOIN sale_items si ON si.sale_id = s.id
    LEFT JOIN services srv ON srv.id = si.service_id
    LEFT JOIN products prd ON prd.id = si.product_id
    WHERE s.id = p_sale_id
    GROUP BY s.customer_id, c.name;

    -- Build description
    IF v_customer_name IS NOT NULL AND v_sale_items IS NOT NULL THEN
        -- Limit items to first 3
        v_description := 'Venda - ' || v_customer_name || ' (' || 
            CASE 
                WHEN length(v_sale_items) > 50 THEN substring(v_sale_items, 1, 47) || '...'
                ELSE v_sale_items
            END || ')';
    ELSIF v_customer_name IS NOT NULL THEN
        v_description := 'Venda - ' || v_customer_name;
    ELSE
        v_description := 'Venda #' || substring(p_sale_id::text, 1, 8);
    END IF;

    -- Process each payment
    FOR v_payment IN SELECT * FROM jsonb_array_elements(p_payments)
    LOOP
        v_method := v_payment->>'method';
        v_amount := (v_payment->>'amount')::NUMERIC;
        v_bank_account_id := NULLIF(v_payment->>'bankAccountId', '')::UUID;

        -- Wallet methods (credit/fiado) can have NULL bank_account_id
        IF v_method NOT IN ('credit', 'fiado') AND v_bank_account_id IS NULL THEN
            RAISE EXCEPTION 'Bank account ID is required for method: %', v_method;
        END IF;

        -- Insert cash movement
        INSERT INTO cash_movements (
            id,
            bank_account_id,
            amount,
            type,
            method,
            source_type,
            source_id,
            description,
            occurred_at,
            created_at
        ) VALUES (
            gen_random_uuid(),
            v_bank_account_id,
            v_amount,
            'IN',
            v_method,
            'SALE',
            p_sale_id,
            v_description,
            NOW() AT TIME ZONE 'America/Sao_Paulo',
            NOW()
        );

        -- If wallet payment, debit from customer credit
        IF v_method IN ('credit', 'fiado') THEN
            INSERT INTO credit_movements (
                id,
                customer_id,
                amount,
                type,
                note,
                sale_id,
                created_at
            ) VALUES (
                gen_random_uuid(),
                v_customer_id,
                v_amount,
                'DEBIT',
                v_description,
                p_sale_id,
                NOW()
            );
        END IF;
    END LOOP;

    -- Update sale status
    UPDATE sales 
    SET 
        status = 'paid',
        paid_at = NOW()
    WHERE id = p_sale_id;

    -- Update appointment status if exists
    UPDATE appointments
    SET status = 'completed'
    WHERE id = (SELECT appointment_id FROM sales WHERE id = p_sale_id)
    AND status = 'confirmed';
END;
$$ LANGUAGE plpgsql;
