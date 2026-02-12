-- Migration: Create default bank accounts and link existing movements
-- Description: Creates "Caixa Geral" account for each tenant and links existing cash movements
-- Date: 2026-02-12

-- Insert default "Caixa Geral" account for each tenant
INSERT INTO bank_accounts (tenant_id, name, type, initial_balance, is_active)
SELECT 
    id as tenant_id,
    'Caixa Geral' as name,
    'BANK' as type,
    0 as initial_balance,
    true as is_active
FROM tenants
WHERE NOT EXISTS (
    SELECT 1 FROM bank_accounts WHERE bank_accounts.tenant_id = tenants.id
);

-- Update existing cash_movements to link to default account
UPDATE cash_movements cm
SET bank_account_id = (
    SELECT ba.id
    FROM bank_accounts ba
    WHERE ba.tenant_id = cm.tenant_id
    AND ba.name = 'Caixa Geral'
    LIMIT 1
)
WHERE bank_account_id IS NULL;

-- Make bank_account_id NOT NULL now that all movements are linked
ALTER TABLE cash_movements
ALTER COLUMN bank_account_id SET NOT NULL;

-- Add comment
COMMENT ON TABLE bank_accounts IS 'Bank accounts, cards, and wallets. Each tenant gets a default "Caixa Geral" account.';
