# Design Técnico - Melhorias do Sistema de Contas Bancárias

## Arquitetura Geral

### Estrutura de Diretórios
```
src/
├── core/
│   ├── domain/
│   │   └── BankAccount.ts (expandir)
│   ├── repositories/
│   │   └── BankAccountRepository.ts (expandir)
│   └── usecases/
│       └── bank-accounts/
│           ├── CreateBankAccount.ts (atualizar)
│           ├── UpdateBankAccount.ts (atualizar)
│           ├── TransferBetweenAccounts.ts (novo)
│           ├── GetAccountDashboard.ts (novo)
│           └── ExportAccountStatement.ts (novo)
├── infrastructure/
│   └── repositories/
│       └── supabase/
│           └── SupabaseBankAccountRepository.ts (expandir)
├── app/(app)/
│   └── contas/
│       ├── page.tsx (melhorar)
│       ├── [id]/
│       │   ├── page.tsx (dashboard completo)
│       │   └── transferir/page.tsx (novo)
│       ├── transferencias/page.tsx (novo)
│       └── relatorios/page.tsx (novo)
└── components/
    └── bank-accounts/
        ├── BankAccountCard.tsx (novo)
        ├── BankAccountDialog.tsx (expandir)
        ├── AccountSelector.tsx (melhorar)
        ├── AccountDashboard/ (novo)
        │   ├── DashboardHeader.tsx
        │   ├── SummaryCards.tsx
        │   ├── BalanceEvolutionChart.tsx
        │   ├── InOutChart.tsx
        │   ├── DistributionChart.tsx
        │   ├── AdvancedFilters.tsx
        │   ├── DetailedStatement.tsx
        │   └── QuickStats.tsx
        ├── TransferDialog.tsx (novo)
        └── AccountGoalCard.tsx (novo)
```

## Fase 1: Melhorias no Cadastro

### 1.1 Schema do Banco de Dados


```sql
-- Migration: add_bank_account_fields
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#3B82F6';
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS icon VARCHAR(50) DEFAULT '🏦';
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS credit_limit DECIMAL(10,2);
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100);
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS agency VARCHAR(20);
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS account_number VARCHAR(50);
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE;
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_bank_accounts_display_order ON bank_accounts(tenant_id, display_order);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_is_favorite ON bank_accounts(tenant_id, is_favorite);
```

### 1.2 Domain Model Expandido

```typescript
// src/core/domain/BankAccount.ts
export interface BankAccount {
  id: string
  tenantId: string
  name: string
  type: BankAccountType
  initialBalance: number
  isActive: boolean
  
  // Novos campos
  color: string // hex color
  icon: string // emoji ou nome do ícone
  description?: string
  creditLimit?: number // para cartões
  bankName?: string
  agency?: string
  accountNumber?: string
  isFavorite: boolean
  displayOrder: number
  
  createdAt: Date
  updatedAt: Date
}

export interface BankAccountWithBalance extends BankAccount {
  currentBalance: number
}

export interface BankAccountWithStats extends BankAccountWithBalance {
  totalIn: number
  totalOut: number
  movementCount: number
  lastMovementAt?: Date
}
```

### 1.3 Repository Interface

```typescript
// src/core/repositories/BankAccountRepository.ts
export interface CreateBankAccountInput {
  name: string
  type: BankAccountType
  initialBalance?: number
  color?: string
  icon?: string
  description?: string
  creditLimit?: number
  bankName?: string
  agency?: string
  accountNumber?: string
  isFavorite?: boolean
  displayOrder?: number
}

export interface UpdateBankAccountInput {
  name?: string
  type?: BankAccountType
  color?: string
  icon?: string
  description?: string
  creditLimit?: number
  bankName?: string
  agency?: string
  accountNumber?: string
  isFavorite?: boolean
  displayOrder?: number
}

export interface BankAccountRepository {
  // Existentes
  create(input: CreateBankAccountInput): Promise<BankAccount>
  update(id: string, input: UpdateBankAccountInput): Promise<BankAccount>
  getById(id: string): Promise<BankAccount | null>
  list(isActive?: boolean): Promise<BankAccount[]>
  listWithBalances(isActive?: boolean): Promise<BankAccountWithBalance[]>
  
  // Novos
  listWithStats(isActive?: boolean): Promise<BankAccountWithStats[]>
  updateOrder(accountIds: string[]): Promise<void>
  setFavorite(id: string, isFavorite: boolean): Promise<void>
}
```

