-- ============================================================
-- SISTEMA LALA - MIGRAÇÃO FASE 1
-- Schema completo com multi-tenant, RLS e constraints
-- Baseado no INVENTARIO_COMPLETO.md V1.5
-- ============================================================

-- 0. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. TENANT (Multi-Tenant Base)
-- ============================================================
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Perfil do usuário vinculado ao tenant
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'staff')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tenant padrão para migração gradual (será usado enquanto não há auth)
INSERT INTO tenants (id, name, slug) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Salão Padrão', 'default');

-- ============================================================
-- 2. CLIENTES
-- ============================================================
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001',
    name TEXT NOT NULL,
    birth_date DATE NOT NULL,
    phone TEXT,
    whatsapp TEXT,
    city TEXT NOT NULL,
    notes TEXT,
    photo_url TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ATTENTION')),
    credit_balance NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_clients_tenant ON clients(tenant_id);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_name ON clients(tenant_id, name);
CREATE INDEX idx_clients_created_at ON clients(created_at);

-- ============================================================
-- 3. PROFISSIONAIS
-- ============================================================
CREATE TABLE professionals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001',
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    color TEXT NOT NULL DEFAULT '#6366f1',
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    commission NUMERIC(5, 2) DEFAULT 0.00 CHECK (commission >= 0 AND commission <= 100),
    specialties TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_professionals_tenant ON professionals(tenant_id);
CREATE INDEX idx_professionals_status ON professionals(tenant_id, status);

-- ============================================================
-- 4. SERVIÇOS
-- ============================================================
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001',
    name TEXT NOT NULL,
    duration INTEGER NOT NULL CHECK (duration >= 1),
    cost NUMERIC(12, 2) DEFAULT 0.00 CHECK (cost >= 0),
    profit_amount NUMERIC(12, 2) DEFAULT 0.00 CHECK (profit_amount >= 0),
    profit_percentage NUMERIC(7, 2) DEFAULT 0.00 CHECK (profit_percentage >= 0),
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    commission NUMERIC(12, 2) DEFAULT 0.00 CHECK (commission >= 0),
    net_value NUMERIC(12, 2),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_services_tenant ON services(tenant_id);

-- ============================================================
-- 5. PRODUTOS
-- ============================================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001',
    name TEXT NOT NULL,
    cost NUMERIC(12, 2) DEFAULT 0.00 CHECK (cost >= 0),
    profit_amount NUMERIC(12, 2) DEFAULT 0.00 CHECK (profit_amount >= 0),
    profit_percentage NUMERIC(7, 2) DEFAULT 0.00 CHECK (profit_percentage >= 0),
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    commission NUMERIC(12, 2) DEFAULT 0.00 CHECK (commission >= 0),
    net_value NUMERIC(12, 2),
    min_stock INTEGER DEFAULT 0 CHECK (min_stock >= 0),
    current_stock INTEGER DEFAULT 0,  -- CACHE de leitura (fonte de verdade = product_movements)
    last_movement TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_products_tenant ON products(tenant_id);
CREATE INDEX idx_products_stock ON products(tenant_id, current_stock, min_stock);

-- ============================================================
-- 6. FORNECEDORES (antes de product_movements por dependência)
-- ============================================================
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001',
    name TEXT NOT NULL,
    cnpj TEXT,
    phone TEXT,
    whatsapp TEXT,
    email TEXT,
    address TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_suppliers_tenant ON suppliers(tenant_id);
CREATE INDEX idx_suppliers_status ON suppliers(tenant_id, status);

-- ============================================================
-- 7. MOVIMENTAÇÕES DE PRODUTO (Fonte de Verdade do Estoque)
-- ============================================================
CREATE TABLE product_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001',
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('IN', 'OUT')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    reason TEXT NOT NULL,
    reference_id UUID,
    reference_type TEXT CHECK (reference_type IN ('APPOINTMENT', 'ADJUSTMENT', 'PURCHASE', 'REFUND', 'SALE')),
    unit_cost NUMERIC(12, 2) CHECK (unit_cost >= 0),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_product_movements_product ON product_movements(product_id);
CREATE INDEX idx_product_movements_tenant ON product_movements(tenant_id);
CREATE INDEX idx_product_movements_reference ON product_movements(reference_id);
CREATE INDEX idx_product_movements_created ON product_movements(created_at);

