# FASE 2 - Gestão Avançada

**Duração estimada:** 3-4 semanas  
**Objetivo:** Adicionar centro de custos, projetos e relatórios gerenciais

---

## Task 2.1: Centro de Custos e Projetos

**Prioridade:** 🟡 MÉDIA  
**Complexidade:** Média  
**Tempo estimado:** 5-7 dias  
**Responsável:** [A definir]

### Descrição
Implementar sistema de centro de custos e projetos para permitir categorização avançada de despesas e receitas, facilitando análise gerencial detalhada.

### Objetivos
- Permitir categorização hierárquica de despesas
- Rastrear custos por projeto
- Facilitar análise de rentabilidade por centro/projeto
- Melhorar controle gerencial

### Entregas

#### 2.1.1 Estrutura de Banco de Dados
- [ ] Criar migration para tabela `cost_centers`
- [ ] Criar migration para tabela `projects`
- [ ] Adicionar colunas em tabelas existentes

**Migrations:**
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
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT cost_centers_name_unique UNIQUE (tenant_id, name)
);

CREATE INDEX idx_cost_centers_tenant ON cost_centers(tenant_id);
CREATE INDEX idx_cost_centers_parent ON cost_centers(parent_id);
CREATE INDEX idx_cost_centers_active ON cost_centers(is_active) WHERE is_active = true;

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
  status TEXT CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED', 'ON_HOLD')) DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT projects_name_unique UNIQUE (tenant_id, name)
);

