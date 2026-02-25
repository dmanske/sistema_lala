export type BankAccountType = 'BANK' | 'CARD' | 'WALLET'

export interface BankAccount {
    id: string
    tenantId: string
    name: string
    type: BankAccountType
    initialBalance: number
    isActive: boolean

    // Campos de personalização
    color: string // hex color
    icon: string // emoji ou nome do ícone
    description?: string

    // Campos bancários
    creditLimit?: number // para cartões
    bankName?: string
    agency?: string
    accountNumber?: string

    // Organização
    isFavorite: boolean
    displayOrder: number

    createdAt: Date
    updatedAt: Date
}

export interface BankAccountWithBalance extends BankAccount {
    currentBalance: number
}

export type PaymentMethod = 'CASH' | 'PIX' | 'CARD' | 'TRANSFER' | 'WALLET'
export type SourceType = 'SALE' | 'REFUND' | 'PURCHASE' | 'MANUAL' | 'CREDIT' | 'TRANSFER'

export interface AccountMovement {
    id: string
    type: 'IN' | 'OUT'
    amount: number
    method: PaymentMethod
    sourceType: SourceType
    sourceId?: string | null
    description?: string
    occurredAt: Date
    balanceAfter: number
}

export interface MovementWithBalance extends AccountMovement {
    // Enriched data
    customerName?: string
    supplierName?: string
    icon: string
    // Transfer data
    fromAccountName?: string
    toAccountName?: string
}

export interface AccountStatement {
    account: BankAccount
    movements: MovementWithBalance[]
    summary: {
        initialBalance: number
        totalIn: number
        totalOut: number
        currentBalance: number
    }
}

export interface ExtendedStats {
    highestEntry: number
    highestExit: number
    averageTicket: number
    transactionCount: number
}

export interface PaginationInfo {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
}

export interface StatementFilters {
    // Period
    startDate?: Date
    endDate?: Date
    quickPeriod?: 'today' | 'yesterday' | '7days' | '30days' | 'thisMonth' | 'lastMonth' | 'custom'

    // Type
    type?: 'all' | 'in' | 'out'

    // Method
    method?: PaymentMethod | 'all'

    // Source
    source?: SourceType | 'all'

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

export interface EnhancedAccountStatement extends AccountStatement {
    extendedStats: ExtendedStats
    balanceEvolution: BalancePoint[]
    pagination: PaginationInfo
}

export interface BankAccountWithStats extends BankAccountWithBalance {
    totalIn: number
    totalOut: number
    movementCount: number
    lastMovementAt?: Date
}

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
    date: string // ISO date string
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