-- ============================================================
-- 8. COMPRAS
-- ============================================================
CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001',
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    date DATE NOT NULL,
    total NUMERIC(12, 2) DEFAULT 0.00 CHECK (total >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_purchases_tenant ON purchases(tenant_id);
CREATE INDEX idx_purchases_supplier ON purchases(supplier_id);
CREATE INDEX idx_purchases_date ON purchases(date);

-- ============================================================
-- 9. ITENS DE COMPRA
-- ============================================================
CREATE TABLE purchase_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_id UUID NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_cost NUMERIC(12, 2) NOT NULL CHECK (unit_cost >= 0),
    line_total NUMERIC(12, 2) GENERATED ALWAYS AS (quantity * unit_cost) STORED
);

CREATE INDEX idx_purchase_items_purchase ON purchase_items(purchase_id);
CREATE INDEX idx_purchase_items_product ON purchase_items(product_id);

-- ============================================================
-- 10. AGENDAMENTOS
-- ============================================================
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001',
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE RESTRICT,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes >= 1),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELED', 'NO_SHOW', 'DONE', 'BLOCKED')),
    notes TEXT,
    -- Dados de finalização (JSONB para flexibilidade)
    finalized_at TIMESTAMPTZ,
    finalized_services JSONB,
    used_products JSONB,
    total_service_value NUMERIC(12, 2),
    total_product_value NUMERIC(12, 2),
    total_value NUMERIC(12, 2),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_appointments_tenant ON appointments(tenant_id);
CREATE INDEX idx_appointments_date ON appointments(tenant_id, date);
CREATE INDEX idx_appointments_client ON appointments(client_id);
CREATE INDEX idx_appointments_professional ON appointments(professional_id);
CREATE INDEX idx_appointments_status ON appointments(status);

-- ============================================================
-- 11. SERVIÇOS DO AGENDAMENTO (relação N:N)
-- ============================================================
CREATE TABLE appointment_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    price_snapshot NUMERIC(12, 2) NOT NULL CHECK (price_snapshot >= 0),
    duration_snapshot INTEGER,
    price_override NUMERIC(12, 2),
    qty INTEGER DEFAULT 1 CHECK (qty >= 1)
);

CREATE INDEX idx_appointment_services_appointment ON appointment_services(appointment_id);

-- ============================================================
-- 12. VENDAS (Checkout)
-- ============================================================
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001',
    customer_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_payment', 'paid', 'canceled', 'refunded')),
    subtotal NUMERIC(12, 2) DEFAULT 0.00 CHECK (subtotal >= 0),
    discount NUMERIC(12, 2) DEFAULT 0.00 CHECK (discount >= 0),
    total NUMERIC(12, 2) DEFAULT 0.00 CHECK (total >= 0),
    created_by TEXT NOT NULL DEFAULT 'system',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sales_tenant ON sales(tenant_id);
CREATE INDEX idx_sales_customer ON sales(customer_id);
CREATE INDEX idx_sales_appointment ON sales(appointment_id);
CREATE INDEX idx_sales_status ON sales(status);
CREATE INDEX idx_sales_created ON sales(created_at);

-- ============================================================
-- 13. ITENS DA VENDA
-- ============================================================
CREATE TABLE sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('product', 'service')),
    item_name TEXT NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    qty INTEGER NOT NULL CHECK (qty >= 1),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    total_price NUMERIC(12, 2) NOT NULL CHECK (total_price >= 0),
    commission_value NUMERIC(12, 2),
    cost_snapshot NUMERIC(12, 2),
    professional_id UUID REFERENCES professionals(id) ON DELETE SET NULL
);

CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);

-- ============================================================
-- 14. PAGAMENTOS DA VENDA
-- ============================================================
CREATE TABLE sale_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    method TEXT NOT NULL CHECK (method IN ('pix', 'card', 'cash', 'transfer', 'credit', 'fiado')),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    paid_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sale_payments_sale ON sale_payments(sale_id);

-- ============================================================
-- 15. MOVIMENTAÇÕES DE CRÉDITO
-- ============================================================
CREATE TABLE credit_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001',
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('CREDIT', 'DEBIT')),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    origin TEXT CHECK (origin IN ('CASH', 'PIX', 'CARD', 'WALLET')),
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_credit_movements_client ON credit_movements(client_id);
CREATE INDEX idx_credit_movements_tenant ON credit_movements(tenant_id);

-- ============================================================
-- 16. MOVIMENTAÇÕES DE ESTOQUE (usadas pelo checkout/vendas)
-- ============================================================
CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001',
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('in', 'out')),
    qty INTEGER NOT NULL CHECK (qty > 0),
    reason TEXT NOT NULL CHECK (reason IN ('sale', 'refund', 'adjust', 'initial')),
    reference_type TEXT CHECK (reference_type IN ('sale')),
    reference_id UUID,
    created_by TEXT NOT NULL DEFAULT 'system',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_tenant ON stock_movements(tenant_id);
