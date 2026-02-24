export type CashRegisterStatus = 'OPEN' | 'CLOSED'

export interface CashRegister {
    id: string
    tenantId: string
    openedBy: string
    openedAt: Date
    initialBalance: number
    status: CashRegisterStatus
    closedBy?: string | null
    closedAt?: Date | null
    expectedBalance?: number | null
    actualBalance?: number | null
    difference?: number | null
    notes?: string | null
    createdAt: Date
    updatedAt: Date
}

export interface CashRegisterWithUser extends CashRegister {
    openedByName?: string
    closedByName?: string
}

export interface CashRegisterSummary {
    cashRegister: CashRegister
    movementsCount: number
    totalSangria: number
    totalSuprimento: number
    salesCount: number
    totalSales: number
}
