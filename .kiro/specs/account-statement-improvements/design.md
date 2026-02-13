# Account Statement Improvements - Technical Design

**Version:** 1.0  
**Date:** 2026-02-12  
**Status:** Approved

## Architecture Overview

### Component Structure
```
AccountStatementView (Enhanced)
├── StatementHeader
│   ├── AccountInfo
│   └── ActionButtons (Edit, Export, Refresh)
├── StatementSummary
│   ├── BalanceCards (4 main metrics)
│   └── ExtendedStatsCards (4 additional metrics)
├── BalanceEvolutionChart
│   └── LineChart (recharts)
├── StatementFilters
│   ├── QuickPeriodFilters
│   ├── TypeFilter
│   ├── MethodFilter
│   ├── SourceFilter
│   └── SearchInput
├── MovementsList
│   ├── DateGroup (for each day)
│   │   ├── DateHeader (date, day, total)
│   │   └── MovementRow[]
│   │       ├── Icon
│   │       ├── Time
│   │       ├── Description
│   │       ├── Method Badge
│   │       ├── Amount
│   │       └── ActionButton (View Details)
│   └── Pagination
└── MovementDetailsDialog
    ├── TransactionInfo
    ├── ItemsList
    └── LinkToOriginal
```

## Data Models

### Enhanced AccountStatement
```typescript
interface AccountStatement {
  account: BankAccount
  summary: StatementSummary
  extendedStats: ExtendedStats
  movements: MovementWithBalance[]
  balanceEvolution: BalancePoint[]
  pagination: PaginationInfo
}

interface StatementSummary {
  initialBalance: number
  totalIn: number
  totalOut: number
  currentBalance: number
}

interface ExtendedStats {
  highestEntry: number
  highestExit: number
  averageTicket: number
  transactionCount: number
}

interface MovementWithBalance {
  id: string
  occurredAt: Date
  description: string
  type: 'IN' | 'OUT'
  amount: number
  method: PaymentMethod
  sourceType: 'SALE' | 'PURCHASE' | 'REFUND' | 'MANUAL' | 'CREDIT'
  sourceId: string
  balanceAfter: number
  // Enriched data
  customerName?: string
  supplierName?: string
  icon: string
}

interface BalancePoint {
  date: Date
  balance: number
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}
```

### Filter State
```typescript
interface StatementFilters {
  // Period
  startDate?: Date
  endDate?: Date
  quickPeriod?: 'today' | 'yesterday' | '7days' | '30days' | 'thisMonth' | 'lastMonth'
  
  // Type
  type?: 'all' | 'in' | 'out'
  
  // Method
  method?: PaymentMethod | 'all'
  
  // Source
  source?: 'SALE' | 'PURCHASE' | 'REFUND' | 'MANUAL' | 'CREDIT' | 'all'
  
  // Search
  searchText?: string
  
  // Sorting
  sortBy: 'date' | 'amount' | 'description'
  sortOrder: 'asc' | 'desc'
  
  // Pagination
  page: number
  itemsPerPage: number
  
  // View
  viewMode: 'compact' | 'detailed'
}
```

## Repository Methods

### BankAccountRepository Extensions
```typescript
interface BankAccountRepository {
  // Existing methods...
  
  // New methods for enhanced statement
  getStatement(
    accountId: string,
    filters: StatementFilters
  ): Promise<AccountStatement>
  
  getBalanceEvolution(
    accountId: string,
    startDate: Date,
    endDate: Date
  ): Promise<BalancePoint[]>
  
  getExtendedStats(
    accountId: string,
    filters: StatementFilters
  ): Promise<ExtendedStats>
  
  getMovementDetails(
    movementId: string
  ): Promise<MovementDetails>
}
```

## Component Specifications

### 1. QuickPeriodFilters
```typescript
interface QuickPeriodFiltersProps {
  activePeriod?: string
  onPeriodChange: (period: string) => void
}

// Periods
const QUICK_PERIODS = [
  { id: 'today', label: 'Hoje' },
  { id: 'yesterday', label: 'Ontem' },
  { id: '7days', label: '7 Dias' },
  { id: '30days', label: '30 Dias' },
  { id: 'thisMonth', label: 'Este Mês' },
  { id: 'lastMonth', label: 'Mês Passado' },
  { id: 'custom', label: 'Personalizado' }
]
```

### 2. DateGroup
```typescript
interface DateGroupProps {
  date: Date
  movements: MovementWithBalance[]
  onMovementClick: (movement: MovementWithBalance) => void
}

// Calculates daily total
const dailyTotal = movements.reduce((sum, m) => 
  sum + (m.type === 'IN' ? m.amount : -m.amount), 0
)
```