## Fase 2: Dashboard Individual

### 2.1 Estrutura de Dados do Dashboard

```typescript
// src/core/domain/BankAccount.ts
export interface AccountDashboardData {
  account: BankAccountWithBalance
  summary: {
    initialBalance: number
    totalIn: number
    totalOut: number
    currentBalance: number
    movementCount: number
  }
  charts: {
    balanceEvolution: BalancePoint[]
    inOutComparison: InOutData[]
    distribution: DistributionData[]
  }
  stats: {
    biggestIn: { amount: number; date: Date; description: string } | null
    biggestOut: { amount: number; date: Date; description: string } | null
    dailyAverage: number
    mostActiveDay: string
    lastMovement: Date | null
  }
  recentMovements: AccountMovement[]
}

export interface BalancePoint {
  date: Date
  balance: number
}

export interface InOutData {
  period: string // "2024-01" ou "Semana 1"
  in: number
  out: number
  net: number
}

export interface DistributionData {
  source: string // "Vendas", "Compras", etc
  amount: number
  percentage: number
  color: string
}
```

### 2.2 Use Case: GetAccountDashboard

```typescript
// src/core/usecases/bank-accounts/GetAccountDashboard.ts
export interface GetAccountDashboardFilters {
  startDate?: Date
  endDate?: Date
  groupBy?: 'day' | 'week' | 'month'
}

export class GetAccountDashboard {
  constructor(private repository: BankAccountRepository) {}
  
  async execute(
    accountId: string,
    filters?: GetAccountDashboardFilters
  ): Promise<AccountDashboardData> {
    // 1. Buscar conta
    // 2. Buscar movimentações com filtros
    // 3. Calcular resumo
    // 4. Gerar dados dos gráficos
    // 5. Calcular estatísticas
    // 6. Retornar tudo
  }
}
```

### 2.3 Componentes do Dashboard

```typescript
// src/components/bank-accounts/AccountDashboard/DashboardHeader.tsx
interface DashboardHeaderProps {
  account: BankAccountWithBalance
  onEdit: () => void
  onToggleActive: () => void
  onExport: () => void
  onTransfer: () => void
}

// src/components/bank-accounts/AccountDashboard/SummaryCards.tsx
interface SummaryCardsProps {
  summary: AccountDashboardData['summary']
}

// src/components/bank-accounts/AccountDashboard/BalanceEvolutionChart.tsx
interface BalanceEvolutionChartProps {
  data: BalancePoint[]
  period: '7d' | '30d' | '90d' | '1y' | 'custom'
  onPeriodChange: (period: string) => void
}
```

## Fase 3: Seletores Melhorados

### 3.1 AccountSelector Melhorado

```typescript
// src/components/bank-accounts/AccountSelector.tsx
interface AccountSelectorProps {
  value: string
  onChange: (accountId: string) => void
  showBalance?: boolean
  showLimit?: boolean
  suggestByMethod?: PaymentMethod
  allowAll?: boolean
  disabled?: boolean
  excludeIds?: string[]
}

interface AccountOption {
  id: string
  name: string
  type: BankAccountType
  color: string
  icon: string
  balance: number
  creditLimit?: number
  isFavorite: boolean
  isActive: boolean
  suggested?: boolean
}
```

### 3.2 Lógica de Sugestão

```typescript
// src/lib/bank-accounts/suggestions.ts
export function suggestAccountByMethod(
  accounts: BankAccountWithBalance[],
  method: PaymentMethod
): string | null {
  // PIX → contas digitais (Nubank, PicPay, etc)
  // Dinheiro → Caixa Físico
  // Cartão → contas tipo CARD
  // Usar histórico de uso
  // Considerar conta favorita
}

export function getLastUsedAccount(
  method: PaymentMethod
): string | null {
  // Buscar no localStorage
}

export function saveLastUsedAccount(
  method: PaymentMethod,
  accountId: string
): void {
  // Salvar no localStorage
}
```

## Fase 4: Transferências

### 4.1 Schema de Transferências

