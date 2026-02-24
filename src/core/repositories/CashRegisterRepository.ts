import { CashRegister, CashRegisterWithUser, CashRegisterSummary, CashRegisterSummaryWithUser } from '../domain/entities/CashRegister'
import { CashRegisterMovement, CashRegisterMovementWithUser } from '../domain/entities/CashRegisterMovement'

export interface CreateCashRegisterInput {
    openedBy: string
    initialBalance: number
    notes?: string
}

export interface CloseCashRegisterInput {
    cashRegisterId: string
    closedBy: string
    actualBalance: number
    notes?: string
}

export interface CreateMovementInput {
    cashRegisterId: string
    type: 'SANGRIA' | 'SUPRIMENTO'
    amount: number
    reason: string
    createdBy?: string
}

export interface GetHistoryFilters {
    startDate?: Date
    endDate?: Date
    openedBy?: string
    status?: 'OPEN' | 'CLOSED'
}

export interface CashRegisterRepository {
    getCurrentOpen(): Promise<CashRegister | null>
    getById(id: string): Promise<CashRegister | null>
    getByIdWithUser(id: string): Promise<CashRegisterWithUser | null>
    getHistory(filters?: GetHistoryFilters): Promise<CashRegisterWithUser[]>
    getSummary(id: string): Promise<CashRegisterSummaryWithUser | null>
    create(input: CreateCashRegisterInput): Promise<CashRegister>
    getMovements(cashRegisterId: string): Promise<CashRegisterMovementWithUser[]>
    createMovement(input: CreateMovementInput): Promise<CashRegisterMovement>
}
