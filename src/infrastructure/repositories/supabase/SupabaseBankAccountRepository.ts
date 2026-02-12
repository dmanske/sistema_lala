import { createClient } from '@/lib/supabase/client'
import { BankAccount, BankAccountWithBalance, AccountStatement, AccountMovement } from '@/core/domain/BankAccount'
import { 
    BankAccountRepository, 
    CreateBankAccountInput, 
    UpdateBankAccountInput,
    GetStatementFilters 
} from '@/core/repositories/BankAccountRepository'
import { SupabaseClient } from '@supabase/supabase-js'

export class SupabaseBankAccountRepository implements BankAccountRepository {
    private supabase: SupabaseClient

    constructor(client?: SupabaseClient) {
        this.supabase = client || createClient()
    }

    private async getTenantId(): Promise<string> {
        const { data: { user } } = await this.supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const { data: profile, error } = await this.supabase
            .from('profiles')
            .select('tenant_id')
            .eq('id', user.id)
            .single()

        if (error || !profile) {
            throw new Error('Failed to fetch user profile for tenant context')
        }

        return profile.tenant_id
    }

    async create(input: CreateBankAccountInput): Promise<BankAccount> {
        const tenantId = await this.getTenantId()

        const { data, error } = await this.supabase
            .from('bank_accounts')
            .insert({
                tenant_id: tenantId,
                name: input.name,
                type: input.type,
                initial_balance: input.initialBalance ?? 0,
                is_active: true
            })
            .select()
            .single()

        if (error) throw new Error(`Failed to create bank account: ${error.message}`)
        return this.mapFromDb(data)
    }

    async update(id: string, input: UpdateBankAccountInput): Promise<BankAccount> {
        const updateData: Record<string, unknown> = {}
        if (input.name !== undefined) updateData.name = input.name
        if (input.type !== undefined) updateData.type = input.type

        const { data, error } = await this.supabase
            .from('bank_accounts')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) throw new Error(`Failed to update bank account: ${error.message}`)
        return this.mapFromDb(data)
    }

    async deactivate(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('bank_accounts')
            .update({ is_active: false })
            .eq('id', id)

        if (error) throw new Error(`Failed to deactivate bank account: ${error.message}`)
    }

    async activate(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('bank_accounts')
            .update({ is_active: true })
            .eq('id', id)

        if (error) throw new Error(`Failed to activate bank account: ${error.message}`)
    }

    async getById(id: string): Promise<BankAccount | null> {
        const { data, error } = await this.supabase
            .from('bank_accounts')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') return null
            throw new Error(`Failed to get bank account: ${error.message}`)
        }

        return this.mapFromDb(data)
    }

    async list(isActive?: boolean): Promise<BankAccount[]> {
        let query = this.supabase
            .from('bank_accounts')
            .select('*')
            .order('name', { ascending: true })

        if (isActive !== undefined) {
            query = query.eq('is_active', isActive)
        }

        const { data, error } = await query
        if (error) throw new Error(`Failed to list bank accounts: ${error.message}`)
        return (data || []).map(this.mapFromDb)
    }

    async listWithBalances(isActive?: boolean): Promise<BankAccountWithBalance[]> {
        const accounts = await this.list(isActive)
        
        const accountsWithBalances = await Promise.all(
            accounts.map(async (account) => {
                const balance = await this.calculateBalance(account.id)
                return {
                    ...account,
                    currentBalance: balance
                }
            })
        )

        return accountsWithBalances
    }

    async getStatement(accountId: string, filters?: GetStatementFilters): Promise<AccountStatement> {
        const account = await this.getById(accountId)
        if (!account) throw new Error('Bank account not found')

        let query = this.supabase
            .from('cash_movements')
            .select('*')
            .eq('bank_account_id', accountId)
            .order('occurred_at', { ascending: true })

        if (filters?.startDate) {
            query = query.gte('occurred_at', filters.startDate.toISOString())
        }
        if (filters?.endDate) {
            query = query.lte('occurred_at', filters.endDate.toISOString())
        }

        const { data, error } = await query
        if (error) throw new Error(`Failed to get account statement: ${error.message}`)

        // Calculate running balance
        let runningBalance = account.initialBalance
        const movements: AccountMovement[] = (data || []).map((row) => {
            const amount = Number(row.amount)
            if (row.type === 'IN') {
                runningBalance += amount
            } else {
                runningBalance -= amount
            }

            return {
                id: row.id,
                type: row.type,
                amount,
                method: row.method,
                sourceType: row.source_type,
                sourceId: row.source_id,
                description: row.description,
                occurredAt: new Date(row.occurred_at),
                balanceAfter: runningBalance
            }
        })

        // Calculate summary
        const totalIn = movements
            .filter(m => m.type === 'IN')
            .reduce((sum, m) => sum + m.amount, 0)
        
        const totalOut = movements
            .filter(m => m.type === 'OUT')
            .reduce((sum, m) => sum + m.amount, 0)

        return {
            account,
            movements,
            summary: {
                initialBalance: account.initialBalance,
                totalIn,
                totalOut,
                currentBalance: account.initialBalance + totalIn - totalOut
            }
        }
    }

    async hasMovements(accountId: string): Promise<boolean> {
        const { data, error } = await this.supabase
            .from('cash_movements')
            .select('id')
            .eq('bank_account_id', accountId)
            .limit(1)

        if (error) throw new Error(`Failed to check movements: ${error.message}`)
        return (data?.length ?? 0) > 0
    }

    private async calculateBalance(accountId: string): Promise<number> {
        const account = await this.getById(accountId)
        if (!account) return 0

        const { data, error } = await this.supabase
            .from('cash_movements')
            .select('type, amount')
            .eq('bank_account_id', accountId)

        if (error) throw new Error(`Failed to calculate balance: ${error.message}`)

        let balance = account.initialBalance
        data?.forEach((row) => {
            const amount = Number(row.amount)
            if (row.type === 'IN') {
                balance += amount
            } else {
                balance -= amount
            }
        })

        return balance
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private mapFromDb(row: any): BankAccount {
        return {
            id: row.id,
            tenantId: row.tenant_id,
            name: row.name,
            type: row.type,
            initialBalance: Number(row.initial_balance),
            isActive: row.is_active,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
        }
    }
}