CREATE INDEX idx_projects_tenant ON projects(tenant_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_dates ON projects(start_date, end_date);

-- Adicionar às tabelas existentes
ALTER TABLE cash_movements 
  ADD COLUMN cost_center_id UUID REFERENCES cost_centers(id),
  ADD COLUMN project_id UUID REFERENCES projects(id);

ALTER TABLE accounts_payable
  ADD COLUMN cost_center_id UUID REFERENCES cost_centers(id),
  ADD COLUMN project_id UUID REFERENCES projects(id);

CREATE INDEX idx_cash_movements_cost_center ON cash_movements(cost_center_id);
CREATE INDEX idx_cash_movements_project ON cash_movements(project_id);
CREATE INDEX idx_accounts_payable_cost_center ON accounts_payable(cost_center_id);
CREATE INDEX idx_accounts_payable_project ON accounts_payable(project_id);
```

#### 2.1.2 Entidades de Domínio
- [ ] `CostCenter.ts` - Entidade de centro de custos
- [ ] `Project.ts` - Entidade de projeto

**Arquivos:**
```
src/core/domain/entities/
  ├── CostCenter.ts
  └── Project.ts
```

**Interfaces:**
```typescript
// CostCenter.ts
interface CostCenter {
  id: string;
  tenantId: string;
  name: string;
  code?: string;
  parentId?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Computed
  parent?: CostCenter;
  children?: CostCenter[];
  level?: number;
  fullPath?: string; // Ex: "Operações > Marketing > Digital"
}

// Project.ts
interface Project {
  id: string;
  tenantId: string;
  name: string;
  code?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD';
  createdAt: Date;
  updatedAt: Date;
  
  // Computed
  spent?: number;
  remaining?: number;
  percentageUsed?: number;
  isOverBudget?: boolean;
}
```

#### 2.1.3 Rotas e Páginas
- [ ] Criar rota `/settings/cost-centers`
- [ ] Criar rota `/settings/projects`
- [ ] Criar páginas de listagem e gerenciamento

**Arquivos:**
```
src/app/(app)/settings/cost-centers/
  ├── page.tsx
  └── actions.ts

src/app/(app)/settings/projects/
  ├── page.tsx
  └── actions.ts
```

#### 2.1.4 Componentes de Centro de Custos
- [ ] `CostCenterDialog.tsx` - Dialog para criar/editar
- [ ] `CostCenterTree.tsx` - Visualização em árvore hierárquica
- [ ] `CostCenterSelector.tsx` - Seletor para usar em formulários

**Arquivos:**
```
src/components/cost-centers/
  ├── CostCenterDialog.tsx
  ├── CostCenterTree.tsx
  └── CostCenterSelector.tsx
```

**Funcionalidades do Tree:**
- Expandir/colapsar níveis
- Drag & drop para reorganizar
- Indicador visual de nível
- Ações inline (editar, excluir, adicionar filho)

#### 2.1.5 Componentes de Projetos
- [ ] `ProjectDialog.tsx` - Dialog para criar/editar
- [ ] `ProjectCard.tsx` - Card com informações do projeto
- [ ] `ProjectSelector.tsx` - Seletor para usar em formulários

**Arquivos:**
```
src/components/projects/
  ├── ProjectDialog.tsx
  ├── ProjectCard.tsx
  └── ProjectSelector.tsx
```

**ProjectCard deve mostrar:**
- Nome e código do projeto
- Status (badge colorido)
- Datas (início e fim)
- Orçamento vs Gasto (barra de progresso)
- Ações (editar, visualizar detalhes)

#### 2.1.6 Use Cases - Centro de Custos
- [ ] `CreateCostCenter.ts`
- [ ] `UpdateCostCenter.ts`
- [ ] `DeleteCostCenter.ts`
- [ ] `ListCostCenters.ts`
- [ ] `GetCostCenterHierarchy.ts`

**Arquivos:**
```
src/core/usecases/cost-centers/
  ├── CreateCostCenter.ts
  ├── UpdateCostCenter.ts
  ├── DeleteCostCenter.ts
  ├── ListCostCenters.ts
  └── GetCostCenterHierarchy.ts
```

**Regras de Negócio:**
- Não permitir exclusão se houver movimentações associadas
- Não permitir ciclos na hierarquia (pai não pode ser filho)
- Ao desativar, desativar todos os filhos
- Validar unicidade de nome dentro do tenant

#### 2.1.7 Use Cases - Projetos
- [ ] `CreateProject.ts`
- [ ] `UpdateProject.ts`
- [ ] `DeleteProject.ts`
- [ ] `ListProjects.ts`
- [ ] `GetProjectSummary.ts`

**Arquivos:**
```
src/core/usecases/projects/
  ├── CreateProject.ts
  ├── UpdateProject.ts
  ├── DeleteProject.ts
  ├── ListProjects.ts
  └── GetProjectSummary.ts
```

**Regras de Negócio:**
- Não permitir exclusão se houver movimentações associadas
- Validar datas (fim >= início)
- Calcular automaticamente valores gastos
- Alertar quando ultrapassar orçamento

#### 2.1.8 Repositories
- [ ] `CostCenterRepository.ts`
- [ ] `ProjectRepository.ts`

**Arquivos:**
```
src/infrastructure/repositories/
  ├── CostCenterRepository.ts
  └── ProjectRepository.ts
```

#### 2.1.9 Integração com Formulários Existentes
- [ ] Adicionar seletor de centro de custos em `CashMovementDialog`
- [ ] Adicionar seletor de projeto em `CashMovementDialog`
- [ ] Adicionar seletor de centro de custos em `AccountPayableDialog`
- [ ] Adicionar seletor de projeto em `AccountPayableDialog`

### Critérios de Aceitação
- [ ] Hierarquia de centros de custos funciona corretamente
- [ ] Projetos podem ser criados e gerenciados
- [ ] Movimentações podem ser associadas a centros/projetos
- [ ] Não é possível criar ciclos na hierarquia
- [ ] Validações de negócio funcionam
- [ ] Interface é intuitiva

### Testes
- [ ] Teste de hierarquia de centros de custos
- [ ] Teste de validações de negócio
- [ ] Teste de cálculo de valores por projeto
- [ ] Teste E2E de criação e associação

---

## Task 2.2: Gestão de Múltiplas Contas Bancárias

**Prioridade:** 🟡 MÉDIA  
**Complexidade:** Média  
**Tempo estimado:** 5-7 dias  
**Responsável:** [A definir]

### Descrição
Criar dashboard consolidado para gestão de múltiplas contas bancárias, incluindo transferências entre contas, histórico detalhado e visualizações por conta.

### Objetivos
- Visualizar saldo de todas as contas em um único lugar
- Facilitar transferências entre contas
- Agendar transferências futuras
- Analisar movimentações por conta

### Entregas

#### 2.2.1 Estrutura de Banco de Dados
- [ ] Criar tabela `bank_transfers`

**Migration:**
```sql
CREATE TABLE bank_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  from_account_id UUID NOT NULL REFERENCES bank_accounts(id),
  to_account_id UUID NOT NULL REFERENCES bank_accounts(id),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  scheduled_date DATE NOT NULL,
  executed_date DATE,
  status TEXT CHECK (status IN ('SCHEDULED', 'EXECUTED', 'CANCELLED')) DEFAULT 'SCHEDULED',
  description TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT different_accounts CHECK (from_account_id != to_account_id)
);

