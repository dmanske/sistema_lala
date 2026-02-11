-- Reconciliation migration to bring old data to the cash ledger
-- This is necessary because the cash_movements table was introduced after existing data was created.

-- 1. Backfill Sales
-- Inserts movements for old paid sales that were not recorded in cash_movements
INSERT INTO cash_movements (
    tenant_id, type, amount, method, source_type, source_id, description, occurred_at, created_by
)
SELECT 
    s.tenant_id,
    'IN',
    sp.amount,
    UPPER(sp.method),
    'SALE',
    s.id,
    'Venda #' || substring(s.id::text, 1, 8) || ' (Sincronização)',
    sp.paid_at,
    NULL -- passing NULL because s.created_by is text and cm.created_by is uuid
FROM sales s
JOIN sale_payments sp ON s.id = sp.sale_id
WHERE s.status = 'paid'
  -- Only methods that touch the cash register
  AND sp.method IN ('pix', 'card', 'cash', 'transfer', 'wallet')
  -- Avoid duplicates (idempotency)
  AND NOT EXISTS (
      SELECT 1 FROM cash_movements cm 
      WHERE cm.source_id = s.id AND cm.source_type = 'SALE'
  );

-- 2. Backfill Purchases
-- Inserts movements for old paid purchases
INSERT INTO cash_movements (
    tenant_id, type, amount, method, source_type, source_id, description, occurred_at, created_by
)
SELECT 
    p.tenant_id,
    'OUT',
    p.paid_amount,
    UPPER(p.payment_method),
    'PURCHASE',
    p.id,
    'Compra #' || substring(p.id::text, 1, 8) || ' (Sincronização)',
    COALESCE(p.paid_at, p.date::timestamptz),
    NULL -- Or some default system ID if needed
FROM purchases p
WHERE p.paid_amount > 0 
  AND p.payment_method IS NOT NULL
  -- Avoid duplicates
  AND NOT EXISTS (
      SELECT 1 FROM cash_movements cm 
      WHERE cm.source_id = p.id AND cm.source_type = 'PURCHASE'
  );
