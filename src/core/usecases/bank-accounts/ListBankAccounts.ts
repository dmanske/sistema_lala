import { BankAccountWithBalance } from '@/core/domain/BankAccount'
import { BankAccountRepository } from '@/core/repositories/BankAccountRepository'

export class ListBankAccounts {
    constructor(private repo: BankAccountRepository) {}

    async execute(isActive?: boolean): Promise<BankAccountWithBalance[]> {
        return this.repo.listWithBalances(isActive)
    }
}
