-- Migration: Interligar Crédito com Livro Caixa
-- Date: 2026-02-12

-- Atualizar enum source_type para incluir CREDIT
ALTER TABLE cash_movements DROP CONSTRAINT IF EXISTS cash_movements_source_type_check;
ALTER TABLE cash_movements ADD CONSTRAINT cash_movements_source_type_check 
    CHECK (source_type IN ('SALE', 'REFUND', 'PURCHASE', 'MANUAL', 'CREDIT'));

-- RPC Atualizada: Adicionar crédito e lançar no caixa
CREATE OR REPLACE FUNCTION add_client_credit(
    p_client_id UUID,
    p_amount NUMERIC,
    p_origin TEXT, -- CASH, PIX, CARD, WALLET (WALLET ignora caixa)
    p_note TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_credit_id UUID;
    v_tenant_id UUID;
    v_source_type TEXT;
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