CREATE INDEX idx_stock_movements_reference ON stock_movements(reference_id);

-- ============================================================
-- PASSO 3 — RLS + POLICIES
-- ============================================================

-- Helper function: get tenant_id from authenticated user
CREATE OR REPLACE FUNCTION auth.tenant_id()
RETURNS UUID AS $$
    SELECT COALESCE(
        (SELECT tenant_id FROM profiles WHERE id = auth.uid()),
        '00000000-0000-0000-0000-000000000001'::uuid
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLICIES: Permitir acesso via anon key durante migração
-- (Quando auth for implementada, estas policies serão 
--  substituídas por tenant-isolated policies)
-- ============================================================

-- TENANTS
CREATE POLICY "tenants_read" ON tenants FOR SELECT USING (true);

-- PROFILES
CREATE POLICY "profiles_own" ON profiles FOR ALL USING (true);

-- Para todas as tabelas com tenant_id, criar policies permissivas
-- que serão refinadas quando auth for implementada
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'clients', 'professionals', 'services', 'products', 
        'product_movements', 'suppliers', 'purchases',
        'appointments', 'sales', 'credit_movements', 'stock_movements'
    ]) LOOP
        EXECUTE format('CREATE POLICY %I ON %I FOR ALL USING (true) WITH CHECK (true)', 
            tbl || '_allow_all', tbl);
    END LOOP;
END $$;

-- Tabelas filhas (sem tenant_id direto, herdam do pai)
CREATE POLICY "purchase_items_allow_all" ON purchase_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "appointment_services_allow_all" ON appointment_services FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "sale_items_allow_all" ON sale_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "sale_payments_allow_all" ON sale_payments FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- PASSO 7 — RPC FUNCTIONS (Atomicidade)
-- ============================================================

-- RPC: Criar compra com itens + movimentações de estoque (atômico)
CREATE OR REPLACE FUNCTION create_purchase_with_movements(
    p_tenant_id UUID,
    p_supplier_id UUID,
    p_date DATE,
    p_notes TEXT,
    p_items JSONB -- [{productId, quantity, unitCost}]
)
RETURNS UUID AS $$
DECLARE
    v_purchase_id UUID;
    v_total NUMERIC := 0;
    v_item JSONB;
BEGIN
    -- Calcular total
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
        v_total := v_total + (v_item->>'quantity')::INTEGER * (v_item->>'unitCost')::NUMERIC;
    END LOOP;

    -- Inserir compra
    INSERT INTO purchases (tenant_id, supplier_id, date, notes, total)
    VALUES (p_tenant_id, p_supplier_id, p_date, p_notes, v_total)
    RETURNING id INTO v_purchase_id;

    -- Inserir itens e movimentações
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
        -- Item da compra
        INSERT INTO purchase_items (purchase_id, product_id, quantity, unit_cost)
        VALUES (
            v_purchase_id,
            (v_item->>'productId')::UUID,
            (v_item->>'quantity')::INTEGER,
            (v_item->>'unitCost')::NUMERIC
        );

        -- Movimentação de estoque (entrada)
        INSERT INTO product_movements (tenant_id, product_id, type, quantity, reason, reference_id, reference_type, unit_cost, supplier_id)
        VALUES (
            p_tenant_id,
            (v_item->>'productId')::UUID,
            'IN',
            (v_item->>'quantity')::INTEGER,
            'Compra',
            v_purchase_id,
            'PURCHASE',
            (v_item->>'unitCost')::NUMERIC,
            p_supplier_id
        );

        -- Atualizar cache de estoque
        UPDATE products
        SET current_stock = current_stock + (v_item->>'quantity')::INTEGER,
            last_movement = now(),
            updated_at = now()
        WHERE id = (v_item->>'productId')::UUID;
    END LOOP;

    RETURN v_purchase_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Pagar venda (atômico) — atualiza status, registra pagamentos, 
-- movimenta estoque e crédito
CREATE OR REPLACE FUNCTION pay_sale(
    p_sale_id UUID,
    p_payments JSONB, -- [{method, amount}]
    p_stock_items JSONB DEFAULT '[]'::JSONB, -- [{productId, qty}] items to deduct from stock
    p_credit_debit JSONB DEFAULT NULL -- {clientId, amount} optional credit debit
)
RETURNS VOID AS $$
DECLARE
    v_payment JSONB;
    v_item JSONB;
    v_sale RECORD;
    v_tenant_id UUID;
