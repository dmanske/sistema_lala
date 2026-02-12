import { BankAccountRepository } from '@/core/repositories/BankAccountRepository'

export class DeactivateBankAccount {
    constructor(private repo: BankAccountRepository) {}

    async execute(id: string): Promise<void> {
        // Check if account exists
        const account = await this.repo.getById(id)
        if (!account) {
            throw new Error('Bank account not found')
        }

        await this.repo.deactivate(id)
    }
}
