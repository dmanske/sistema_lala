-- Migration: Update product movement descriptions for purchases
-- Description: Simplify purchase descriptions in product movements
-- Date: 2026-02-12

UPDATE product_movements
SET reason = 'Compra'
WHERE reason LIKE 'Compra #%'
  AND reference_type = 'PURCHASE';
