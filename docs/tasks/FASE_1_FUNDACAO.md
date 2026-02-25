# FASE 1 - Fundação do Fluxo de Caixa

**Duração estimada:** 2-3 semanas  
**Objetivo:** Criar visão consolidada e projeções básicas do fluxo de caixa

---

## Task 1.1: Dashboard Financeiro Consolidado

**Prioridade:** 🔴 ALTA  
**Complexidade:** Média  
**Tempo estimado:** 5-7 dias  
**Responsável:** [A definir]

### Descrição
Criar um dashboard financeiro consolidado que apresente uma visão geral da saúde financeira do negócio, incluindo métricas principais, gráficos de tendências e alertas.

### Objetivos
- Fornecer visão única e consolidada do fluxo de caixa
- Apresentar métricas financeiras principais de forma clara
- Permitir análise rápida da situação financeira
- Identificar problemas e oportunidades através de alertas

### Entregas

#### 1.1.1 Estrutura de Rotas e Páginas
- [ ] Criar rota `/dashboard/financial`
- [ ] Criar página principal do dashboard
- [ ] Criar actions para buscar dados

**Arquivos:**
```
src/app/(app)/dashboard/financial/
  ├── page.tsx
  └── actions.ts
```

#### 1.1.2 Componentes de Métricas
- [ ] `FinancialMetricsCards.tsx` - Cards com métricas principais
  - Saldo Atual
  - Receita do Mês
  - Despesa do Mês
  - Lucro Líquido
  - Margem de Lucro
  - Contas a Receber (30 dias)
  - Contas a Pagar (30 dias)
  - Projeção de Saldo (30 dias)

**Arquivos:**
```
src/components/dashboard/
  └── FinancialMetricsCards.tsx
```

**Interface:**
```typescript
interface FinancialMetrics {
  currentBalance: number;
  monthRevenue: number;
  monthExpenses: number;
  netProfit: number;
  profitMargin: number;
  receivables30Days: number;
  payables30Days: number;
  projectedBalance30Days: number;
  
  // Comparativos
  revenueGrowth: number; // %
  expensesGrowth: number; // %
  profitGrowth: number; // %
}
```

#### 1.1.3 Gráfico de Evolução do Saldo
- [ ] `CashFlowChart.tsx` - Gráfico de linha mostrando evolução do saldo

**Arquivos:**
```
src/components/dashboard/
  └── CashFlowChart.tsx
```

**Dados:**
```typescript
interface CashFlowData {
  date: Date;
  balance: number;
  inflow: number;
  outflow: number;
}[]
```

#### 1.1.4 Gráfico de Entradas vs Saídas
- [ ] `InflowOutflowChart.tsx` - Gráfico de barras comparando entradas e saídas

**Arquivos:**
```
src/components/dashboard/
  └── InflowOutflowChart.tsx
```

#### 1.1.5 Lista de Contas Bancárias
- [ ] `BankAccountsList.tsx` - Lista com saldo de cada conta

**Arquivos:**
```
src/components/dashboard/
  └── BankAccountsList.tsx
```

**Interface:**
```typescript
interface BankAccountSummary {
  id: string;
  name: string;
  type: 'BANK' | 'CARD' | 'WALLET';
  balance: number;
  icon: string;
  color: string;
}
```

#### 1.1.6 Sistema de Alertas
- [ ] `FinancialAlerts.tsx` - Componente de alertas financeiros

**Arquivos:**
```
src/components/dashboard/
  └── FinancialAlerts.tsx
```

**Tipos de Alertas:**
- 🔴 Saldo projetado negativo
- 🟡 Contas vencidas
- 🟡 Baixo saldo em conta
- 🔵 Meta de receita atingida

**Interface:**
```typescript
interface FinancialAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  value?: number;
  action?: {
    label: string;
    href: string;
  };
}
```

