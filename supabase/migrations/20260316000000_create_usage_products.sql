-- ============================================================
-- CONTROLE DE CONSUMO - Produtos de Uso Interno
-- Tintas, oxidantes, pó descolorante, etc.
-- ============================================================

-- 1. Tabela de produtos de consumo
CREATE TABLE usage_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001',
    name TEXT NOT NULL,
    content_amount NUMERIC(10, 2) NOT NULL CHECK (content_amount > 0),
    measurement_unit TEXT NOT NULL DEFAULT 'g' CHECK (measurement_unit IN ('g', 'ml', 'un')),
    unit_label TEXT NOT NULL DEFAULT 'tubo',
    current_consumed NUMERIC(10, 2) DEFAULT 0 CHECK (current_consumed >= 0),
    total_units_consumed INTEGER DEFAULT 0 CHECK (total_units_consumed >= 0),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_usage_products_tenant ON usage_products(tenant_id);

-- 2. Tabela de logs de uso por atendimento
CREATE TABLE usage_product_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001',
    usage_product_id UUID NOT NULL REFERENCES usage_products(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    professional_id UUID REFERENCES professionals(id) ON DELETE SET NULL,
    amount_used NUMERIC(10, 2) NOT NULL CHECK (amount_used > 0),
    notes TEXT,
    formula_change_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_usage_product_logs_tenant ON usage_product_logs(tenant_id);
CREATE INDEX idx_usage_product_logs_product ON usage_product_logs(usage_product_id);
CREATE INDEX idx_usage_product_logs_appointment ON usage_product_logs(appointment_id);
CREATE INDEX idx_usage_product_logs_client ON usage_product_logs(client_id);

-- 3. RLS
ALTER TABLE usage_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_product_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usage_products_tenant_isolation" ON usage_products
    FOR ALL USING (
        tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "usage_product_logs_tenant_isolation" ON usage_product_logs
    FOR ALL USING (
        tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    );