CREATE INDEX idx_bank_transfers_tenant ON bank_transfers(tenant_id);
CREATE INDEX idx_bank_transfers_from ON bank_transfers(from_account_id);
CREATE INDEX idx_bank_transfers_to ON bank_transfers(to_account_id);
CREATE INDEX idx_bank_transfers_status ON bank_transfers(status);
CREATE INDEX idx_bank_transfers_scheduled ON bank_transfers(scheduled_date) WHERE status = 'SCHEDULED';
```

#### 2.2.2 Entidade de Domínio
- [ ] `BankTransfer.ts`

**Arquivos:**
```
src/core/domain/entities/
  └── BankTransfer.ts
```

**Interface:**
```typescript
interface BankTransfer {
  id: string;
  tenantId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  scheduledDate: Date;
  executedDate?: Date;
  status: 'SCHEDULED' | 'EXECUTED' | 'CANCELLED';
  description?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Computed
  fromAccount?: BankAccount;
  toAccount?: BankAccount;
  isPending?: boolean;
  isOverdue?: boolean;
}
```

#### 2.2.3 Rotas e Páginas
- [ ] Criar rota `/bank-accounts/dashboard`
- [ ] Criar página de dashboard

**Arquivos:**
```
src/app/(app)/bank-accounts/dashboard/
  ├── page.tsx
  └── actions.ts
```

#### 2.2.4 Componentes
- [ ] `BankAccountsDashboard.tsx` - Dashboard principal
- [ ] `BankAccountCard.tsx` - Card de conta individual
- [ ] `TransferDialog.tsx` - Dialog para criar transferência
- [ ] `TransferHistory.tsx` - Histórico de transferências
- [ ] `AccountBalanceChart.tsx` - Gráfico de evolução de saldo

**Arquivos:**
```
src/components/bank-accounts/
  ├── BankAccountsDashboard.tsx
  ├── BankAccountCard.tsx
  ├── TransferDialog.tsx
  ├── TransferHistory.tsx
  └── AccountBalanceChart.tsx
```

**BankAccountCard deve mostrar:**
- Nome e tipo da conta
- Ícone e cor personalizados
- Saldo atual
- Limite de crédito (se aplicável)
- Saldo disponível
- Movimentações do período
- Projeção de saldo
- Ações rápidas (transferir, ver histórico)

#### 2.2.5 Use Cases
- [ ] `GetAccountsDashboard.ts` - Buscar dados do dashboard
- [ ] `CreateTransfer.ts` - Criar transferência
- [ ] `ExecuteTransfer.ts` - Executar transferência agendada
- [ ] `CancelTransfer.ts` - Cancelar transferência
- [ ] `GetAccountHistory.ts` - Histórico de uma conta
- [ ] `GetAccountBalance.ts` - Saldo e projeção

**Arquivos:**
```
src/core/usecases/bank-accounts/
  ├── GetAccountsDashboard.ts
  ├── CreateTransfer.ts
  ├── ExecuteTransfer.ts
  ├── CancelTransfer.ts
  ├── GetAccountHistory.ts
  └── GetAccountBalance.ts
