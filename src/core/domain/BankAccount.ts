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

export interface AccountMovement {
    id: string
    type: 'IN' | 'OUT'
    amount: number
    method: 'CASH' | 'PIX' | 'CARD' | 'TRANSFER' | 'WALLET'
    sourceType: 'SALE' | 'REFUND' | 'PURCHASE' | 'MANUAL'
    sourceId?: string | null
    description?: string
    occurredAt: Date
    balanceAfter: number
}

export interface AccountStatement {
    account: BankAccount
    movements: AccountMovement[]
    summary: {
        initialBalance: number
        totalIn: number
        totalOut: number
        currentBalance: number
    }
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
