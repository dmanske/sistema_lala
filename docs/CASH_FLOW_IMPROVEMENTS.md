# Melhorias do Fluxo de Caixa - Roadmap Completo

## 📋 Visão Geral

Este documento detalha todas as melhorias planejadas para o sistema de fluxo de caixa, organizadas em 3 fases de implementação.

**Objetivo:** Transformar o sistema atual em uma solução completa de gestão financeira com visão consolidada, projeções, análises gerenciais e automações.

---

## 🎯 Situação Atual

### Módulos Existentes
- ✅ Caixa (`/cash`) - Movimentações financeiras
- ✅ Registro de Caixa (`/cash-register`) - Abertura/fechamento
- ✅ Contas a Receber (`/receivables`) - Parcelas e recebimentos
- ✅ Contas a Pagar (`/accounts-payable`) - Despesas e pagamentos

### Problemas Identificados
1. ❌ Falta de visão consolidada do fluxo de caixa
2. ❌ Ausência de projeção de entradas e saídas futuras
3. ❌ Reconciliação manual e propensa a erros
4. ❌ Métricas financeiras limitadas (sem DRE, margem, ROI)
5. ❌ Gestão fragmentada de múltiplas contas bancárias
6. ❌ Categorização insuficiente (sem centro de custos/projetos)

---

## 🚀 Roadmap de Implementação

**Nota:** Não incluiremos automações (conciliação automática, Open Banking, etc.) nesta versão.

### FASE 1 - Fundação (2-3 semanas)
**Objetivo:** Criar visão consolidada e projeções básicas

#### 1.1 Dashboard Financeiro Consolidado
- **Prioridade:** 🔴 ALTA
- **Complexidade:** Média
- **Tempo estimado:** 5-7 dias

**Entregas:**
- [ ] Nova rota `/dashboard/financial`
- [ ] Cards com métricas principais (receita, despesa, lucro, margem)
- [ ] Gráfico de evolução do saldo
- [ ] Gráfico de entradas vs saídas
- [ ] Lista de contas bancárias com saldos
- [ ] Sistema de alertas financeiros

**Arquivos a criar:**
```
src/app/(app)/dashboard/financial/
  ├── page.tsx
  └── actions.ts

src/components/dashboard/
  ├── FinancialMetricsCards.tsx
  ├── CashFlowChart.tsx
  ├── InflowOutflowChart.tsx
  ├── BankAccountsList.tsx
  └── FinancialAlerts.tsx

src/core/usecases/dashboard/
  ├── GetFinancialSummary.ts
  └── GetCashFlowData.ts

src/hooks/
  └── useFinancialDashboard.ts
```

#### 1.2 Projeção de Fluxo de Caixa
- **Prioridade:** 🔴 ALTA
- **Complexidade:** Alta
- **Tempo estimado:** 7-10 dias

**Entregas:**
- [ ] Nova rota `/cash/projection`
- [ ] Cálculo automático de projeções baseado em recebíveis e contas a pagar
- [ ] Inclusão de despesas recorrentes
- [ ] Cenários (otimista, realista, pessimista)
- [ ] Alertas de possível saldo negativo
- [ ] Gráfico de projeção diária/semanal/mensal

**Arquivos a criar:**
```
src/app/(app)/cash/projection/
  ├── page.tsx
  └── actions.ts

src/components/cash/projection/
  ├── ProjectionChart.tsx
  ├── ProjectionTable.tsx
  ├── ScenarioSelector.tsx
  └── RecurringExpensesDialog.tsx

src/core/domain/entities/
  └── CashFlowProjection.ts

src/core/usecases/cash/
  ├── CalculateCashFlowProjection.ts
  └── ManageRecurringExpenses.ts

src/infrastructure/repositories/
  └── RecurringExpenseRepository.ts
```

**Tabelas a criar:**
```sql
-- Despesas Recorrentes
CREATE TABLE recurring_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  frequency TEXT NOT NULL CHECK (frequency IN ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY')),
  start_date DATE NOT NULL,
  end_date DATE,
  category TEXT NOT NULL,
  bank_account_id UUID REFERENCES bank_accounts(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 1.3 Melhorias no Módulo de Caixa
- **Prioridade:** 🟡 MÉDIA
- **Complexidade:** Baixa
- **Tempo estimado:** 3-5 dias

**Entregas:**
- [ ] Filtros avançados (conta bancária, categoria, método)
- [ ] Exportação para Excel/PDF
- [ ] Gráficos de distribuição (pizza/barras)
- [ ] Comparativo com período anterior
- [ ] Busca por descrição
- [ ] Visualização por conta bancária

**Arquivos a modificar/criar:**
```
src/app/(app)/cash/page.tsx (melhorar)
src/components/cash/
  ├── CashFilters.tsx (melhorar)
  ├── CashAnalytics.tsx (novo)
  ├── CashDistributionCharts.tsx (novo)
  ├── CashComparison.tsx (novo)
  └── ExportButton.tsx (novo)

src/lib/utils/
  └── exportToExcel.ts (novo)