```

**Lógica de Transferência:**
```typescript
async function executeTransfer(transferId: string) {
  // 1. Buscar transferência
  const transfer = await getTransfer(transferId);
  
  // 2. Validar status
  if (transfer.status !== 'SCHEDULED') {
    throw new Error('Transfer already executed or cancelled');
  }
  
  // 3. Validar saldo
  const fromBalance = await getAccountBalance(transfer.fromAccountId);
  if (fromBalance < transfer.amount) {
    throw new Error('Insufficient balance');
  }
  
  // 4. Criar movimentações
  await createCashMovement({
    type: 'OUT',
    amount: transfer.amount,
    bankAccountId: transfer.fromAccountId,
    sourceType: 'TRANSFER',
    sourceId: transfer.id,
    description: `Transferência para ${transfer.toAccount.name}`,
  });
  
  await createCashMovement({
    type: 'IN',
    amount: transfer.amount,
    bankAccountId: transfer.toAccountId,
    sourceType: 'TRANSFER',
    sourceId: transfer.id,
    description: `Transferência de ${transfer.fromAccount.name}`,
  });
  
  // 5. Atualizar status
  await updateTransfer(transferId, {
    status: 'EXECUTED',
    executedDate: new Date(),
  });
}
```

#### 2.2.6 Job Agendado (Opcional)
- [ ] Criar job para executar transferências agendadas automaticamente

**Arquivo:**
```
src/jobs/executeScheduledTransfers.ts
```

**Lógica:**
```typescript
// Executar diariamente às 00:00
async function executeScheduledTransfers() {
  const today = new Date();
  
  const pendingTransfers = await getTransfers({
    status: 'SCHEDULED',
    scheduledDate: { lte: today }
  });
  
  for (const transfer of pendingTransfers) {
    try {
      await executeTransfer(transfer.id);
    } catch (error) {
      console.error(`Failed to execute transfer ${transfer.id}:`, error);
      // Notificar usuário sobre falha
    }
  }
}
```

### Critérios de Aceitação
- [ ] Dashboard mostra todas as contas corretamente
- [ ] Transferências são criadas e executadas corretamente
- [ ] Saldos são atualizados após transferências
- [ ] Não é possível transferir para a mesma conta
- [ ] Validação de saldo funciona
- [ ] Histórico mostra todas as movimentações

### Testes
- [ ] Teste de criação de transferência
- [ ] Teste de execução de transferência
- [ ] Teste de validação de saldo
- [ ] Teste de atualização de saldos
- [ ] Teste E2E do fluxo completo

---

## Task 2.3: Relatórios Gerenciais

**Prioridade:** 🟡 MÉDIA  
**Complexidade:** Alta  
**Tempo estimado:** 7-10 dias  
**Responsável:** [A definir]

### Descrição
Implementar sistema completo de relatórios gerenciais incluindo DRE, análise de lucratividade e relatórios customizados.

### Objetivos
- Fornecer visão contábil do negócio (DRE)
- Analisar lucratividade por diferentes dimensões
- Permitir análise de despesas e receitas
- Facilitar tomada de decisões gerenciais

### Entregas

#### 2.3.1 Rotas e Páginas
- [ ] Criar rota `/reports/financial`
- [ ] Criar rota `/reports/financial/dre`
- [ ] Criar rota `/reports/financial/profitability`

**Arquivos:**
```
src/app/(app)/reports/financial/
  ├── page.tsx
  ├── dre/
  │   └── page.tsx
  ├── profitability/
  │   └── page.tsx
  └── actions.ts
```

#### 2.3.2 Componentes de Relatórios
- [ ] `DREReport.tsx` - Demonstração do Resultado do Exercício
- [ ] `ProfitabilityAnalysis.tsx` - Análise de lucratividade
- [ ] `ExpensesByCategory.tsx` - Despesas por categoria
- [ ] `RevenueBySource.tsx` - Receitas por origem
- [ ] `ComparativeReport.tsx` - Comparativos mensais/anuais
- [ ] `ReportFilters.tsx` - Filtros para relatórios

**Arquivos:**
```
src/components/reports/
  ├── DREReport.tsx
  ├── ProfitabilityAnalysis.tsx
  ├── ExpensesByCategory.tsx
  ├── RevenueBySource.tsx
  ├── ComparativeReport.tsx
  └── ReportFilters.tsx
```

#### 2.3.3 DRE (Demonstração do Resultado do Exercício)

**Interface:**
```typescript
interface IncomeStatement {
  period: { start: Date; end: Date };
  
  // RECEITAS
  revenue: {
    services: number;
    products: number;
    other: number;
    total: number;
  };
  
  // (-) CUSTOS
  costs: {
    products: number; // CMV - Custo das Mercadorias Vendidas
    services: number; // Custo dos Serviços Prestados
    total: number;
  };
  