#### 1.1.7 Use Cases
- [ ] `GetFinancialSummary.ts` - Buscar resumo financeiro
- [ ] `GetCashFlowData.ts` - Buscar dados do fluxo de caixa
- [ ] `GetFinancialAlerts.ts` - Gerar alertas financeiros

**Arquivos:**
```
src/core/usecases/dashboard/
  ├── GetFinancialSummary.ts
  ├── GetCashFlowData.ts
  └── GetFinancialAlerts.ts
```

#### 1.1.8 Hook Customizado
- [ ] `useFinancialDashboard.ts` - Hook para gerenciar estado do dashboard

**Arquivos:**
```
src/hooks/
  └── useFinancialDashboard.ts
```

### Critérios de Aceitação
- [ ] Dashboard carrega em menos de 2 segundos
- [ ] Todas as métricas são calculadas corretamente
- [ ] Gráficos são responsivos e interativos
- [ ] Alertas são gerados automaticamente
- [ ] Interface é intuitiva e fácil de usar
- [ ] Funciona em mobile e desktop

### Testes
- [ ] Teste unitário para cálculo de métricas
- [ ] Teste de integração para busca de dados
- [ ] Teste E2E para navegação no dashboard

---

## Task 1.2: Projeção de Fluxo de Caixa

**Prioridade:** 🔴 ALTA  
**Complexidade:** Alta  
**Tempo estimado:** 7-10 dias  
**Responsável:** [A definir]

### Descrição
Implementar sistema de projeção de fluxo de caixa que calcule automaticamente entradas e saídas futuras baseado em recebíveis, contas a pagar e despesas recorrentes.

### Objetivos
- Prever saldo futuro com base em dados existentes
- Identificar possíveis problemas de liquidez
- Permitir planejamento financeiro
- Suportar diferentes cenários (otimista, realista, pessimista)

### Entregas

#### 1.2.1 Estrutura de Rotas e Páginas
- [ ] Criar rota `/cash/projection`
- [ ] Criar página de projeção
- [ ] Criar actions para cálculos

**Arquivos:**
```
src/app/(app)/cash/projection/
  ├── page.tsx
  └── actions.ts
```

#### 1.2.2 Entidade de Projeção
- [ ] Criar entidade `CashFlowProjection`

**Arquivos:**
```
src/core/domain/entities/
  └── CashFlowProjection.ts
```

**Interface:**
```typescript
interface CashFlowProjection {
  projectionDate: Date;
  
  // Entradas Previstas
  expectedInflows: {
    source: 'RECEIVABLES' | 'RECURRING' | 'ESTIMATED';
    amount: number;
    date: Date;
    description: string;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  }[];
  
  // Saídas Previstas
  expectedOutflows: {
    source: 'PAYABLES' | 'RECURRING' | 'ESTIMATED';
    amount: number;
    date: Date;
    description: string;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  }[];
  
  // Projeção Diária
  dailyProjection: {
    date: Date;
    openingBalance: number;
    inflows: number;
    outflows: number;
    closingBalance: number;
    minimumRequired: number;
  }[];
  
  // Cenários
  scenario: 'OPTIMISTIC' | 'REALISTIC' | 'PESSIMISTIC';
}
```

#### 1.2.3 Tabela de Despesas Recorrentes
- [ ] Criar migration para tabela `recurring_expenses`

**Migration:**
```sql
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

CREATE INDEX idx_recurring_expenses_tenant ON recurring_expenses(tenant_id);
CREATE INDEX idx_recurring_expenses_active ON recurring_expenses(is_active) WHERE is_active = true;
```

#### 1.2.4 Componentes de Projeção
- [ ] `ProjectionChart.tsx` - Gráfico de área com projeção
- [ ] `ProjectionTable.tsx` - Tabela detalhada de projeções
- [ ] `ScenarioSelector.tsx` - Seletor de cenários
- [ ] `RecurringExpensesDialog.tsx` - Dialog para gerenciar despesas recorrentes

