import { CashRegisterMovement } from '@/core/domain/entities/CashRegisterMovement'
import { CashRegisterRepository, CreateMovementInput } from '@/core/repositories/CashRegisterRepository'

export interface RegistrarSuprimentoInput {
    cashRegisterId: string
    amount: number
    reason: string
    createdBy: string
}

export class RegistrarSuprimento {
    constructor(private repository: CashRegisterRepository) {}

    async execute(input: RegistrarSuprimentoInput): Promise<CashRegisterMovement> {
        this.validateAmount(input.amount)
        this.validateReason(input.reason)
        this.validateCashRegisterId(input.cashRegisterId)
        this.validateCreatedBy(input.createdBy)

        await this.ensureCashRegisterIsOpen(input.cashRegisterId)

        const movementInput: CreateMovementInput = {
            cashRegisterId: input.cashRegisterId,
            type: 'SUPRIMENTO',
            amount: input.amount,
            reason: input.reason,
            createdBy: input.createdBy
        }

        return this.repository.createMovement(movementInput)
    }

    private validateAmount(amount: number): void {
        if (amount <= 0) {
            throw new Error('Amount must be greater than zero')
        }
    }

    private validateReason(reason: string): void {
        const trimmedReason = reason.trim()
        if (!trimmedReason) {
            throw new Error('Reason cannot be empty')
        }
    }

    private validateCashRegisterId(cashRegisterId: string): void {
        const trimmedId = cashRegisterId.trim()
        if (!trimmedId) {
            throw new Error('Cash register ID cannot be empty')
        }
    }

    private validateCreatedBy(createdBy: string): void {
        const trimmedCreatedBy = createdBy.trim()
        if (!trimmedCreatedBy) {
            throw new Error('Created by user ID cannot be empty')
        }
    }

    private async ensureCashRegisterIsOpen(cashRegisterId: string): Promise<void> {
        const cashRegister = await this.repository.getById(cashRegisterId)
        
        if (!cashRegister) {
            throw new Error('Cash register not found')
        }

        if (cashRegister.status !== 'OPEN') {
            throw new Error('Cannot register suprimento on a closed cash register')
        }
    }
}