  // (=) LUCRO BRUTO
  grossProfit: number;
  grossMargin: number; // %
  
  // (-) DESPESAS OPERACIONAIS
  operatingExpenses: {
    byCategory: Record<string, number>;
    total: number;
  };
  
  // (=) LUCRO OPERACIONAL
  operatingProfit: number;
  operatingMargin: number; // %
  
  // (-) DESPESAS FINANCEIRAS
  financialExpenses: number;
  
  // (+) RECEITAS FINANCEIRAS
  financialRevenue: number;
  
  // (=) LUCRO LÍQUIDO
  netProfit: number;
  netMargin: number; // %
}
```

**Cálculos:**
```typescript
// Receita Total
revenue.total = revenue.services + revenue.products + revenue.other;

// Custo Total
costs.total = costs.products + costs.services;

// Lucro Bruto
grossProfit = revenue.total - costs.total;
grossMargin = (grossProfit / revenue.total) * 100;

// Lucro Operacional
operatingProfit = grossProfit - operatingExpenses.total;
operatingMargin = (operatingProfit / revenue.total) * 100;

// Lucro Líquido
netProfit = operatingProfit - financialExpenses + financialRevenue;
netMargin = (netProfit / revenue.total) * 100;
```

#### 2.3.4 Análise de Lucratividade

**Interface:**
```typescript
interface ProfitabilityAnalysis {
  period: { start: Date; end: Date };
  
  // Por Serviço
  byService: {
    serviceId: string;
    serviceName: string;
    revenue: number;
    cost: number;
    profit: number;
    margin: number; // %
    quantity: number;
    avgTicket: number;
  }[];
  
  // Por Produto
  byProduct: {
    productId: string;
    productName: string;
    revenue: number;
    cost: number;
    profit: number;
    margin: number; // %
    quantity: number;
    avgPrice: number;
  }[];
  
  // Por Profissional
  byProfessional: {
    professionalId: string;
    professionalName: string;
    revenue: number;
    commission: number;
    netRevenue: number;
    servicesCount: number;
    avgTicket: number;
  }[];
  
  // Por Cliente
  byClient: {
    clientId: string;
    clientName: string;
    revenue: number;
    purchaseCount: number;
    avgTicket: number;
    lastPurchase: Date;
  }[];
  
  // Por Centro de Custos
  byCostCenter?: {
    costCenterId: string;
    costCenterName: string;
    expenses: number;
    percentage: number;
  }[];
  
  // Por Projeto
  byProject?: {
    projectId: string;
    projectName: string;
    budget: number;
    spent: number;
    remaining: number;
    percentageUsed: number;
  }[];
}
```

#### 2.3.5 Use Cases
- [ ] `GenerateDRE.ts` - Gerar DRE
- [ ] `CalculateProfitability.ts` - Calcular lucratividade
- [ ] `GetExpensesByCategory.ts` - Despesas por categoria
- [ ] `GetRevenueBySource.ts` - Receitas por origem
- [ ] `GenerateComparative.ts` - Gerar comparativos

**Arquivos:**
```
src/core/usecases/reports/
  ├── GenerateDRE.ts
  ├── CalculateProfitability.ts
  ├── GetExpensesByCategory.ts
  ├── GetRevenueBySource.ts
  └── GenerateComparative.ts