```

---

### FASE 2 - Gestão Avançada (3-4 semanas)
**Objetivo:** Adicionar centro de custos, projetos e relatórios gerenciais

#### 2.1 Centro de Custos e Projetos
- **Prioridade:** 🟡 MÉDIA
- **Complexidade:** Média
- **Tempo estimado:** 5-7 dias

**Entregas:**
- [ ] Nova rota `/settings/cost-centers`
- [ ] Nova rota `/settings/projects`
- [ ] CRUD de centros de custos
- [ ] CRUD de projetos
- [ ] Hierarquia de centros de custos
- [ ] Associação de movimentações a centros/projetos
- [ ] Relatórios por centro de custo/projeto

**Tabelas a criar:**
```sql
-- Centro de Custos
CREATE TABLE cost_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL,
  code TEXT,
  parent_id UUID REFERENCES cost_centers(id),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Projetos
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  start_date DATE,
  end_date DATE,
  budget NUMERIC,
  status TEXT CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED', 'ON_HOLD')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Adicionar às tabelas existentes
ALTER TABLE cash_movements 
  ADD COLUMN cost_center_id UUID REFERENCES cost_centers(id),
  ADD COLUMN project_id UUID REFERENCES projects(id);

ALTER TABLE accounts_payable
  ADD COLUMN cost_center_id UUID REFERENCES cost_centers(id),
  ADD COLUMN project_id UUID REFERENCES projects(id);
```

**Arquivos a criar:**
```
src/app/(app)/settings/cost-centers/
  ├── page.tsx
  └── actions.ts

src/app/(app)/settings/projects/
  ├── page.tsx
  └── actions.ts

src/components/cost-centers/
  ├── CostCenterDialog.tsx
  ├── CostCenterTree.tsx
  └── CostCenterSelector.tsx

src/components/projects/
  ├── ProjectDialog.tsx
  ├── ProjectCard.tsx
  └── ProjectSelector.tsx

src/core/domain/entities/
  ├── CostCenter.ts
  └── Project.ts

src/core/usecases/cost-centers/
  ├── CreateCostCenter.ts
  ├── UpdateCostCenter.ts
  ├── DeleteCostCenter.ts
  └── ListCostCenters.ts

src/core/usecases/projects/
  ├── CreateProject.ts
  ├── UpdateProject.ts
  ├── DeleteProject.ts
  └── ListProjects.ts
```

#### 2.2 Gestão de Múltiplas Contas Bancárias
- **Prioridade:** 🟡 MÉDIA
- **Complexidade:** Média
- **Tempo estimado:** 5-7 dias

**Entregas:**
- [ ] Nova rota `/bank-accounts/dashboard`
- [ ] Dashboard consolidado de contas
- [ ] Transferências entre contas
- [ ] Agendamento de transferências
- [ ] Histórico detalhado por conta
- [ ] Gráficos de evolução por conta
- [ ] Gestão de limites de crédito

**Tabelas a criar:**
```sql
-- Transferências entre contas
CREATE TABLE bank_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  from_account_id UUID NOT NULL REFERENCES bank_accounts(id),
  to_account_id UUID NOT NULL REFERENCES bank_accounts(id),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  scheduled_date DATE NOT NULL,
  executed_date DATE,
  status TEXT CHECK (status IN ('SCHEDULED', 'EXECUTED', 'CANCELLED')),
  description TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Arquivos a criar:**
```
src/app/(app)/bank-accounts/dashboard/
  ├── page.tsx
  └── actions.ts

src/components/bank-accounts/
  ├── BankAccountsDashboard.tsx
  ├── BankAccountCard.tsx
  ├── TransferDialog.tsx
  ├── TransferHistory.tsx
  └── AccountBalanceChart.tsx

src/core/domain/entities/
  └── BankTransfer.ts

src/core/usecases/bank-accounts/
  ├── GetAccountsDashboard.ts
  ├── CreateTransfer.ts
  ├── ExecuteTransfer.ts
  └── GetAccountHistory.ts
```

#### 2.3 Relatórios Gerenciais
- **Prioridade:** 🟡 MÉDIA
- **Complexidade:** Alta
- **Tempo estimado:** 7-10 dias

**Entregas:**
- [ ] Nova rota `/reports/financial`
- [ ] DRE (Demonstração do Resultado do Exercício)
- [ ] Análise de Lucratividade (por serviço, produto, profissional)
- [ ] Relatório de Despesas por Categoria
- [ ] Relatório de Receitas por Origem
- [ ] Comparativos mensais/anuais
- [ ] Exportação de relatórios

**Arquivos a criar:**
```
src/app/(app)/reports/financial/
  ├── page.tsx
  ├── dre/page.tsx
  ├── profitability/page.tsx
  └── actions.ts

src/components/reports/
  ├── DREReport.tsx
  ├── ProfitabilityAnalysis.tsx
  ├── ExpensesByCategory.tsx
  ├── RevenueBySource.tsx
  ├── ComparativeReport.tsx
  └── ReportFilters.tsx

src/core/usecases/reports/
  ├── GenerateDRE.ts
  ├── CalculateProfitability.ts
  ├── GetExpensesByCategory.ts
  └── GetRevenueBySource.ts

src/lib/utils/
  └── reportGenerators.ts
```

