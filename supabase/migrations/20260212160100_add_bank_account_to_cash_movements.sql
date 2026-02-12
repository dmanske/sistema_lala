-- Migration: Add bank_account_id to cash_movements
-- Description: Links each cash movement to a specific bank account
-- Date: 2026-02-12

-- Add bank_account_id column (nullable initially for migration)
ALTER TABLE cash_movements
ADD COLUMN bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE RESTRICT;

-- Create index for performance
CREATE INDEX idx_cash_movements_bank_account ON cash_movements(bank_account_id, occurred_at DESC);

-- Add comment
COMMENT ON COLUMN cash_movements.bank_account_id IS 'References the bank account where this movement occurred';
