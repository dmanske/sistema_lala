-- Migration: Create bank_accounts table
-- Description: Adds bank accounts management system for tracking where money is stored
-- Date: 2026-02-12

-- Create bank_accounts table
CREATE TABLE IF NOT EXISTS bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('BANK', 'CARD', 'WALLET')),
    initial_balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT bank_accounts_name_not_empty CHECK (TRIM(name) <> ''),
    CONSTRAINT bank_accounts_name_length CHECK (LENGTH(TRIM(name)) <= 100)
);

-- Create indices for performance
CREATE INDEX idx_bank_accounts_tenant_id ON bank_accounts(tenant_id);
CREATE INDEX idx_bank_accounts_tenant_active ON bank_accounts(tenant_id, is_active);

-- Enable Row Level Security
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tenant isolation
CREATE POLICY "Users can view their tenant's bank accounts"
    ON bank_accounts FOR SELECT
    USING (tenant_id = auth.jwt() -> 'app_metadata' ->> 'tenant_id'::UUID);

CREATE POLICY "Users can insert bank accounts for their tenant"
    ON bank_accounts FOR INSERT
    WITH CHECK (tenant_id = auth.jwt() -> 'app_metadata' ->> 'tenant_id'::UUID);

CREATE POLICY "Users can update their tenant's bank accounts"
    ON bank_accounts FOR UPDATE
    USING (tenant_id = auth.jwt() -> 'app_metadata' ->> 'tenant_id'::UUID);

CREATE POLICY "Users can delete their tenant's bank accounts"
    ON bank_accounts FOR DELETE
    USING (tenant_id = auth.jwt() -> 'app_metadata' ->> 'tenant_id'::UUID);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_bank_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_bank_accounts_updated_at
    BEFORE UPDATE ON bank_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_bank_accounts_updated_at();

-- Add comment
COMMENT ON TABLE bank_accounts IS 'Stores bank accounts, cards, and digital wallets where money is kept';