---

## 📊 Métricas e KPIs

### Dashboard Principal
**Cards:**
- Saldo Atual
- Receita do Mês
- Despesa do Mês
- Lucro Líquido
- Margem de Lucro (%)
- Contas a Receber (30 dias)
- Contas a Pagar (30 dias)
- Projeção de Saldo (30 dias)

**Gráficos:**
- Evolução do Saldo (linha)
- Entradas vs Saídas (barras)
- Distribuição de Despesas (pizza)
- Fluxo de Caixa Projetado (área)
- Lucratividade por Serviço (barras horizontais)

**Alertas:**
- 🔴 Saldo projetado negativo
- 🟡 Contas vencidas
- 🟡 Baixo saldo em conta
- 🔵 Meta de receita atingida

---

## 🎨 Design System

### Cores para Métricas Financeiras
```typescript
const financialColors = {
  positive: '#10b981', // green-500
  negative: '#ef4444', // red-500
  neutral: '#6b7280',  // gray-500
  warning: '#f59e0b',  // amber-500
  info: '#3b82f6',     // blue-500
};
```

### Ícones Sugeridos (lucide-react)
- `TrendingUp` / `TrendingDown` - Tendências
- `DollarSign` - Valores monetários
- `AlertCircle` - Alertas
- `Calendar` - Datas
- `PieChart` - Gráficos
- `BarChart3` - Análises
- `Wallet` - Contas
- `ArrowUpRight` / `ArrowDownRight` - Movimentações

---

## 🧪 Testes

### Cobertura Mínima
- [ ] Testes unitários para use cases (>80%)
- [ ] Testes de integração para repositórios
- [ ] Testes E2E para fluxos críticos
- [ ] Testes de performance para queries complexas

### Casos de Teste Críticos
1. Cálculo correto de projeções
2. Conciliação automática de transações
3. Geração de DRE
4. Cálculo de lucratividade
5. Sistema de alertas

---

## 📚 Documentação

### Documentos a Criar
- [ ] Manual do Usuário - Dashboard Financeiro
- [ ] Manual do Usuário - Projeção de Fluxo de Caixa
- [ ] Manual do Usuário - Conciliação Bancária
- [ ] Guia de Configuração - Centro de Custos
- [ ] Guia de Configuração - Alertas
- [ ] API Documentation - Endpoints financeiros

---

## 🔐 Segurança e Permissões

### Níveis de Acesso
```typescript
enum FinancialPermission {
  VIEW_DASHBOARD = 'financial:view_dashboard',
  VIEW_REPORTS = 'financial:view_reports',
  MANAGE_ACCOUNTS = 'financial:manage_accounts',
  MANAGE_PROJECTIONS = 'financial:manage_projections',
  RECONCILE_ACCOUNTS = 'financial:reconcile_accounts',
  EXPORT_DATA = 'financial:export_data',
  MANAGE_SETTINGS = 'financial:manage_settings',
}
```

### Auditoria
- [ ] Log de todas as operações financeiras
- [ ] Rastreamento de alterações em valores
- [ ] Histórico de conciliações
- [ ] Registro de exportações

---

## 📦 Dependências Adicionais

```json
{
  "dependencies": {
    "recharts": "^2.10.0",
    "date-fns": "^3.0.0",
    "xlsx": "^0.18.5",
    "jspdf": "^2.5.1"
  }
}
```

---

## 🚦 Critérios de Aceitação

### Fase 1
- [ ] Dashboard carrega em menos de 2 segundos
- [ ] Projeções calculadas corretamente
- [ ] Filtros funcionando perfeitamente
- [ ] Exportação gerando arquivos válidos

### Fase 2
- [ ] Centro de custos com hierarquia funcional
- [ ] Transferências entre contas registradas corretamente
- [ ] DRE gerado conforme padrão contábil
- [ ] Relatórios exportáveis

---

## 📞 Suporte e Manutenção

### Monitoramento
- [ ] Logs de erros em operações financeiras
- [ ] Métricas de performance de queries
- [ ] Alertas de falhas em integrações
- [ ] Backup diário de dados financeiros

### Manutenção Preventiva
- [ ] Revisão mensal de projeções vs realizado
- [ ] Limpeza de dados antigos (>2 anos)
- [ ] Atualização de categorias e centros de custos
- [ ] Revisão de permissões de usuários

---

## 📝 Notas Importantes

1. **Migração de Dados:** Todas as alterações de schema devem incluir migrations
2. **Backward Compatibility:** Manter compatibilidade com dados existentes
3. **Performance:** Queries complexas devem usar índices apropriados
4. **UX:** Manter consistência com o design atual do sistema
5. **Mobile:** Garantir responsividade em todas as telas

---

**Última atualização:** 2025-02-25
**Versão:** 1.0
**Status:** 📋 Planejamento
