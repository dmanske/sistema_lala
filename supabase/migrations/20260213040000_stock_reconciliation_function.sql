-- ============================================================
-- MIGRATION: Stock Reconciliation Function
-- Description: Função para reconciliar estoque (corrigir cache)
-- Date: 2026-02-13
-- ============================================================

-- ============================================================
-- FUNÇÃO: reconcile_product_stock
-- ============================================================
-- Reconcilia o estoque de produtos corrigindo o cache (current_stock)
-- baseado nas movimentações reais (product_movements)
--
-- Parâmetros:
--   p_tenant_id: UUID do tenant (NULL = todos os tenants)
--   p_dry_run: Se TRUE, apenas retorna discrepâncias sem alterar
--
-- Retorna: Tabela com produtos reconciliados e suas correções
-- ============================================================

CREATE OR REPLACE FUNCTION reconcile_product_stock(
    p_tenant_id UUID DEFAULT NULL,
    p_dry_run BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
    tenant_id UUID,
    product_id UUID,
    product_name TEXT,
    old_stock INTEGER,
    computed_stock BIGINT,
    diff INTEGER,
    corrected BOOLEAN
) AS $
DECLARE
    v_product RECORD;
    v_computed_stock BIGINT;
    v_rows_affected INTEGER := 0;
BEGIN
    -- Loop através de todos os produtos (filtrado por tenant se especificado)
    FOR v_product IN
        SELECT 
            p.id,
            p.tenant_id,
            p.name,
            p.current_stock
        FROM products p
        WHERE (p_tenant_id IS NULL OR p.tenant_id = p_tenant_id)
        ORDER BY p.tenant_id, p.name
    LOOP
        -- Calcular estoque real baseado em movimentações
        SELECT COALESCE(SUM(
            CASE 
                WHEN pm.type = 'IN' THEN pm.quantity
                WHEN pm.type = 'OUT' THEN -pm.quantity
            END
        ), 0)
        INTO v_computed_stock
        FROM product_movements pm
        WHERE pm.product_id = v_product.id;

        -- Se há divergência
        IF v_product.current_stock != v_computed_stock THEN
            -- Retornar linha com informação da divergência
            tenant_id := v_product.tenant_id;
            product_id := v_product.id;
            product_name := v_product.name;
            old_stock := v_product.current_stock;
            computed_stock := v_computed_stock;
            diff := v_product.current_stock - v_computed_stock;
            
            -- Se não for dry-run, aplicar correção
            IF NOT p_dry_run THEN
                UPDATE products
                SET 
                    current_stock = v_computed_stock,
                    last_movement = NOW(),
                    updated_at = NOW()
                WHERE id = v_product.id;
                
                corrected := TRUE;
                v_rows_affected := v_rows_affected + 1;
            ELSE
                corrected := FALSE;
            END IF;
            
            RETURN NEXT;
        END IF;
    END LOOP;

    -- Log de execução
    RAISE NOTICE 'Reconciliation completed. Rows affected: %, Dry run: %', v_rows_affected, p_dry_run;
    
    RETURN;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- COMENTÁRIOS E PERMISSÕES
-- ============================================================
COMMENT ON FUNCTION reconcile_product_stock IS 
'Reconcilia estoque de produtos corrigindo current_stock baseado em product_movements. 
Use p_dry_run=true para preview, p_dry_run=false para aplicar correções.';

-- Permitir execução por usuários autenticados
GRANT EXECUTE ON FUNCTION reconcile_product_stock TO authenticated;

-- ============================================================
-- EXEMPLO DE USO:
-- ============================================================
-- 1. Preview de divergências (não altera dados):
--    SELECT * FROM reconcile_product_stock(NULL, TRUE);
--
-- 2. Preview para um tenant específico:
--    SELECT * FROM reconcile_product_stock('tenant-uuid-here', TRUE);
--
-- 3. Aplicar correções em todos os tenants:
--    SELECT * FROM reconcile_product_stock(NULL, FALSE);
--
-- 4. Aplicar correções em um tenant específico:
--    SELECT * FROM reconcile_product_stock('tenant-uuid-here', FALSE);
-- ============================================================

-- ============================================================
-- VALIDAÇÃO PÓS-RECONCILIAÇÃO
-- ============================================================
-- Após executar reconciliação, validar que não há mais divergências:
-- 
-- SELECT COUNT(*) as remaining_discrepancies
-- FROM (
--     SELECT 
--         p.id,
--         p.current_stock,
--         COALESCE(SUM(
--             CASE 
--                 WHEN pm.type = 'IN' THEN pm.quantity
--                 WHEN pm.type = 'OUT' THEN -pm.quantity
--             END
--         ), 0) as computed
--     FROM products p
--     LEFT JOIN product_movements pm ON p.id = pm.product_id
--     GROUP BY p.id, p.current_stock
--     HAVING p.current_stock != COALESCE(SUM(
--         CASE 
--             WHEN pm.type = 'IN' THEN pm.quantity
--             WHEN pm.type = 'OUT' THEN -pm.quantity
--         END
--     ), 0)
-- ) discrepancies;
-- 
-- Resultado esperado: 0
-- ============================================================
