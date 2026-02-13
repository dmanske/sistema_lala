-- Migration: Update existing purchase descriptions
-- Description: Update old purchase descriptions to include supplier name and payment method
-- Date: 2026-02-12

UPDATE cash_movements cm
SET description = 'Compra - ' || 
    CASE LOWER(cm.method)
        WHEN 'pix' THEN 'PIX'
        WHEN 'card' THEN 'Cartão'
        WHEN 'cash' THEN 'Dinheiro'
        WHEN 'transfer' THEN 'Transferência'
        WHEN 'wallet' THEN 'Carteira'
        ELSE UPPER(cm.method)
    END || ' - ' || COALESCE(s.name, 'Fornecedor não identificado')
FROM purchases p
LEFT JOIN suppliers s ON s.id = p.supplier_id
WHERE cm.source_type = 'PURCHASE'
  AND cm.source_id = p.id
  AND cm.description LIKE 'Compra #%';
