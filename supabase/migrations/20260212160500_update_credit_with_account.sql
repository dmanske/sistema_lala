-- Migration: Update add_client_credit RPC to require bank_account_id
-- Description: Adds bank account parameter to credit recharge function
-- Date: 2026-02-12

CREATE OR REPLACE FUNCTION add_client_credit(
    p_client_id UUID,
    p_amount NUMERIC,
    p_origin TEXT, -- CASH, PIX, CARD, WALLET (WALLET ignora caixa)
    p_note TEXT DEFAULT NULL,
    p_bank_account_id UUID DEFAULT NULL
)
RETURNS UUID AS $
DECLARE
    v_credit_id UUID;
    v_tenant_id UUID;
    v_account_active BOOLEAN;
BEGIN
    -- Obter tenant_id do cliente
    SELECT tenant_id INTO v_tenant_id FROM clients WHERE id = p_client_id;
    
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Client not found';
    END IF;

    -- Inserir movimentação de crédito
    INSERT INTO credit_movements (tenant_id, client_id, type, amount, origin, note)
    VALUES (
        v_tenant_id,
        p_client_id,
        'CREDIT',
        p_amount,
        p_origin,
        p_note
    )
    RETURNING id INTO v_credit_id;

    -- Atualizar saldo do cliente
    UPDATE clients
    SET credit_balance = credit_balance + p_amount,
        updated_at = now()
    WHERE id = p_client_id;

    -- Lançar Entrada no Caixa (se for método monetário)
    IF p_origin IN ('CASH', 'PIX', 'CARD') THEN
        -- Validate bank account is required
        IF p_bank_account_id IS NULL THEN
            RAISE EXCEPTION 'Bank account ID is required for credit recharge';
        END IF;

        -- Validate bank account exists and is active
        SELECT is_active INTO v_account_active
        FROM bank_accounts
        WHERE id = p_bank_account_id AND tenant_id = v_tenant_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Bank account not found: %', p_bank_account_id;
        END IF;

        IF NOT v_account_active THEN
            RAISE EXCEPTION 'Bank account is inactive: %', p_bank_account_id;
        END IF;

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
            p_bank_account_id,
            'IN',
            p_amount,
            UPPER(p_origin),
            'CREDIT',
            v_credit_id,
            'Recarga de Crédito - Cliente #' || substring(p_client_id::text, 1, 8),
            now(),
            auth.uid()
        );
    END IF;

    RETURN v_credit_id;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;
