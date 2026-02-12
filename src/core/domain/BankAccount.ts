export type BankAccountType = 'BANK' | 'CARD' | 'WALLET'

export interface BankAccount {
    id: string
    tenantId: string
    name: string
    type: BankAccountType
    initialBalance: number
    isActive: boolean
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