BEGIN
    -- Buscar venda
    SELECT * INTO v_sale FROM sales WHERE id = p_sale_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Sale not found: %', p_sale_id;
    END IF;
    v_tenant_id := v_sale.tenant_id;

    -- Registrar pagamentos
    FOR v_payment IN SELECT * FROM jsonb_array_elements(p_payments) LOOP
        INSERT INTO sale_payments (sale_id, method, amount, paid_at)
        VALUES (
            p_sale_id,
            (v_payment->>'method')::TEXT,
            (v_payment->>'amount')::NUMERIC,
            now()
        );
    END LOOP;

    -- Atualizar status da venda
    UPDATE sales
    SET status = 'paid', updated_at = now()
    WHERE id = p_sale_id;

    -- Movimentar estoque (saída)
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_stock_items) LOOP
        INSERT INTO stock_movements (tenant_id, product_id, type, qty, reason, reference_type, reference_id, created_by)
        VALUES (
            v_tenant_id,
            (v_item->>'productId')::UUID,
            'out',
            (v_item->>'qty')::INTEGER,
            'sale',
            'sale',
            p_sale_id,
            'system'
        );

        UPDATE products
        SET current_stock = current_stock - (v_item->>'qty')::INTEGER,
            last_movement = now(),
            updated_at = now()
        WHERE id = (v_item->>'productId')::UUID;
    END LOOP;

    -- Debitar crédito do cliente (se aplicável)
    IF p_credit_debit IS NOT NULL AND (p_credit_debit->>'amount')::NUMERIC > 0 THEN
        INSERT INTO credit_movements (tenant_id, client_id, type, amount, origin, note)
        VALUES (
            v_tenant_id,
            (p_credit_debit->>'clientId')::UUID,
            'DEBIT',
            (p_credit_debit->>'amount')::NUMERIC,
            'WALLET',
            'Pagamento de venda #' || p_sale_id::TEXT
        );

        UPDATE clients
        SET credit_balance = credit_balance - (p_credit_debit->>'amount')::NUMERIC,
            updated_at = now()
        WHERE id = (p_credit_debit->>'clientId')::UUID;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Estornar venda (atômico) — reverte status, estoque e crédito
CREATE OR REPLACE FUNCTION refund_sale(
    p_sale_id UUID
)
RETURNS VOID AS $$
DECLARE
    v_sale RECORD;
    v_item RECORD;
    v_stock RECORD;
    v_credit RECORD;
    v_tenant_id UUID;
BEGIN
    -- Buscar venda
    SELECT * INTO v_sale FROM sales WHERE id = p_sale_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Sale not found: %', p_sale_id;
    END IF;
    IF v_sale.status != 'paid' THEN
        RAISE EXCEPTION 'Can only refund paid sales. Current status: %', v_sale.status;
    END IF;
    v_tenant_id := v_sale.tenant_id;

    -- Atualizar status da venda
    UPDATE sales
    SET status = 'refunded', updated_at = now()
    WHERE id = p_sale_id;

    -- Reverter movimentações de estoque (stock_movements com referenceId = sale_id)
    FOR v_stock IN SELECT * FROM stock_movements WHERE reference_id = p_sale_id AND type = 'out' LOOP
        INSERT INTO stock_movements (tenant_id, product_id, type, qty, reason, reference_type, reference_id, created_by)
        VALUES (
            v_tenant_id,
            v_stock.product_id,
            'in',
            v_stock.qty,
            'refund',
            'sale',
            p_sale_id,
            'system'
        );

        UPDATE products
        SET current_stock = current_stock + v_stock.qty,
            last_movement = now(),
            updated_at = now()
        WHERE id = v_stock.product_id;
    END LOOP;

    -- Reverter débitos de crédito
    FOR v_credit IN 
        SELECT * FROM credit_movements 
        WHERE note LIKE '%' || p_sale_id::TEXT || '%' 
        AND type = 'DEBIT'
    LOOP
        INSERT INTO credit_movements (tenant_id, client_id, type, amount, origin, note)
        VALUES (
            v_tenant_id,
            v_credit.client_id,
            'CREDIT',
            v_credit.amount,
            'WALLET',
            'Estorno de venda #' || p_sale_id::TEXT
        );

        UPDATE clients
        SET credit_balance = credit_balance + v_credit.amount,
            updated_at = now()
        WHERE id = v_credit.client_id;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- TRIGGER: Atualizar updated_at automaticamente
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas tabelas com updated_at
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'tenants', 'profiles', 'clients', 'professionals', 
        'services', 'products', 'suppliers', 'purchases', 
        'appointments', 'sales'
    ]) LOOP
        EXECUTE format(
            'CREATE TRIGGER trigger_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
            tbl
        );
    END LOOP;
END $$;
