# Task: Controle de Consumo

## Resumo

Nova funcionalidade para controlar o consumo de produtos de uso interno (tintas, oxidantes, pó descolorante, etc.) que são utilizados durante a prestação de serviços. Esses produtos são diferentes dos produtos de venda — não precisam de controle de estoque tradicional, apenas de rastreamento de consumo por serviço.

## Problema

Hoje o salão não tem como:
- Saber quando um tubo de tinta acabou (ex: 60g)
- Registrar quanto de cada produto foi usado em cada serviço
- Consultar a fórmula usada em uma cliente específica
- Saber se a fórmula da cliente mudou entre atendimentos

## Solução

### 1. Nova tabela `usage_products` (Produtos de Consumo)

Tabela separada de `products`, com campos específicos:

```sql
CREATE TABLE usage_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,                          -- Ex: "Tinta Loreal 7.1"
    content_amount NUMERIC(10, 2) NOT NULL,      -- Ex: 60 (quantidade por embalagem)
    measurement_unit TEXT NOT NULL DEFAULT 'g',   -- Ex: "g", "ml"
    unit_label TEXT NOT NULL DEFAULT 'tubo',      -- Ex: "tubo", "frasco", "pote"
    current_consumed NUMERIC(10, 2) DEFAULT 0,   -- Quanto já foi consumido do tubo atual
    total_units_consumed INTEGER DEFAULT 0,       -- Quantos tubos já foram consumidos no total
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

Lógica:
- `content_amount` = 60g (o tubo vem com 60g)
- `current_consumed` = vai acumulando (15g + 20g + 15g = 50g)
- Quando `current_consumed >= content_amount` → marca 1 tubo consumido, zera o contador
- `total_units_consumed` = quantos tubos já acabaram

### 2. Nova tabela `usage_product_logs` (Registro de uso por atendimento)

```sql
CREATE TABLE usage_product_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    usage_product_id UUID NOT NULL REFERENCES usage_products(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    professional_id UUID REFERENCES professionals(id) ON DELETE SET NULL,
    amount_used NUMERIC(10, 2) NOT NULL,         -- Ex: 15 (gramas usadas)
    notes TEXT,                                   -- Observações opcionais
    created_at TIMESTAMPTZ DEFAULT now()
);
```

### 3. Nova aba no menu: "Controle de Consumo"

Localização: grupo "Catálogo" no sidebar, abaixo de "Produtos".

Página principal (`/consumption`):
- Lista de produtos de consumo cadastrados
- Cada card mostra:
  - Nome do produto
  - Barra de progresso (ex: 50g / 60g)
  - Quantos tubos já foram consumidos
  - Botão editar / excluir
- Botão "Novo Produto de Consumo"
- Dialog de cadastro: nome, conteúdo por embalagem, unidade de medida, rótulo da embalagem

### 4. Alteração na Finalização do Atendimento

Na `FinalizeAppointmentDialog`, adicionar uma terceira seção:

**"Produtos de Consumo Utilizados"** (abaixo dos produtos de venda)

- Botão "Adicionar Produto de Consumo"
- Select com os produtos de consumo cadastrados
- Input numérico para a quantidade usada (em g/ml)
- Campo opcional de observação (motivo da alteração de fórmula)

Ao finalizar:
- Cria registros em `usage_product_logs`
- Atualiza `current_consumed` no `usage_products`
- Se `current_consumed >= content_amount` → incrementa `total_units_consumed`, zera `current_consumed` (ou mantém o excedente)

### 5. Histórico da Cliente com Fórmula

Na `ClientHistoryTab`, quando o atendimento tiver produtos de consumo registrados:
- Mostrar seção "🎨 Fórmula utilizada" com lista dos produtos e quantidades
- Comparar com o atendimento anterior do mesmo tipo de serviço para a mesma cliente
- Se houve mudança, exibir:
  - Badge **"⚠️ Fórmula Alterada"**
  - 🆕 Produto novo (não existia antes)
  - 📝 Quantidade mudou (era Xg, agora Yg)
  - ❌ Produto removido (era usado e saiu)
- Se a fórmula mudou, pedir motivo da alteração (opção C do usuário)
  - Campo "Motivo da alteração" aparece automaticamente quando o sistema detecta mudança
  - Exemplos: "Cliente pediu cor mais escura", "Teste de nova fórmula"
  - Fica salvo no `notes` do `usage_product_logs`

### 6. Detecção de Mudança de Fórmula

A detecção é feita na finalização do atendimento (não apenas visual):
1. Ao adicionar produtos de consumo, o sistema busca o último atendimento da mesma cliente com o mesmo serviço
2. Compara os produtos usados (por `usage_product_id`) e quantidades
3. Se detectar diferença, exibe alerta na tela de finalização:
   - "A fórmula da [nome da cliente] mudou em relação ao último atendimento"
   - Mostra o que mudou (novo, removido, quantidade diferente)
   - Pede o motivo da alteração (campo obrigatório quando há mudança)
4. O motivo fica registrado no log

## Arquivos a criar/modificar

### Criar:
- `src/core/domain/UsageProduct.ts` — tipos e schemas Zod
- `src/core/repositories/UsageProductRepository.ts` — interface do repositório
- `src/infrastructure/repositories/supabase/SupabaseUsageProductRepository.ts` — implementação
- `src/hooks/useUsageProducts.ts` — hook React
- `src/app/(app)/consumption/page.tsx` — página principal
- `src/components/consumption/UsageProductDialog.tsx` — dialog de cadastro/edição
- `src/components/consumption/UsageProductCard.tsx` — card com barra de progresso
- `src/components/consumption/DeleteUsageProductDialog.tsx` — confirmação de exclusão
- Migration SQL para as novas tabelas + RLS

### Modificar:
- `src/components/layout/Sidebar.tsx` — adicionar item "Controle de Consumo" no grupo Catálogo
- `src/components/agenda/FinalizeAppointmentDialog.tsx` — adicionar seção de produtos de consumo
- `src/components/clients/tabs/ClientHistoryTab.tsx` — mostrar fórmula e detecção de mudança
- `src/infrastructure/repositories/factory.ts` — registrar novo repositório
- `src/core/domain/Appointment.ts` — adicionar campo `usageProducts` nos dados de finalização

## Ordem de implementação

1. Migration SQL (tabelas + RLS + indexes)
2. Domain types (UsageProduct.ts)
3. Repository interface + implementação Supabase
4. Factory registration
5. Hook useUsageProducts
6. Página /consumption + componentes (Dialog, Card, Delete)
7. Sidebar — adicionar menu
8. FinalizeAppointmentDialog — seção de consumo + detecção de mudança
9. ClientHistoryTab — fórmula + badges de alteração