**Arquivos:**
```
src/components/cash/projection/
  ├── ProjectionChart.tsx
  ├── ProjectionTable.tsx
  ├── ScenarioSelector.tsx
  └── RecurringExpensesDialog.tsx
```

#### 1.2.5 Use Cases
- [ ] `CalculateCashFlowProjection.ts` - Calcular projeção
- [ ] `ManageRecurringExpenses.ts` - CRUD de despesas recorrentes

**Arquivos:**
```
src/core/usecases/cash/
  ├── CalculateCashFlowProjection.ts
  └── ManageRecurringExpenses.ts
```

**Lógica de Cálculo:**
```typescript
// Pseudocódigo
function calculateProjection(
  startDate: Date,
  endDate: Date,
  scenario: Scenario
): CashFlowProjection {
  // 1. Buscar saldo atual
  const currentBalance = getCurrentBalance();
  
  // 2. Buscar recebíveis pendentes
  const receivables = getReceivables(startDate, endDate);
  
  // 3. Buscar contas a pagar pendentes
  const payables = getPayables(startDate, endDate);
  
  // 4. Buscar despesas recorrentes
  const recurring = getRecurringExpenses(startDate, endDate);
  
  // 5. Aplicar fator de confiança baseado no cenário
  const confidenceFactor = {
    OPTIMISTIC: 1.0,
    REALISTIC: 0.85,
    PESSIMISTIC: 0.7
  }[scenario];
  
  // 6. Calcular projeção diária
  const dailyProjection = [];
  let balance = currentBalance;
  
  for (let date = startDate; date <= endDate; date++) {
    const dayInflows = calculateDayInflows(date, receivables, confidenceFactor);
    const dayOutflows = calculateDayOutflows(date, payables, recurring);
    
    balance = balance + dayInflows - dayOutflows;
    
    dailyProjection.push({
      date,
      openingBalance: balance - dayInflows + dayOutflows,
      inflows: dayInflows,
      outflows: dayOutflows,
      closingBalance: balance,
      minimumRequired: 1000 // Configurável
    });
  }
  
  return {
    projectionDate: new Date(),
    expectedInflows: [...],
    expectedOutflows: [...],
    dailyProjection,
    scenario
  };
}
```

#### 1.2.6 Repository
- [ ] `RecurringExpenseRepository.ts` - Repositório de despesas recorrentes

**Arquivos:**
```
src/infrastructure/repositories/
  └── RecurringExpenseRepository.ts
```

### Critérios de Aceitação
- [ ] Projeções são calculadas corretamente
- [ ] Despesas recorrentes são consideradas
- [ ] Cenários diferentes produzem resultados diferentes
- [ ] Alertas de saldo negativo são gerados
- [ ] Interface permite gerenciar despesas recorrentes
- [ ] Gráfico é claro e informativo

### Testes
- [ ] Teste unitário para cálculo de projeção
- [ ] Teste de diferentes cenários
- [ ] Teste de despesas recorrentes
- [ ] Teste E2E do fluxo completo

---

## Task 1.3: Melhorias no Módulo de Caixa

**Prioridade:** 🟡 MÉDIA  
**Complexidade:** Baixa  
**Tempo estimado:** 3-5 dias  
**Responsável:** [A definir]

### Descrição
Adicionar funcionalidades avançadas ao módulo de caixa existente, incluindo filtros, gráficos, comparativos e exportação.

### Objetivos
- Melhorar usabilidade do módulo de caixa
- Adicionar análises visuais
- Permitir exportação de dados
- Facilitar busca e filtros

### Entregas

#### 1.3.1 Filtros Avançados
- [ ] Melhorar componente `CashFilters.tsx`
  - Filtro por conta bancária
  - Filtro por categoria
  - Filtro por método de pagamento
  - Filtro por tipo (entrada/saída)
  - Busca por descrição

**Arquivos:**
```
src/components/cash/
  └── CashFilters.tsx (melhorar existente)
```

#### 1.3.2 Componente de Analytics
- [ ] `CashAnalytics.tsx` - Análises e estatísticas

