import { BankAccount, BankAccountWithBalance, BankAccountWithStats, AccountStatement, BankAccountType, AccountDashboardData } from '../domain/BankAccount'

export interface CreateBankAccountInput {
    name: string
    type: BankAccountType
    initialBalance?: number
    color?: string
    icon?: string
    description?: string
    creditLimit?: number
    bankName?: string
    agency?: string
    accountNumber?: string
    isFavorite?: boolean
    displayOrder?: number
}

export interface UpdateBankAccountInput {
    name?: string
    type?: BankAccountType
    color?: string
    icon?: string
    description?: string
    creditLimit?: number
    bankName?: string
    agency?: string
    accountNumber?: string
    isFavorite?: boolean
    displayOrder?: number
}

export interface GetStatementFilters {
    startDate?: Date
    endDate?: Date
}

export interface GetDashboardFilters {
    startDate?: Date
    endDate?: Date
    groupBy?: 'day' | 'week' | 'month'
}

export interface BankAccountRepository {
    create(input: CreateBankAccountInput): Promise<BankAccount>
    update(id: string, input: UpdateBankAccountInput): Promise<BankAccount>
    deactivate(id: string): Promise<void>
    activate(id: string): Promise<void>
    getById(id: string): Promise<BankAccount | null>
    list(isActive?: boolean): Promise<BankAccount[]>
    listWithBalances(isActive?: boolean): Promise<BankAccountWithBalance[]>
    listWithStats(isActive?: boolean): Promise<BankAccountWithStats[]>
    getStatement(accountId: string, filters?: GetStatementFilters): Promise<AccountStatement>
    getDashboard(accountId: string, filters?: GetDashboardFilters): Promise<AccountDashboardData>
    hasMovements(accountId: string): Promise<boolean>
    setFavorite(id: string, isFavorite: boolean): Promise<void>
    updateOrder(accountIds: string[]): Promise<void>
}
