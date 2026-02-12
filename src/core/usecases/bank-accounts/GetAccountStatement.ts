import { AccountStatement } from '@/core/domain/BankAccount'
import { BankAccountRepository, GetStatementFilters } from '@/core/repositories/BankAccountRepository'

export class GetAccountStatement {
    constructor(private repo: BankAccountRepository) {}

    async execute(accountId: string, filters?: GetStatementFilters): Promise<AccountStatement> {
        return this.repo.getStatement(accountId, filters)
    }
}