```

#### 2.3.6 Queries SQL Otimizadas

**DRE:**
```sql
-- Receitas
WITH revenue AS (
  SELECT
    SUM(CASE WHEN si.item_type = 'service' THEN si.total_price ELSE 0 END) as services,
    SUM(CASE WHEN si.item_type = 'product' THEN si.total_price ELSE 0 END) as products
  FROM sales s
  JOIN sale_items si ON si.sale_id = s.id
  WHERE s.tenant_id = $1
    AND s.status = 'paid'
    AND s.created_at BETWEEN $2 AND $3
),
-- Custos
costs AS (
  SELECT
    SUM(CASE WHEN si.item_type = 'product' THEN si.cost_snapshot * si.qty ELSE 0 END) as products,
    SUM(CASE WHEN si.item_type = 'service' THEN s.cost * si.qty ELSE 0 END) as services
  FROM sales sa
  JOIN sale_items si ON si.sale_id = sa.id
  LEFT JOIN services s ON s.id = si.service_id
  WHERE sa.tenant_id = $1
    AND sa.status = 'paid'
    AND sa.created_at BETWEEN $2 AND $3
),
-- Despesas Operacionais
expenses AS (
  SELECT
    category,
    SUM(amount) as total
  FROM accounts_payable
  WHERE tenant_id = $1
    AND payment_status = 'PAID'
    AND due_date BETWEEN $2 AND $3
  GROUP BY category
)
SELECT * FROM revenue, costs, expenses;
```

**Lucratividade por Serviço:**
```sql
SELECT
  s.id,
  s.name,
  COUNT(si.id) as quantity,
  SUM(si.total_price) as revenue,
  SUM(s.cost * si.qty) as cost,
  SUM(si.total_price - (s.cost * si.qty)) as profit,
  ROUND(
    (SUM(si.total_price - (s.cost * si.qty)) / NULLIF(SUM(si.total_price), 0)) * 100,
    2
  ) as margin,
  ROUND(SUM(si.total_price) / COUNT(si.id), 2) as avg_ticket
FROM services s
JOIN sale_items si ON si.service_id = s.id
JOIN sales sa ON sa.id = si.sale_id
WHERE sa.tenant_id = $1
  AND sa.status = 'paid'
  AND sa.created_at BETWEEN $2 AND $3
GROUP BY s.id, s.name
ORDER BY profit DESC;
```

#### 2.3.7 Exportação de Relatórios
- [ ] Adicionar botão de exportação em cada relatório
- [ ] Suportar Excel e PDF
- [ ] Incluir gráficos na exportação

**Arquivos:**
```
src/lib/utils/
  └── reportGenerators.ts
```

**Funções:**
```typescript
export async function exportDREToExcel(dre: IncomeStatement): Promise<Blob>;
export async function exportDREToPDF(dre: IncomeStatement): Promise<Blob>;
export async function exportProfitabilityToExcel(data: ProfitabilityAnalysis): Promise<Blob>;
```

### Critérios de Aceitação
- [ ] DRE é calculado corretamente
- [ ] Lucratividade por dimensão está precisa
- [ ] Relatórios são exportáveis
- [ ] Filtros funcionam corretamente
- [ ] Performance é adequada (< 3s)
- [ ] Gráficos são claros e informativos

### Testes
- [ ] Teste de cálculo de DRE
- [ ] Teste de cálculo de lucratividade
- [ ] Teste de queries SQL
- [ ] Teste de exportação
- [ ] Teste E2E de geração de relatórios

---

## Checklist Geral da Fase 2

### Antes de Começar
- [ ] Fase 1 concluída e testada
- [ ] Revisar documentação da Fase 2
- [ ] Criar branch `feature/fase-2-gestao-avancada`
- [ ] Configurar ambiente

### Durante o Desenvolvimento
- [ ] Seguir padrões estabelecidos na Fase 1
- [ ] Escrever testes para cada funcionalidade
- [ ] Documentar queries SQL complexas
- [ ] Otimizar performance de relatórios
- [ ] Fazer commits atômicos

### Ao Finalizar
- [ ] Todos os testes passando
- [ ] Performance validada
- [ ] Documentação atualizada
- [ ] Demo preparada
- [ ] PR criado para revisão

---

## Dependências

### Já instaladas na Fase 1
- recharts
- date-fns
- xlsx
- jspdf

### Novas (se necessário)
```bash
npm install lodash
npm install -D @types/lodash
```

---

## Notas Técnicas

### Performance de Relatórios
- Usar índices apropriados no banco
- Implementar cache para relatórios frequentes
- Considerar materialização de views para queries complexas
- Usar paginação quando aplicável

### Hierarquia de Centro de Custos
- Limitar profundidade máxima (ex: 5 níveis)
- Implementar validação de ciclos
- Usar recursive CTE para queries hierárquicas

### Validações de Negócio
- Validar datas de projetos
- Validar orçamentos
- Validar transferências entre contas
- Validar associações antes de excluir

---

**Status:** 📋 Pronto para iniciar após Fase 1  
**Última atualização:** 2025-02-25