### 3. BalanceEvolutionChart
```typescript
interface BalanceEvolutionChartProps {
  data: BalancePoint[]
  height?: number
}

// Uses recharts LineChart
// X-axis: formatted dates
// Y-axis: currency values
// Tooltip: date + balance
// Responsive container
```

### 4. MovementDetailsDialog
```typescript
interface MovementDetailsDialogProps {
  movement: MovementWithBalance | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Fetches full details on open
// Shows: customer/supplier, items, payment methods, notes
// Link to original transaction
```

### 5. ExportButtons
```typescript
interface ExportButtonsProps {
  accountName: string
  statement: AccountStatement
  filters: StatementFilters
}

// PDF: uses jspdf + jspdf-autotable
// Excel: uses papaparse
// Filename: "Extrato_{AccountName}_{StartDate}_{EndDate}.{ext}"
```

## State Management

### Component State
```typescript
const [filters, setFilters] = useState<StatementFilters>({
  type: 'all',
  method: 'all',
  source: 'all',
  sortBy: 'date',
  sortOrder: 'desc',
  page: 1,
  itemsPerPage: 50,
  viewMode: 'detailed'
})

const [statement, setStatement] = useState<AccountStatement | null>(null)
const [loading, setLoading] = useState(true)
const [selectedMovement, setSelectedMovement] = useState<MovementWithBalance | null>(null)
```

### Filter Logic
```typescript
// Apply filters client-side for instant feedback
const filteredMovements = useMemo(() => {
  let result = statement?.movements || []
  
  // Type filter
  if (filters.type !== 'all') {
    result = result.filter(m => 
      filters.type === 'in' ? m.type === 'IN' : m.type === 'OUT'
    )
  }
  
  // Method filter
  if (filters.method !== 'all') {
    result = result.filter(m => m.method === filters.method)
  }
  
  // Source filter
  if (filters.source !== 'all') {
    result = result.filter(m => m.sourceType === filters.source)
  }
  
  // Search filter
  if (filters.searchText) {
    const search = filters.searchText.toLowerCase()
    result = result.filter(m =>
      m.description.toLowerCase().includes(search) ||
      m.customerName?.toLowerCase().includes(search) ||
      m.supplierName?.toLowerCase().includes(search)
    )
  }
  
  // Sort
  result = [...result].sort((a, b) => {
    const order = filters.sortOrder === 'asc' ? 1 : -1
    switch (filters.sortBy) {
      case 'date':
        return (a.occurredAt.getTime() - b.occurredAt.getTime()) * order
      case 'amount':
        return (a.amount - b.amount) * order
      case 'description':
        return a.description.localeCompare(b.description) * order
      default:
        return 0
    }
  })
  
  return result
}, [statement, filters])

// Group by date
const groupedMovements = useMemo(() => {
  const groups = new Map<string, MovementWithBalance[]>()
  
  filteredMovements.forEach(movement => {
    const dateKey = format(movement.occurredAt, 'yyyy-MM-dd')
    if (!groups.has(dateKey)) {
      groups.set(dateKey, [])
    }
    groups.get(dateKey)!.push(movement)
  })
  
  return Array.from(groups.entries()).map(([date, movements]) => ({
    date: new Date(date),
    movements
  }))
}, [filteredMovements])
```

## Database Queries

### Get Statement with Filters
```sql
-- Main query with all filters
SELECT 
  cm.*,
  c.name as customer_name,
  s.name as supplier_name,
  -- Calculate running balance
  SUM(CASE WHEN cm.type = 'IN' THEN cm.amount ELSE -cm.amount END) 
    OVER (ORDER BY cm.occurred_at, cm.id) + ba.initial_balance as balance_after
FROM cash_movements cm
LEFT JOIN sales sa ON sa.id = cm.source_id AND cm.source_type = 'SALE'
LEFT JOIN clients c ON c.id = sa.customer_id
LEFT JOIN purchases p ON p.id = cm.source_id AND cm.source_type = 'PURCHASE'
LEFT JOIN suppliers s ON s.id = p.supplier_id
CROSS JOIN bank_accounts ba
WHERE cm.bank_account_id = $1
  AND ba.id = $1
  AND ($2::timestamp IS NULL OR cm.occurred_at >= $2)
  AND ($3::timestamp IS NULL OR cm.occurred_at <= $3)
  AND ($4::text IS NULL OR cm.type = $4)
  AND ($5::text IS NULL OR cm.method = $5)
  AND ($6::text IS NULL OR cm.source_type = $6)
ORDER BY cm.occurred_at DESC, cm.id DESC
LIMIT $7 OFFSET $8
```

