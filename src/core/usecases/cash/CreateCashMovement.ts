import { CashMovementRepository } from '@/core/repositories/CashMovementRepository'
import { CashMovement } from '@/core/domain/CashMovement'

export interface CreateCashMovementInput {
    type: 'IN' | 'OUT'
    amount: number
    method: 'CASH' | 'PIX' | 'CARD' | 'TRANSFER' | 'WALLET'
    description?: string
    occurredAt?: Date
    createdBy?: string
}

export class CreateCashMovement {
    constructor(private repo: CashMovementRepository) { }

    async execute(input: CreateCashMovementInput): Promise<CashMovement> {
        if (input.amount <= 0) throw new Error('Valor deve ser positivo')

        return this.repo.create({
            type: input.type,
            amount: input.amount,
            method: input.method,
            sourceType: 'MANUAL',
            description: input.description,
            occurredAt: input.occurredAt || new Date(),
            createdBy: input.createdBy
        })
    }
}
