-- ============================================================
-- AUDITORIA DE ESTOQUE - DIAGNÓSTICO DE INCONSISTÊNCIAS
-- Data: 2026-02-13
-- Objetivo: Identificar divergências entre cache e movimentações
-- ============================================================

-- ============================================================
-- 1. QUERY PRINCIPAL: Discrepâncias por Produto
-- ============================================================
-- Lista todos os produtos com divergência entre cache e movimentações
SELECT 
    p.tenant_id,
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
    p.last_movement as last_movement_at,
    (SELECT COUNT(*) FROM product_movements WHERE product_id = p.id) as movement_count
FROM products p
LEFT JOIN product_movements pm ON p.id = pm.product_id
GROUP BY p.id, p.tenant_id, p.name, p.current_stock, p.last_movement
HAVING p.current_stock != COALESCE(SUM(
    CASE 
        WHEN pm.type = 'IN' THEN pm.quantity
        WHEN pm.type = 'OUT' THEN -pm.quantity
    END
), 0)
ORDER BY ABS(p.current_stock - COALESCE(SUM(
    CASE 
        WHEN pm.type = 'IN' THEN pm.quantity
        WHEN pm.type = 'OUT' THEN -pm.quantity
    END
), 0)) DESC;

-- ============================================================
-- 2. RESUMO: Contagem de Divergências por Tenant
-- ============================================================
SELECT 
    t.id as tenant_id,
    t.name as tenant_name,
    COUNT(DISTINCT p.id) as products_with_discrepancy,
    SUM(ABS(p.current_stock - COALESCE(SUM(
        CASE 
            WHEN pm.type = 'IN' THEN pm.quantity
            WHEN pm.type = 'OUT' THEN -pm.quantity
        END
    ), 0))) as total_absolute_diff
FROM tenants t
LEFT JOIN products p ON t.id = p.tenant_id
LEFT JOIN product_movements pm ON p.id = pm.product_id
GROUP BY t.id, t.name, p.id, p.current_stock
HAVING p.current_stock != COALESCE(SUM(
    CASE 
        WHEN pm.type = 'IN' THEN pm.quantity
        WHEN pm.type = 'OUT' THEN -pm.quantity
    END
), 0)
ORDER BY products_with_discrepancy DESC;

-- ============================================================
-- 3. TOP 20 MAIORES DIVERGÊNCIAS
-- ============================================================
SELECT 
    p.tenant_id,
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
    ), 0)) as absolute_diff
FROM products p
LEFT JOIN product_movements pm ON p.id = pm.product_id
GROUP BY p.id, p.tenant_id, p.name, p.current_stock
HAVING p.current_stock != COALESCE(SUM(
    CASE 
        WHEN pm.type = 'IN' THEN pm.quantity
        WHEN pm.type = 'OUT' THEN -pm.quantity
    END
), 0)
ORDER BY absolute_diff DESC
LIMIT 20;

-- ============================================================
-- 4. ESTATÍSTICAS GERAIS
-- ============================================================
SELECT 
    COUNT(*) as total_products,
    COUNT(CASE WHEN has_discrepancy THEN 1 END) as products_with_discrepancy,
    ROUND(100.0 * COUNT(CASE WHEN has_discrepancy THEN 1 END) / COUNT(*), 2) as discrepancy_percentage,
    SUM(CASE WHEN has_discrepancy THEN absolute_diff ELSE 0 END) as total_absolute_diff
FROM (
    SELECT 
        p.id,
        p.current_stock != COALESCE(SUM(
            CASE 
                WHEN pm.type = 'IN' THEN pm.quantity
                WHEN pm.type = 'OUT' THEN -pm.quantity
            END
        ), 0) as has_discrepancy,
        ABS(p.current_stock - COALESCE(SUM(
            CASE 
                WHEN pm.type = 'IN' THEN pm.quantity
                WHEN pm.type = 'OUT' THEN -pm.quantity
            END
        ), 0)) as absolute_diff
    FROM products p
    LEFT JOIN product_movements pm ON p.id = pm.product_id
    GROUP BY p.id, p.current_stock
) stats;

-- ============================================================
-- INSTRUÇÕES DE USO:
-- ============================================================
-- 1. Execute cada query separadamente no SQL Editor do Supabase
-- 2. A primeira query mostra TODAS as divergências
-- 3. A segunda mostra resumo por tenant
-- 4. A terceira mostra as 20 maiores divergências
-- 5. A quarta mostra estatísticas gerais
-- 
-- IMPORTANTE: Salve os resultados antes de executar reconciliação!
-- ============================================================
