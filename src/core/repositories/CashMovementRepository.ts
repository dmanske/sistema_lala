import { CashMovement } from '../domain/CashMovement'

export interface CashMovementRepository {
    create(movement: Omit<CashMovement, 'id' | 'createdAt' | 'tenantId'>): Promise<CashMovement>
    list(filters?: {
        startDate?: Date
        endDate?: Date
        type?: 'IN' | 'OUT'
        method?: string
    }): Promise<CashMovement[]>
    getSummary(filters?: {
        startDate?: Date
        endDate?: Date
    }): Promise<{ totalIn: number; totalOut: number; balance: number }>
}
