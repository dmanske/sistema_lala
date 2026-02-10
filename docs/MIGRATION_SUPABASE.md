
# Guia de Migração para Supabase

Este documento detalha o plano para migrar o módulo de Vendas e Estoque do `localStorage` para o Supabase, garantindo consistência e segurança.

## 1. Estrutura de Banco de Dados Sugerida

### Tabela: `sales`
Armazena o cabeçalho das vendas.

```sql
create table sales (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  customer_id uuid references clients(id),
  appointment_id uuid, -- opcional
  status text not null check (status in ('draft', 'pending_payment', 'paid', 'canceled', 'refunded')),
  subtotal numeric(10, 2) not null default 0,
  discount numeric(10, 2) not null default 0,
  total numeric(10, 2) not null default 0,
  created_at timestamptz default now(),
  created_by uuid references auth.users(id)
);

create index idx_sales_tenant on sales(tenant_id);
create index idx_sales_customer on sales(customer_id);
```

### Tabela: `sale_items`
Itens de cada venda.

```sql
create table sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references sales(id) on delete cascade,
  item_type text not null check (item_type in ('product', 'service')),
  product_id uuid references products(id),
  service_id uuid references services(id),
  qty numeric(10, 2) not null check (qty > 0),
  unit_price numeric(10, 2) not null default 0,
  total_price numeric(10, 2) not null default 0,
  commission_value numeric(10, 2) default 0,
  cost_snapshot numeric(10, 2) default 0 -- Custo na época da venda
);

create index idx_sale_items_sale on sale_items(sale_id);
create index idx_sale_items_product on sale_items(product_id);
```

### Tabela: `sale_payments`
Registros de pagamento parciais ou totais.

```sql
create table sale_payments (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references sales(id) on delete cascade,
  method text not null, -- pix, card, cash, etc
  amount numeric(10, 2) not null check (amount > 0),
  paid_at timestamptz default now()
);

create index idx_sale_payments_sale on sale_payments(sale_id);
```

### Tabela: `stock_movements`
Histórico imutável de movimentação de estoque. `current_stock` em `products` deve ser derivado ou atualizado via trigger/função, mas a fonte da verdade é esta tabela.

```sql
create table stock_movements (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  product_id uuid not null references products(id),
  type text not null check (type in ('in', 'out')),
  qty numeric(10, 2) not null check (qty > 0),
  reason text not null, -- sale, refund, adjust, initial
  reference_type text, -- sale
  reference_id uuid, -- sale_id
  created_at timestamptz default now(),
  created_by uuid references auth.users(id)
);

create index idx_stock_movements_product on stock_movements(product_id);
create index idx_stock_movements_tenant on stock_movements(tenant_id);
```

---

## 2. Row Level Security (RLS)

Habilite RLS em todas as tabelas. Exemplo de política para `sales`:

```sql
alter table sales enable row level security;

create policy "Tenants can view their own sales"
on sales for select
using (tenant_id = auth.uid()::uuid); -- Ajustar conforme lógica de tenant da aplicação (metadata ou auth.uid)

create policy "Tenants can insert their own sales"
on sales for insert
with check (tenant_id = auth.uid()::uuid);
```

Repita o padrão para `sale_items`, `sale_payments`, `stock_movements`.

---

## 3. Funções RPC (Transações)

Para evitar inconsistências (ex: descontar estoque mas falhar ao salvar venda), use funções Postgres (PL/pgSQL).

### Função `pay_sale`

Esta função receberia `sale_id`, `payment_info` e executaria em transação:
1.  Inserir em `sale_payments`.
2.  Verificar se total pago >= total venda.
3.  Se sim, atualizar `sales.status = 'paid'`.
4.  Se sim, inserir em `stock_movements` (loop nos itens).
5.  Retornar nova venda.

---

## 4. Checklist de Migração

1.  **Backup**: Exporte os dados do LocalStorage (JSON).
2.  **Schema no Supabase**: Crie as tabelas e índices acima no Dashboard ou via Migrations.
3.  **Implementar Repositórios Supabase**:
    *   Crie `SupabaseSaleRepository` e `SupabaseStockMovementRepository`.
    *   Substitua as chamadas ao `localStorage` pelas chamadas `supabase.from(...)`.
4.  **Migração de Dados**:
    *   Crie um script (`admin/migrate.ts`) que lê o JSON do LocalStorage e insere via API do Supabase.
    *   Atenção aos IDs (UUIDs devem ser mantidos se possíveis, ou gerados novos e atualizados os vínculos).
5.  **Validação**:
    *   Rode os helpers (`StockService.listLowStock`) e compare com o esperado.
6.  **Switch**:
    *   Altere a injeção de dependência na aplicação para usar os repositórios Supabase.

## Decisões de Design (Edge Cases)

*   **Venda Parcial**: O sistema suporta pagamentos parciais (`sale_payments`), mas a venda só transita para `paid` e baixa estoque quando `soma(payments) >= total`.
*   **Edição Pós-Pagamento**: Bloqueada no UseCase (`UpdateSaleItems`). Para corrigir, deve-se estornar (`Refund`) e criar nova venda.
*   **Estorno**: Gera movimento inverso (`IN`) no estoque automaticamente.
