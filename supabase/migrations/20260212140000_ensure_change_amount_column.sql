-- Migration: Ensure change_amount column exists in sale_payments
-- Date: 2026-02-12

ALTER TABLE sale_payments 
ADD COLUMN IF NOT EXISTS change_amount NUMERIC(10, 2) DEFAULT 0.00;