```typescript
// Adicionar campo em cash_movements
ALTER TABLE cash_movements ADD COLUMN IF NOT EXISTS transfer_id UUID;
ALTER TABLE cash_movements ADD COLUMN IF NOT EXISTS related_movement_id UUID;

CREATE INDEX IF NOT EXISTS idx_cash_movements_transfer 
ON cash_movements(transfer_id) WHERE transfer_id IS NOT NULL;
```

### 4.2 Domain Model

```typescript
// src/core/domain/Transfer.ts
export interface Transfer {
  id: string
  fromAccountId: string
  toAccountId: string
  amount: number
  description?: string
  occurredAt: Date
  createdBy: string
  movements: {
    outMovementId: string
    inMovementId: string
  }
}

export interface CreateTransferInput {
  fromAccountId: string
  toAccountId: string
  amount: number
  description?: string
  occurredAt?: Date
}
```

### 4.3 Use Case: TransferBetweenAccounts

```typescript
// src/core/usecases/bank-accounts/TransferBetweenAccounts.ts
export class TransferBetweenAccounts {
  constructor(
    private bankAccountRepo: BankAccountRepository,
    private cashMovementRepo: CashMovementRepository
  ) {}
  
  async execute(input: CreateTransferInput): Promise<Transfer> {
    // 1. Validar contas existem e são diferentes
    // 2. Validar valor > 0
    // 3. Gerar transfer_id único
    // 4. Criar movimentação OUT na conta origem
    // 5. Criar movimentação IN na conta destino
    // 6. Vincular as duas movimentações
    // 7. Retornar transfer completo
  }
}
```

## Fase 5: Exportação

### 5.1 Use Case: ExportAccountStatement

```typescript
// src/core/usecases/bank-accounts/ExportAccountStatement.ts
export type ExportFormat = 'pdf' | 'xlsx' | 'csv'

export interface ExportStatementInput {
  accountId: string
  format: ExportFormat
  filters?: GetStatementFilters
}

export class ExportAccountStatement {
  async execute(input: ExportStatementInput): Promise<Blob> {
    // 1. Buscar dados do extrato
    // 2. Formatar conforme tipo
    // 3. Gerar arquivo
    // 4. Retornar blob
  }
}
```

### 5.2 Exportadores

```typescript
// src/lib/bank-accounts/exporters/pdf.ts
export async function exportToPDF(
  statement: AccountStatement
): Promise<Blob> {
  // Usar jspdf e jspdf-autotable
}

// src/lib/bank-accounts/exporters/excel.ts
export async function exportToExcel(
  statement: AccountStatement
): Promise<Blob> {
  // Usar xlsx ou similar
}

// src/lib/bank-accounts/exporters/csv.ts
export function exportToCSV(
  statement: AccountStatement
): Blob {
  // Usar papaparse
}
```

## Fase 6: Metas e Alertas

### 6.1 Schema

```sql
-- Adicionar campos de meta em bank_accounts
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS goal_amount DECIMAL(10,2);
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS goal_deadline DATE;
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS alert_threshold DECIMAL(10,2);

-- Tabela de notificações (opcional)
CREATE TABLE IF NOT EXISTS account_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  account_id UUID NOT NULL REFERENCES bank_accounts(id),
  type VARCHAR(50) NOT NULL, -- 'low_balance', 'goal_reached', etc
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6.2 Domain Model

```typescript
// src/core/domain/BankAccount.ts
export interface BankAccountGoal {
  amount: number
  deadline?: Date
  currentAmount: number
  percentage: number
  daysRemaining?: number
  status: 'on_track' | 'behind' | 'achieved'
}

export interface BankAccountAlert {
  id: string
  accountId: string
  type: 'low_balance' | 'goal_reached' | 'no_movement'
  message: string
  isRead: boolean
  createdAt: Date
}
```

## Fase 7: Conciliação

### 7.1 Schema

```sql
-- Adicionar campos de conciliação
ALTER TABLE cash_movements ADD COLUMN IF NOT EXISTS reconciled BOOLEAN DEFAULT FALSE;
ALTER TABLE cash_movements ADD COLUMN IF NOT EXISTS reconciled_at TIMESTAMPTZ;
ALTER TABLE cash_movements ADD COLUMN IF NOT EXISTS reconciled_by UUID REFERENCES profiles(id);

