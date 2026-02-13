-- ============================================================
-- MIGRATION: Stock Health Monitoring
-- Description: View e função para monitorar saúde do estoque
-- Date: 2026-02-13
-- ============================================================

-- ============================================================
-- VIEW: stock_discrepancies
-- ============================================================
-- View somente leitura que mostra produtos com divergências
-- entre cache e movimentações (se houver)
-- ============================================================

CREATE OR REPLACE VIEW stock_discrepancies AS
SELECT 
    p.tenant_id,
    t.name as tenant_name,
    p.id as product_id,
    p.name as product_name,
    p.current_stock as cached_stock,
    COALESCE(SUM(
        CASE 
            WHEN pm.type = 'IN' THEN pm.quantity
            WHEN pm.type = 'OUT' THEN -pm.quantity
        END
    ), 0) as computed_stock,
    p.current_stock - COALESCE(SUM(
        CASE 
            WHEN pm.type = 'IN' THEN pm.quantity
            WHEN pm.type = 'OUT' THEN -pm.quantity
        END
    ), 0) as diff,
    ABS(p.current_stock - COALESCE(SUM(
        CASE 
            WHEN pm.type = 'IN' THEN pm.quantity
            WHEN pm.type = 'OUT' THEN -pm.quantity
        END
    ), 0)) as absolute_diff,
    p.last_movement,
    (SELECT COUNT(*) FROM product_movements WHERE product_id = p.id) as movement_count,
    p.updated_at
FROM products p
INNER JOIN tenants t ON p.tenant_id = t.id
LEFT JOIN product_movements pm ON p.id = pm.product_id
GROUP BY p.id, p.tenant_id, t.name, p.name, p.current_stock, p.last_movement, p.updated_at
HAVING p.current_stock != COALESCE(SUM(
    CASE 
        WHEN pm.type = 'IN' THEN pm.quantity
        WHEN pm.type = 'OUT' THEN -pm.quantity
    END
), 0)
ORDER BY absolute_diff DESC;

-- ============================================================
-- FUNÇÃO: stock_health
-- ============================================================
-- Retorna estatísticas de saúde do estoque
-- ============================================================

CREATE OR REPLACE FUNCTION stock_health(p_tenant_id UUID DEFAULT NULL)
RETURNS TABLE (
    metric TEXT,
    value BIGINT,
    details TEXT
) AS $
DECLARE
    v_total_products BIGINT;
    v_products_with_discrepancy BIGINT;
    v_total_absolute_diff BIGINT;
    v_percentage NUMERIC;
BEGIN
    -- Contar total de produtos
    SELECT COUNT(*)
    INTO v_total_products
    FROM products p
    WHERE (p_tenant_id IS NULL OR p.tenant_id = p_tenant_id);
    
    -- Contar produtos com divergência
    SELECT COUNT(*)
    INTO v_products_with_discrepancy
    FROM stock_discrepancies sd
    WHERE (p_tenant_id IS NULL OR sd.tenant_id = p_tenant_id);
    
    -- Somar divergências absolutas
    SELECT COALESCE(SUM(absolute_diff), 0)
    INTO v_total_absolute_diff
    FROM stock_discrepancies sd
    WHERE (p_tenant_id IS NULL OR sd.tenant_id = p_tenant_id);
    
    -- Calcular percentual
    IF v_total_products > 0 THEN
        v_percentage := ROUND(100.0 * v_products_with_discrepancy / v_total_products, 2);
    ELSE
        v_percentage := 0;
    END IF;
    
    -- Retornar métricas
    metric := 'total_products';
    value := v_total_products;
    details := 'Total de produtos cadastrados';
    RETURN NEXT;
    
    metric := 'products_with_discrepancy';
    value := v_products_with_discrepancy;
    details := 'Produtos com divergência de estoque';
    RETURN NEXT;
    
    metric := 'discrepancy_percentage';
    value := v_percentage::BIGINT;
    details := 'Percentual de produtos com divergência';
    RETURN NEXT;
    
    metric := 'total_absolute_diff';
    value := v_total_absolute_diff;
    details := 'Soma total de divergências (valor absoluto)';
    RETURN NEXT;
    
    -- Status geral
    IF v_products_with_discrepancy = 0 THEN
        metric := 'health_status';
        value := 100;
        details := '✅ SAUDÁVEL - Nenhuma divergência detectada';
    ELSIF v_percentage < 5 THEN
        metric := 'health_status';
        value := 75;
        details := '⚠️ ATENÇÃO - Poucas divergências detectadas';
    ELSIF v_percentage < 20 THEN
        metric := 'health_status';
        value := 50;
        details := '🚨 ALERTA - Divergências significativas detectadas';
    ELSE
        metric := 'health_status';
        value := 0;
        details := '🔴 CRÍTICO - Muitas divergências detectadas';
    END IF;
    RETURN NEXT;
    
    RETURN;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- COMENTÁRIOS E PERMISSÕES
-- ============================================================
COMMENT ON VIEW stock_discrepancies IS 
'View que mostra produtos com divergências entre current_stock e movimentações. 
Deve estar sempre vazia se os triggers estiverem funcionando corretamente.';

COMMENT ON FUNCTION stock_health IS 
'Retorna estatísticas de saúde do estoque. Use para monitoramento e alertas.';

-- Permitir leitura da view
GRANT SELECT ON stock_discrepancies TO authenticated;

-- Permitir execução da função
GRANT EXECUTE ON FUNCTION stock_health TO authenticated;

-- ============================================================
-- EXEMPLOS DE USO:
-- ============================================================
-- 1. Ver todas as divergências (deve estar vazio):
--    SELECT * FROM stock_discrepancies;
--
-- 2. Ver divergências de um tenant específico:
--    SELECT * FROM stock_discrepancies WHERE tenant_id = 'uuid-here';
--
-- 3. Verificar saúde geral do estoque:
--    SELECT * FROM stock_health();
--
-- 4. Verificar saúde de um tenant específico:
--    SELECT * FROM stock_health('tenant-uuid-here');
--
-- 5. Monitoramento contínuo (executar periodicamente):
--    SELECT 
--        (SELECT value FROM stock_health() WHERE metric = 'products_with_discrepancy') as discrepancies,
--        (SELECT details FROM stock_health() WHERE metric = 'health_status') as status;
-- ============================================================

-- ============================================================
-- INTEGRAÇÃO COM MONITORAMENTO EXTERNO
-- ============================================================
-- Para integrar com sistemas de monitoramento (Sentry, Datadog, etc):
--
-- 1. Criar um cron job que executa periodicamente:
--    SELECT * FROM stock_health();
--
-- 2. Se products_with_discrepancy > 0, enviar alerta
--
-- 3. Executar reconciliação automática se necessário:
--    SELECT * FROM reconcile_product_stock(NULL, FALSE);
-- ============================================================
