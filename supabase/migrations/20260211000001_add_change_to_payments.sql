-- Add change_amount to sale_payments table
ALTER TABLE sale_payments ADD COLUMN change_amount DECIMAL(10, 2) DEFAULT 0.00;