**Arquivos:**
```
src/components/cash/
  └── CashAnalytics.tsx (novo)
```

**Interface:**
```typescript
interface CashAnalytics {
  // Distribuição por Método
  byMethod: {
    method: string;
    inflow: number;
    outflow: number;
    net: number;
  }[];
  
  // Distribuição por Categoria
  byCategory: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  
  // Tendências
  trends: {
    date: Date;
    inflow: number;
    outflow: number;
    net: number;
  }[];
}
```

#### 1.3.3 Gráficos de Distribuição
- [ ] `CashDistributionCharts.tsx` - Gráficos de pizza e barras

**Arquivos:**
```
src/components/cash/
  └── CashDistributionCharts.tsx (novo)
```

**Gráficos:**
- Pizza: Distribuição de despesas por categoria
- Pizza: Distribuição por método de pagamento
- Barras: Top 10 maiores movimentações

#### 1.3.4 Comparativo de Períodos
- [ ] `CashComparison.tsx` - Comparação com período anterior

**Arquivos:**
```
src/components/cash/
  └── CashComparison.tsx (novo)
```

**Dados:**
```typescript
interface PeriodComparison {
  current: {
    inflow: number;
    outflow: number;
    net: number;
  };
  previous: {
    inflow: number;
    outflow: number;
    net: number;
  };
  growth: {
    inflow: number; // %
    outflow: number; // %
    net: number; // %
  };
}
```

#### 1.3.5 Exportação de Dados
- [ ] `ExportButton.tsx` - Botão para exportar dados
- [ ] `exportToExcel.ts` - Função para gerar Excel

**Arquivos:**
```
src/components/cash/
  └── ExportButton.tsx (novo)

src/lib/utils/
  └── exportToExcel.ts (novo)
```

**Formatos:**
- Excel (.xlsx)
- PDF (relatório formatado)

#### 1.3.6 Melhorias na Página Principal
- [ ] Atualizar `src/app/(app)/cash/page.tsx`
  - Adicionar novos componentes
  - Melhorar layout
  - Adicionar tabs para diferentes visualizações

### Critérios de Aceitação
- [ ] Filtros funcionam corretamente
- [ ] Gráficos são responsivos
- [ ] Exportação gera arquivos válidos
- [ ] Comparativos são precisos
- [ ] Busca retorna resultados corretos
- [ ] Performance não é afetada

### Testes
- [ ] Teste de filtros
- [ ] Teste de exportação
- [ ] Teste de cálculos de comparativo
- [ ] Teste E2E de navegação

---

## Checklist Geral da Fase 1

### Antes de Começar
- [ ] Revisar documentação completa
- [ ] Configurar ambiente de desenvolvimento
- [ ] Instalar dependências necessárias
- [ ] Criar branch `feature/fase-1-fundacao`

### Durante o Desenvolvimento
- [ ] Seguir padrões de código do projeto
- [ ] Escrever testes para cada funcionalidade
- [ ] Documentar código complexo
- [ ] Fazer commits atômicos e descritivos
- [ ] Revisar código antes de push

### Ao Finalizar
- [ ] Todos os testes passando
- [ ] Código revisado
- [ ] Documentação atualizada
- [ ] Demo preparada
- [ ] PR criado para revisão

---

## Dependências

### NPM Packages
```bash
npm install recharts date-fns xlsx jspdf
```

### Tipos TypeScript
```bash
npm install -D @types/node
```

---

## Notas Técnicas

### Performance
- Usar React.memo para componentes pesados
- Implementar paginação para listas grandes
- Usar índices no banco de dados
- Cache de queries frequentes

### Responsividade
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Gráficos adaptáveis ao tamanho da tela

### Acessibilidade
- Labels em todos os inputs
- Contraste adequado de cores
- Navegação por teclado
- ARIA labels onde necessário

---

**Status:** 📋 Pronto para iniciar  
**Última atualização:** 2025-02-25
