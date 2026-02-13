-- ============================================================
-- MIGRATION: Stock Auto-Sync Triggers
-- Description: Triggers para manter current_stock sincronizado
-- Date: 2026-02-13
-- Strategy: Trigger-based cache (Estratégia A)
-- ============================================================

-- ============================================================
-- FUNÇÃO: sync_product_stock_on_movement
-- ============================================================
-- Atualiza automaticamente products.current_stock quando
-- product_movements é inserido, atualizado ou deletado
-- ============================================================

CREATE OR REPLACE FUNCTION sync_product_stock_on_movement()
RETURNS TRIGGER AS $
DECLARE
    v_delta INTEGER := 0;
BEGIN
    -- ============================================================
    -- CASO 1: INSERT - Adicionar movimento
    -- ============================================================
    IF TG_OP = 'INSERT' THEN
        -- Calcular delta baseado no tipo de movimento
        IF NEW.type = 'IN' THEN
            v_delta := NEW.quantity;
        ELSIF NEW.type = 'OUT' THEN
            v_delta := -NEW.quantity;
        END IF;
        
        -- Aplicar delta ao estoque
        UPDATE products
        SET 
            current_stock = current_stock + v_delta,
            last_movement = NEW.created_at,
            updated_at = NOW()
        WHERE id = NEW.product_id;
        
        RETURN NEW;
    
    -- ============================================================
    -- CASO 2: UPDATE - Modificar movimento existente
    -- ============================================================
    ELSIF TG_OP = 'UPDATE' THEN
        -- Calcular delta OLD (reverter)
        IF OLD.type = 'IN' THEN
            v_delta := -OLD.quantity;
        ELSIF OLD.type = 'OUT' THEN
            v_delta := OLD.quantity;
        END IF;
        
        -- Aplicar reversão do OLD
        UPDATE products
        SET current_stock = current_stock + v_delta
        WHERE id = OLD.product_id;
        
        -- Calcular delta NEW (aplicar)
        IF NEW.type = 'IN' THEN
            v_delta := NEW.quantity;
        ELSIF NEW.type = 'OUT' THEN
            v_delta := -NEW.quantity;
        END IF;
        
        -- Aplicar novo delta
        UPDATE products
        SET 
            current_stock = current_stock + v_delta,
            last_movement = NEW.created_at,
            updated_at = NOW()
        WHERE id = NEW.product_id;
        
        RETURN NEW;
    
    -- ============================================================
    -- CASO 3: DELETE - Remover movimento
    -- ============================================================
    ELSIF TG_OP = 'DELETE' THEN
        -- Calcular delta reverso
        IF OLD.type = 'IN' THEN
            v_delta := -OLD.quantity;
        ELSIF OLD.type = 'OUT' THEN
            v_delta := OLD.quantity;
        END IF;
        
        -- Reverter delta
        UPDATE products
        SET 
            current_stock = current_stock + v_delta,
            updated_at = NOW()
        WHERE id = OLD.product_id;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- TRIGGER: Sincronizar estoque após INSERT
-- ============================================================
DROP TRIGGER IF EXISTS trigger_sync_stock_after_insert ON product_movements;
CREATE TRIGGER trigger_sync_stock_after_insert
    AFTER INSERT ON product_movements
    FOR EACH ROW
    EXECUTE FUNCTION sync_product_stock_on_movement();

-- ============================================================
-- TRIGGER: Sincronizar estoque após UPDATE
-- ============================================================
DROP TRIGGER IF EXISTS trigger_sync_stock_after_update ON product_movements;
CREATE TRIGGER trigger_sync_stock_after_update
    AFTER UPDATE ON product_movements
    FOR EACH ROW
    EXECUTE FUNCTION sync_product_stock_on_movement();

-- ============================================================
-- TRIGGER: Sincronizar estoque após DELETE
-- ============================================================
DROP TRIGGER IF EXISTS trigger_sync_stock_after_delete ON product_movements;
CREATE TRIGGER trigger_sync_stock_after_delete
    AFTER DELETE ON product_movements
    FOR EACH ROW
    EXECUTE FUNCTION sync_product_stock_on_movement();

-- ============================================================
-- COMENTÁRIOS
-- ============================================================
COMMENT ON FUNCTION sync_product_stock_on_movement IS 
'Mantém products.current_stock sincronizado automaticamente com product_movements. 
Trigger executado em INSERT, UPDATE e DELETE de movimentações.';

-- ============================================================
-- VALIDAÇÃO DOS TRIGGERS
-- ============================================================
-- Para testar se os triggers estão funcionando:
--
-- 1. Inserir movimento IN:
--    INSERT INTO product_movements (tenant_id, product_id, type, quantity, reason)
--    VALUES ('tenant-id', 'product-id', 'IN', 10, 'Teste');
--    -- Verificar: current_stock deve aumentar em 10
--
-- 2. Inserir movimento OUT:
--    INSERT INTO product_movements (tenant_id, product_id, type, quantity, reason)
--    VALUES ('tenant-id', 'product-id', 'OUT', 5, 'Teste');
--    -- Verificar: current_stock deve diminuir em 5
--
-- 3. Atualizar movimento:
--    UPDATE product_movements SET quantity = 15 WHERE id = 'movement-id';
--    -- Verificar: current_stock deve refletir nova quantidade
--
-- 4. Deletar movimento:
--    DELETE FROM product_movements WHERE id = 'movement-id';
--    -- Verificar: current_stock deve reverter
-- ============================================================

-- ============================================================
-- IMPORTANTE: COMPATIBILIDADE COM RPCs EXISTENTES
-- ============================================================
-- Os RPCs existentes (pay_sale, refund_sale, create_purchase_with_movements)
-- já criam movimentações em product_movements.
-- 
-- Com estes triggers, NÃO é mais necessário atualizar current_stock
-- manualmente nos RPCs, pois os triggers farão isso automaticamente.
-- 
-- PORÉM, para manter compatibilidade e evitar quebrar código existente,
-- os RPCs continuarão funcionando (o UPDATE manual será sobrescrito
-- pelo trigger, mas o resultado final será o mesmo).
-- 
-- RECOMENDAÇÃO FUTURA: Remover UPDATEs manuais de current_stock dos RPCs
-- para evitar operações duplicadas (mas não é urgente).
-- ============================================================
