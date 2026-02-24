-- Migration: Create abrir_caixa_rpc function
-- Description: RPC function to open a new cash register shift with validation
-- Date: 2026-02-24
-- Task: 1.3 Criar RPC abrir_caixa_rpc

CREATE OR REPLACE FUNCTION abrir_caixa_rpc(
    p_initial_balance NUMERIC,
    p_opened_by UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_tenant_id UUID;
    v_opened_by UUID;
    v_existing_open_register UUID;
    v_new_cash_register_id UUID;
BEGIN
    -- Get tenant_id from authenticated user's profile
    SELECT tenant_id INTO v_tenant_id
    FROM profiles
    WHERE id = auth.uid();

    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'User profile not found or tenant_id is null';
    END IF;

    -- Use provided opened_by or default to current user
    v_opened_by := COALESCE(p_opened_by, auth.uid());

    -- Validate initial balance is not negative
    IF p_initial_balance < 0 THEN
        RAISE EXCEPTION 'Initial balance cannot be negative: %', p_initial_balance;
    END IF;

    -- Check if there's already an OPEN cash register for this tenant
    SELECT id INTO v_existing_open_register
    FROM cash_registers
    WHERE tenant_id = v_tenant_id
      AND status = 'OPEN'
    LIMIT 1;

    IF v_existing_open_register IS NOT NULL THEN
        RAISE EXCEPTION 'There is already an open cash register for this tenant. Please close it before opening a new one. Cash Register ID: %', v_existing_open_register;
    END IF;

    -- Insert new cash register
    INSERT INTO cash_registers (
        tenant_id,
        opened_by,
        opened_at,
        initial_balance,
        status
    )
    VALUES (
        v_tenant_id,
        v_opened_by,
        now(),
        p_initial_balance,
        'OPEN'
    )
    RETURNING id INTO v_new_cash_register_id;

    -- Return the new cash register ID
    RETURN v_new_cash_register_id;

EXCEPTION
    WHEN OTHERS THEN
        -- Re-raise the exception with context
        RAISE EXCEPTION 'Error opening cash register: %', SQLERRM;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION abrir_caixa_rpc(NUMERIC, UUID) TO authenticated;

-- Add comment to function
COMMENT ON FUNCTION abrir_caixa_rpc(NUMERIC, UUID) IS 
'Opens a new cash register shift. Validates that no other cash register is currently open for the tenant. Returns the new cash_register_id.';