### Get Balance Evolution
```sql
-- Daily balance points
WITH daily_movements AS (
  SELECT 
    DATE(occurred_at) as movement_date,
    SUM(CASE WHEN type = 'IN' THEN amount ELSE -amount END) as daily_change
  FROM cash_movements
  WHERE bank_account_id = $1
    AND occurred_at >= $2
    AND occurred_at <= $3
  GROUP BY DATE(occurred_at)
),
running_balance AS (
  SELECT 
    movement_date,
    SUM(daily_change) OVER (ORDER BY movement_date) + 
      (SELECT initial_balance FROM bank_accounts WHERE id = $1) as balance
  FROM daily_movements
)
SELECT * FROM running_balance
ORDER BY movement_date
```

### Get Extended Stats
```sql
-- Statistics for filtered period
SELECT 
  MAX(CASE WHEN type = 'IN' THEN amount END) as highest_entry,
  MAX(CASE WHEN type = 'OUT' THEN amount END) as highest_exit,
  AVG(amount) as average_ticket,
  COUNT(*) as transaction_count
FROM cash_movements
WHERE bank_account_id = $1
  AND ($2::timestamp IS NULL OR occurred_at >= $2)
  AND ($3::timestamp IS NULL OR occurred_at <= $3)
  AND ($4::text IS NULL OR type = $4)
  AND ($5::text IS NULL OR method = $5)
  AND ($6::text IS NULL OR source_type = $6)
```

## Export Formats

### PDF Structure
```
┌─────────────────────────────────────────┐
│ EXTRATO BANCÁRIO                        │
│ Conta: Nubank                           │
│ Período: 01/02/2026 a 12/02/2026       │
├─────────────────────────────────────────┤
│ RESUMO                                  │
│ Saldo Inicial:    R$ 1.000,00          │
│ Total Entradas:   R$ 3.450,00          │
│ Total Saídas:     R$ 2.100,00          │
│ Saldo Final:      R$ 2.350,00          │
├─────────────────────────────────────────┤
│ MOVIMENTAÇÕES                           │
│ Data/Hora | Descrição | Tipo | Valor   │
│ ...                                     │
└─────────────────────────────────────────┘
```

### Excel Structure
```
| Data/Hora | Descrição | Tipo | Método | Origem | Valor | Saldo Após |
|-----------|-----------|------|--------|--------|-------|------------|
| ...       | ...       | ...  | ...    | ...    | ...   | ...        |
```

## Performance Optimizations

1. **Pagination:** Load only 50 movements at a time
2. **Memoization:** Use useMemo for filtered/grouped data
3. **Debouncing:** Search input debounced 300ms
4. **Virtual Scrolling:** Consider for very long lists
5. **Lazy Loading:** Chart library loaded on demand
6. **Caching:** Cache statement data for 30 seconds

## Responsive Breakpoints

- **Mobile (< 640px):** 
  - Stack filters vertically
  - Hide some columns
  - Compact view by default
  
- **Tablet (640px - 1024px):**
  - 2-column filter layout
  - Show main columns
  
- **Desktop (> 1024px):**
  - Full layout
  - All columns visible
  - Side-by-side filters

## Accessibility

- **Keyboard Navigation:**
  - Tab through filters
  - Enter to apply
  - Arrow keys in date groups
  
- **Screen Readers:**
  - ARIA labels on all buttons
  - Role="table" on movement list
  - Announce filter changes
  
- **Color Contrast:**
  - WCAG AA compliant
  - Not relying solely on color

## Error Handling

- **Network Errors:** Retry button + error message
- **Empty Results:** Friendly empty state
- **Invalid Filters:** Clear invalid filters
- **Export Errors:** Toast notification with details

## Testing Strategy

- **Unit Tests:** Filter logic, calculations
- **Integration Tests:** Repository methods
- **E2E Tests:** Full user flows
- **Performance Tests:** Large datasets
- **Accessibility Tests:** Automated + manual

## Migration Path

1. Create new enhanced component
2. Feature flag to toggle between old/new
3. Test with subset of users
4. Gradual rollout
5. Remove old component after 2 weeks

## Future Enhancements

- Transaction categories/tags
- Budget tracking
- Recurring transaction detection
- Forecasting
- Multi-account comparison
- Custom report builder
