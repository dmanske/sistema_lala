import { CashRegister } from '@/core/domain/entities/CashRegister'
import { CashRegisterRepository, CreateCashRegisterInput } from '@/core/repositories/CashRegisterRepository'

export class AbrirCaixa {
    constructor(private repository: CashRegisterRepository) {}

    async execute(input: CreateCashRegisterInput): Promise<CashRegister> {
        this.validateInitialBalance(input.initialBalance)
        this.validateOpenedBy(input.openedBy)
        
        await this.ensureNoCashRegisterIsOpen()
        
        return this.repository.create(input)
    }

    private validateInitialBalance(initialBalance: number): void {
        if (initialBalance < 0) {
            throw new Error('Initial balance cannot be negative')
        }
    }

    private validateOpenedBy(openedBy: string): void {
        const trimmedOpenedBy = openedBy.trim()
        if (!trimmedOpenedBy) {
            throw new Error('Opened by user ID cannot be empty')
        }
    }

    private async ensureNoCashRegisterIsOpen(): Promise<void> {
        const currentOpen = await this.repository.getCurrentOpen()
        if (currentOpen) {
            throw new Error('Cannot open a new cash register while another one is already open')
        }
    }
}