CREATE INDEX IF NOT EXISTS idx_cash_movements_reconciled 
ON cash_movements(bank_account_id, reconciled);
```

### 7.2 Use Cases

```typescript
// src/core/usecases/bank-accounts/ReconcileMovements.ts
export interface ReconcileInput {
  movementIds: string[]
}

export class ReconcileMovements {
  async execute(input: ReconcileInput): Promise<void> {
    // Marcar movimentações como reconciled
  }
}

// src/core/usecases/bank-accounts/ImportBankStatement.ts (futuro)
export interface ImportStatementInput {
  accountId: string
  file: File
  format: 'csv' | 'ofx'
}

export class ImportBankStatement {
  async execute(input: ImportStatementInput): Promise<ImportResult> {
    // Parser de arquivo
    // Comparação com movimentações
    // Sugestão de matches
  }
}
```

## Fase 8: Integrações

### 8.1 Dashboard Principal

```typescript
// src/app/(app)/dashboard/page.tsx
// Adicionar card de visão financeira
<FinancialOverviewCard />

// src/components/dashboard/FinancialOverviewCard.tsx
interface FinancialOverviewCardProps {
  accounts: BankAccountWithBalance[]
  totalBalance: number
  lowBalanceAccounts: BankAccountWithBalance[]
}
```

### 8.2 Melhorias em Vendas

```typescript
// src/app/(app)/appointments/[id]/checkout/page.tsx
// Usar AccountSelector melhorado
<AccountSelector
  value={selectedAccount}
  onChange={setSelectedAccount}
  showBalance
  suggestByMethod={paymentMethod}
/>
```

## Tecnologias e Bibliotecas

### Gráficos
- recharts (já instalado)
- Componentes: LineChart, BarChart, PieChart
- Responsivos e customizáveis

### Exportação
- jspdf + jspdf-autotable (já instalados) - PDF
- xlsx ou exceljs - Excel
- papaparse (já instalado) - CSV

### UI/UX
- shadcn/ui (já configurado)
- lucide-react (ícones)
- tailwindcss (estilização)
- framer-motion (animações - opcional)

### Formulários
- react-hook-form (já instalado)
- zod (validação - opcional)

### Datas
- date-fns (já instalado)
- date-fns/locale/pt-BR

## Performance e Otimizações

### Caching
- React Query para cache de dados
- Invalidação inteligente após mutações
- Prefetch de dados do dashboard

### Lazy Loading
- Componentes de gráficos carregados sob demanda
- Paginação em listas grandes
- Infinite scroll no extrato

### Otimizações de Query
- Índices no banco de dados
- Agregações no banco (não no frontend)
- Limit e offset para paginação

## Segurança

### RLS Policies
- Todas as novas tabelas com RLS
- Usar get_my_tenant_id() consistentemente
- Validar tenant_id em todas as operações

### Validações
- Backend: validar todos os inputs
- Frontend: validação em tempo real
- Não confiar em dados do cliente

### Auditoria
- Logs de operações críticas (transferências)
- Rastreabilidade de mudanças
- Histórico de conciliações

## Testes

### Unitários
- Use cases isolados
- Validações de domínio
- Cálculos de estatísticas

### Integração
- Fluxos completos (criar conta → transferir → exportar)
- Interação com banco de dados
- RLS policies

### E2E (opcional)
- Fluxos críticos do usuário
- Playwright ou Cypress

## Acessibilidade

### WCAG AA
- Contraste de cores adequado
- Labels em todos os inputs
- ARIA labels em componentes complexos
- Navegação por teclado
- Focus visible

### Responsividade
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly (botões > 44px)

## Monitoramento

### Métricas
- Tempo de carregamento do dashboard
- Taxa de uso de transferências
- Contas mais acessadas
- Exportações realizadas

### Erros
- Sentry ou similar para tracking
- Logs estruturados
- Alertas para erros críticos

---

## Próximos Passos

1. Revisar e aprovar design
2. Criar tasks detalhadas por fase
3. Implementar fase por fase
4. Testar cada fase antes de avançar
5. Coletar feedback do usuário
6. Iterar e melhorar
