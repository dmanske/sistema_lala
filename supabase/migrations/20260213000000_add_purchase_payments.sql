-- Migration: Add Purchase Payments System
-- Description: Adds support for partial and multiple payments on purchases
-- Date: 2026-02-13

-- Add payment status to purchases table
ALTER TABLE purchases 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PARTIAL', 'PAID'));

-- Create purchase_payments table
CREATE TABLE IF NOT EXISTS purchase_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    purchase_id UUID NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
    bank_account_id UUID NOT NULL REFERENCES bank_accounts(id),
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    method VARCHAR(20) NOT NULL CHECK (method IN ('CASH', 'PIX', 'CARD', 'TRANSFER', 'WALLET')),
    paid_at TIMESTAMP NOT NULL DEFAULT NOW(),
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_purchase_payments_tenant ON purchase_payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_purchase_payments_purchase ON purchase_payments(purchase_id);
CREATE INDEX IF NOT EXISTS idx_purchase_payments_bank_account ON purchase_payments(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_purchase_payments_paid_at ON purchase_payments(paid_at);
CREATE INDEX IF NOT EXISTS idx_purchases_payment_status ON purchases(payment_status);

-- Enable RLS
ALTER TABLE purchase_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for purchase_payments
CREATE POLICY "Users can view their tenant's purchase payments"
    ON purchase_payments FOR SELECT
    USING (tenant_id = get_my_tenant_id());

CREATE POLICY "Users can insert purchase payments for their tenant"
    ON purchase_payments FOR INSERT
    WITH CHECK (tenant_id = get_my_tenant_id());

CREATE POLICY "Users can update their tenant's purchase payments"
    ON purchase_payments FOR UPDATE
    USING (tenant_id = get_my_tenant_id());

CREATE POLICY "Users can delete their tenant's purchase payments"
    ON purchase_payments FOR DELETE
    USING (tenant_id = get_my_tenant_id());

-- Trigger for updated_at
CREATE TRIGGER update_purchase_payments_updated_at
    BEFORE UPDATE ON purchase_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to register purchase payment
CREATE OR REPLACE FUNCTION register_purchase_payment(
    p_purchase_id UUID,
    p_bank_account_id UUID,
    p_amount DECIMAL,
    p_method VARCHAR,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tenant_id UUID;
    v_user_id UUID;
    v_payment_id UUID;
    v_purchase_total DECIMAL;
    v_total_paid DECIMAL;
    v_new_status VARCHAR;
    v_supplier_id UUID;
    v_supplier_name VARCHAR;
    v_method_pt VARCHAR;
BEGIN
    -- Get tenant and user
    v_tenant_id := get_my_tenant_id();
    v_user_id := auth.uid();
    
    -- Validate purchase exists and belongs to tenant
    SELECT total, supplier_id INTO v_purchase_total, v_supplier_id
    FROM purchases
    WHERE id = p_purchase_id AND tenant_id = v_tenant_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Purchase not found';
    END IF;
    
    -- Validate bank account exists and is active
    IF NOT EXISTS (
        SELECT 1 FROM bank_accounts 
        WHERE id = p_bank_account_id 
        AND tenant_id = v_tenant_id 
        AND is_active = true
    ) THEN
        RAISE EXCEPTION 'Bank account not found or inactive';
    END IF;
    
    -- Get supplier name
    SELECT name INTO v_supplier_name
    FROM suppliers
    WHERE id = v_supplier_id;
    
    -- Translate payment method to Portuguese
    v_method_pt := CASE p_method
        WHEN 'CASH' THEN 'Dinheiro'
        WHEN 'PIX' THEN 'PIX'
        WHEN 'CARD' THEN 'Cartão'
        WHEN 'TRANSFER' THEN 'Transferência'
        WHEN 'WALLET' THEN 'Carteira'
        ELSE p_method
    END;
    
    -- Insert payment record
    INSERT INTO purchase_payments (
        tenant_id,
        purchase_id,
        bank_account_id,
        amount,
        method,
        notes,
        created_by
    ) VALUES (
        v_tenant_id,
        p_purchase_id,
        p_bank_account_id,
        p_amount,
        p_method,
        p_notes,
        v_user_id
    ) RETURNING id INTO v_payment_id;
    
    -- Create cash movement (OUT)
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
    ) VALUES (
        v_tenant_id,
        p_bank_account_id,
        'OUT',
        p_amount,
        p_method,
        'PURCHASE',
        p_purchase_id,
        'Compra - ' || v_method_pt || ' - ' || COALESCE(v_supplier_name, 'Fornecedor'),
        NOW(),
        v_user_id
    );
    
    -- Calculate total paid
    SELECT COALESCE(SUM(amount), 0) INTO v_total_paid
    FROM purchase_payments
    WHERE purchase_id = p_purchase_id;
    
    -- Determine new payment status
    IF v_total_paid >= v_purchase_total THEN
        v_new_status := 'PAID';
    ELSIF v_total_paid > 0 THEN
        v_new_status := 'PARTIAL';
    ELSE
        v_new_status := 'PENDING';
    END IF;
    
    -- Update purchase payment status
    UPDATE purchases
    SET payment_status = v_new_status,
        updated_at = NOW()
    WHERE id = p_purchase_id;
    
    RETURN v_payment_id;
END;
$$;

-- Function to delete purchase payment (with cash movement reversal)
CREATE OR REPLACE FUNCTION delete_purchase_payment(
    p_payment_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tenant_id UUID;
    v_purchase_id UUID;
    v_purchase_total DECIMAL;
    v_total_paid DECIMAL;
    v_new_status VARCHAR;
BEGIN
    -- Get tenant
    v_tenant_id := get_my_tenant_id();
    
    -- Get payment info
    SELECT purchase_id INTO v_purchase_id
    FROM purchase_payments
    WHERE id = p_payment_id AND tenant_id = v_tenant_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payment not found';
    END IF;
    
    -- Delete associated cash movement
    DELETE FROM cash_movements
    WHERE source_type = 'PURCHASE'
    AND source_id = v_purchase_id
    AND tenant_id = v_tenant_id
    AND created_at = (
        SELECT created_at FROM purchase_payments WHERE id = p_payment_id
    );
    
    -- Delete payment
    DELETE FROM purchase_payments
    WHERE id = p_payment_id;
    
    -- Recalculate payment status
    SELECT total INTO v_purchase_total
    FROM purchases
    WHERE id = v_purchase_id;
    
    SELECT COALESCE(SUM(amount), 0) INTO v_total_paid
    FROM purchase_payments
    WHERE purchase_id = v_purchase_id;
    
    IF v_total_paid >= v_purchase_total THEN
        v_new_status := 'PAID';
    ELSIF v_total_paid > 0 THEN
        v_new_status := 'PARTIAL';
    ELSE
        v_new_status := 'PENDING';
    END IF;
    
    UPDATE purchases
    SET payment_status = v_new_status,
        updated_at = NOW()
    WHERE id = v_purchase_id;
    
    RETURN TRUE;
END;
$$;

-- Migrate existing purchases with payment data
UPDATE purchases
SET payment_status = CASE
    WHEN paid_at IS NOT NULL THEN 'PAID'
    ELSE 'PENDING'
END
WHERE payment_status IS NULL;

-- Migrate existing paid purchases to purchase_payments table
INSERT INTO purchase_payments (
    tenant_id,
    purchase_id,
    bank_account_id,
    amount,
    method,
    paid_at,
    created_at
)
SELECT 
    p.tenant_id,
    p.id,
    COALESCE(
        (SELECT id FROM bank_accounts WHERE tenant_id = p.tenant_id AND name = 'Caixa Geral' LIMIT 1),
        (SELECT id FROM bank_accounts WHERE tenant_id = p.tenant_id LIMIT 1)
    ) as bank_account_id,
    p.paid_amount,
    p.payment_method,
    p.paid_at,
    p.paid_at
FROM purchases p
WHERE p.paid_at IS NOT NULL
AND p.payment_method IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM purchase_payments pp WHERE pp.purchase_id = p.id
);

-- Add comment
COMMENT ON TABLE purchase_payments IS 'Stores payment records for purchases, supporting partial and multiple payments';
COMMENT ON COLUMN purchases.payment_status IS 'Payment status: PENDING (not paid), PARTIAL (partially paid), PAID (fully paid)';
