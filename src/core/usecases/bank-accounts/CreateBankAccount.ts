import { BankAccount, BankAccountType } from '@/core/domain/BankAccount'
import { BankAccountRepository, CreateBankAccountInput } from '@/core/repositories/BankAccountRepository'

export class CreateBankAccount {
    constructor(private repo: BankAccountRepository) {}

    async execute(input: CreateBankAccountInput): Promise<BankAccount> {
        // Validate name
        const trimmedName = input.name.trim()
        if (!trimmedName) {
            throw new Error('Account name cannot be empty')
        }
        if (trimmedName.length > 100) {
            throw new Error('Account name cannot exceed 100 characters')
        }

        // Validate type
        const validTypes: BankAccountType[] = ['BANK', 'CARD', 'WALLET']
        if (!validTypes.includes(input.type)) {
            throw new Error('Invalid account type. Must be BANK, CARD, or WALLET')
        }

        // Validate credit limit if provided
        if (input.creditLimit !== undefined && input.creditLimit < 0) {
            throw new Error('Credit limit cannot be negative')
        }

        // Default initial balance to 0
        const initialBalance = input.initialBalance ?? 0

        return this.repo.create({
            ...input,
            name: trimmedName,
            initialBalance
        })
    }
}
