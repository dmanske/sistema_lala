-- Migration: Update sale_payments method constraint
-- Date: 2026-02-12

-- Drop existing constraint
ALTER TABLE sale_payments DROP CONSTRAINT IF EXISTS sale_payments_method_check;

-- Recreate constraint with WALLET included and allow uppercase for robustness
ALTER TABLE sale_payments 
    ADD CONSTRAINT sale_payments_method_check 
    CHECK (LOWER(method) IN ('pix', 'card', 'cash', 'transfer', 'credit', 'fiado', 'wallet'));
