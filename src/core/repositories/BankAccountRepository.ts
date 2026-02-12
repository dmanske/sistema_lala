import { BankAccount, BankAccountWithBalance, AccountStatement, BankAccountType } from '../domain/BankAccount'

export interface CreateBankAccountInput {
    name: string
    type: BankAccountType
    initialBalance?: number
}

export interface UpdateBankAccountInput {
    name?: string
    type?: BankAccountType
}

export interface GetStatementFilters {
    startDate?: Date
    endDate?: Date
}

export interface BankAccountRepository {
    create(input: CreateBankAccountInput): Promise<BankAccount>
    update(id: string, input: UpdateBankAccountInput): Promise<BankAccount>
    deactivate(id: string): Promise<void>
    activate(id: string): Promise<void>
    getById(id: string): Promise<BankAccount | null>
    list(isActive?: boolean): Promise<BankAccount[]>
    listWithBalances(isActive?: boolean): Promise<BankAccountWithBalance[]>
    getStatement(accountId: string, filters?: GetStatementFilters): Promise<AccountStatement>
    hasMovements(accountId: string): Promise<boolean>
}
