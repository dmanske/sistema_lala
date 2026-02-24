export type MovementType = 'SANGRIA' | 'SUPRIMENTO'

export interface CashRegisterMovement {
    id: string
    tenantId: string
    cashRegisterId: string
    type: MovementType
    amount: number
    reason: string
    createdBy: string
    createdAt: Date
}

export interface CashRegisterMovementWithUser extends CashRegisterMovement {
    createdByName?: string
}

export interface CashRegisterMovementSummary {
    totalSangria: number
    totalSuprimento: number
    movementsCount: number
    netChange: number // suprimento - sangria
}
