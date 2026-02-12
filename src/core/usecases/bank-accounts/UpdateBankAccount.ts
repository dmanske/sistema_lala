import { BankAccount, BankAccountType } from '@/core/domain/BankAccount'
import { BankAccountRepository } from '@/core/repositories/BankAccountRepository'

export interface UpdateBankAccountInput {
    name?: string
    type?: BankAccountType
}

export class UpdateBankAccount {
    constructor(private repo: BankAccountRepository) {}

    async execute(id: string, input: UpdateBankAccountInput): Promise<BankAccount> {
        // Validate name if provided
        if (input.name !== undefined) {
            const trimmedName = input.name.trim()
            if (!trimmedName) {
                throw new Error('Account name cannot be empty')
            }
            if (trimmedName.length > 100) {
                throw new Error('Account name cannot exceed 100 characters')
            }
            input.name = trimmedName
        }

        // Validate type if provided
        if (input.type !== undefined) {
            const validTypes: BankAccountType[] = ['BANK', 'CARD', 'WALLET']
            if (!validTypes.includes(input.type)) {
                throw new Error('Invalid account type. Must be BANK, CARD, or WALLET')
            }
        }

        return this.repo.update(id, input)
    }
}
