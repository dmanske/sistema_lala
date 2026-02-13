import { createClient } from '@/lib/supabase/client'
import { BankAccount, BankAccountWithBalance, BankAccountWithStats, AccountStatement, AccountMovement, AccountDashboardData, BalancePoint, InOutData, DistributionData } from '@/core/domain/BankAccount'
import { 
    BankAccountRepository, 
    CreateBankAccountInput, 
    UpdateBankAccountInput,
    GetStatementFilters,
    GetDashboardFilters
} from '@/core/repositories/BankAccountRepository'
import { SupabaseClient } from '@supabase/supabase-js'
import { startOfDay, endOfDay, format, startOfWeek, startOfMonth, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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

        const { data, error} = await this.supabase
            .from('bank_accounts')
            .insert({
                tenant_id: tenantId,
                name: input.name,
                type: input.type,
                initial_balance: input.initialBalance ?? 0,
                is_active: true,
                color: input.color ?? this.getDefaultColor(input.type),
                icon: input.icon ?? this.getDefaultIcon(input.type),
                description: input.description,
                credit_limit: input.creditLimit,
                bank_name: input.bankName,
                agency: input.agency,
                account_number: input.accountNumber,
                is_favorite: input.isFavorite ?? false,
                display_order: input.displayOrder ?? 0
            })
            .select()
            .single()

        if (error) throw new Error(`Failed to create bank account: ${error.message}`)
        return this.mapFromDb(data)
    }

    private getDefaultColor(type: string): string {
        switch (type) {
            case 'BANK': return '#3B82F6'
            case 'CARD': return '#EF4444'
            case 'WALLET': return '#10B981'
            default: return '#3B82F6'
        }
    }

    private getDefaultIcon(type: string): string {
        switch (type) {
            case 'BANK': return '🏦'
            case 'CARD': return '💳'
            case 'WALLET': return '💰'
            default: return '🏦'
        }
    }

    async update(id: string, input: UpdateBankAccountInput): Promise<BankAccount> {
        const updateData: Record<string, unknown> = {}
        if (input.name !== undefined) updateData.name = input.name
        if (input.type !== undefined) updateData.type = input.type
        if (input.color !== undefined) updateData.color = input.color
        if (input.icon !== undefined) updateData.icon = input.icon
        if (input.description !== undefined) updateData.description = input.description
        if (input.creditLimit !== undefined) updateData.credit_limit = input.creditLimit
        if (input.bankName !== undefined) updateData.bank_name = input.bankName
        if (input.agency !== undefined) updateData.agency = input.agency
        if (input.accountNumber !== undefined) updateData.account_number = input.accountNumber
        if (input.isFavorite !== undefined) updateData.is_favorite = input.isFavorite
        if (input.displayOrder !== undefined) updateData.display_order = input.displayOrder

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
            .order('is_favorite', { ascending: false })
            .order('display_order', { ascending: true })
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

    async listWithStats(isActive?: boolean): Promise<BankAccountWithStats[]> {
        const accounts = await this.list(isActive)
        
        const accountsWithStats = await Promise.all(
            accounts.map(async (account) => {
                const { data, error } = await this.supabase
                    .from('cash_movements')
                    .select('type, amount, occurred_at')
                    .eq('bank_account_id', account.id)

                if (error) throw new Error(`Failed to get stats: ${error.message}`)

                let balance = account.initialBalance
                let totalIn = 0
                let totalOut = 0
                let lastMovementAt: Date | undefined

                data?.forEach((row) => {
                    const amount = Number(row.amount)
                    if (row.type === 'IN') {
                        balance += amount
                        totalIn += amount
                    } else {
                        balance -= amount
                        totalOut += amount
                    }
                    
                    const movementDate = new Date(row.occurred_at)
                    if (!lastMovementAt || movementDate > lastMovementAt) {
                        lastMovementAt = movementDate
                    }
                })

                return {
                    ...account,
                    currentBalance: balance,
                    totalIn,
                    totalOut,
                    movementCount: data?.length || 0,
                    lastMovementAt
                }
            })
        )

        return accountsWithStats
    }

    async setFavorite(id: string, isFavorite: boolean): Promise<void> {
        const { error } = await this.supabase
            .from('bank_accounts')
            .update({ is_favorite: isFavorite })
            .eq('id', id)

        if (error) throw new Error(`Failed to set favorite: ${error.message}`)
    }

    async updateOrder(accountIds: string[]): Promise<void> {
        // Atualizar ordem de cada conta
        const updates = accountIds.map((id, index) => 
            this.supabase
                .from('bank_accounts')
                .update({ display_order: index })
                .eq('id', id)
        )

        await Promise.all(updates)
    }

    async getDashboard(accountId: string, filters?: GetDashboardFilters): Promise<AccountDashboardData> {
        const account = await this.getById(accountId)
        if (!account) throw new Error('Bank account not found')

        // Buscar movimentações
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

        const { data: movements, error } = await query
        if (error) throw new Error(`Failed to get movements: ${error.message}`)

        // Calcular resumo
        let currentBalance = account.initialBalance
        let totalIn = 0
        let totalOut = 0
        const movementsList: AccountMovement[] = []

        movements?.forEach((row) => {
            const amount = Number(row.amount)
            if (row.type === 'IN') {
                currentBalance += amount
                totalIn += amount
            } else {
                currentBalance -= amount
                totalOut += amount
            }

            movementsList.push({
                id: row.id,
                type: row.type,
                amount,
                method: row.method,
                sourceType: row.source_type,
                sourceId: row.source_id,
                description: row.description,
                occurredAt: new Date(row.occurred_at),
                balanceAfter: currentBalance
            })
        })

        // Gerar dados dos gráficos
        const balanceEvolution = this.generateBalanceEvolution(movementsList, account.initialBalance)
        const inOutComparison = this.generateInOutComparison(movementsList, filters?.groupBy || 'month')
        const distribution = this.generateDistribution(movementsList)

        // Calcular estatísticas
        const stats = this.calculateStats(movementsList)

        return {
            account: {
                ...account,
                currentBalance
            },
            summary: {
                initialBalance: account.initialBalance,
                totalIn,
                totalOut,
                currentBalance,
                movementCount: movementsList.length
            },
            charts: {
                balanceEvolution,
                inOutComparison,
                distribution
            },
            stats,
            recentMovements: movementsList.slice(-10).reverse()
        }
    }

    private generateBalanceEvolution(movements: AccountMovement[], initialBalance: number): BalancePoint[] {
        const points: BalancePoint[] = []
        let balance = initialBalance

        movements.forEach((movement) => {
            balance = movement.balanceAfter
            points.push({
                date: format(movement.occurredAt, 'yyyy-MM-dd'),
                balance
            })
        })

        return points
    }

    private generateInOutComparison(movements: AccountMovement[], groupBy: 'day' | 'week' | 'month'): InOutData[] {
        const grouped = new Map<string, { in: number; out: number }>()

        movements.forEach((movement) => {
            let key: string
            if (groupBy === 'day') {
                key = format(movement.occurredAt, 'yyyy-MM-dd', { locale: ptBR })
            } else if (groupBy === 'week') {
                key = format(startOfWeek(movement.occurredAt), 'yyyy-MM-dd', { locale: ptBR })
            } else {
                key = format(startOfMonth(movement.occurredAt), 'yyyy-MM', { locale: ptBR })
            }

            if (!grouped.has(key)) {
                grouped.set(key, { in: 0, out: 0 })
            }

            const data = grouped.get(key)!
            if (movement.type === 'IN') {
                data.in += movement.amount
            } else {
                data.out += movement.amount
            }
        })

        return Array.from(grouped.entries()).map(([period, data]) => ({
            period,
            in: data.in,
            out: data.out,
            net: data.in - data.out
        }))
    }

    private generateDistribution(movements: AccountMovement[]): DistributionData[] {
        const grouped = new Map<string, number>()
        let total = 0

        movements.forEach((movement) => {
            const source = this.getSourceLabel(movement.sourceType)
            grouped.set(source, (grouped.get(source) || 0) + movement.amount)
            total += movement.amount
        })

        return Array.from(grouped.entries()).map(([source, amount]) => ({
            source,
            amount,
            percentage: total > 0 ? (amount / total) * 100 : 0,
            color: this.getSourceColor(source)
        }))
    }

    private getSourceLabel(sourceType: string): string {
        switch (sourceType) {
            case 'SALE': return 'Vendas'
            case 'REFUND': return 'Estornos'
            case 'PURCHASE': return 'Compras'
            case 'MANUAL': return 'Manual'
            default: return sourceType
        }
    }

    private getSourceColor(source: string): string {
        switch (source) {
            case 'Vendas': return '#10B981'
            case 'Estornos': return '#F59E0B'
            case 'Compras': return '#EF4444'
            case 'Manual': return '#6366F1'
            default: return '#6B7280'
        }
    }

    private calculateStats(movements: AccountMovement[]) {
        if (movements.length === 0) {
            return {
                biggestIn: null,
                biggestOut: null,
                dailyAverage: 0,
                mostActiveDay: 'N/A',
                lastMovement: null
            }
        }

        const inMovements = movements.filter(m => m.type === 'IN')
        const outMovements = movements.filter(m => m.type === 'OUT')

        const biggestIn = inMovements.length > 0
            ? inMovements.reduce((max, m) => m.amount > max.amount ? m : max)
            : null

        const biggestOut = outMovements.length > 0
            ? outMovements.reduce((max, m) => m.amount > max.amount ? m : max)
            : null

        const totalAmount = movements.reduce((sum, m) => sum + m.amount, 0)
        const firstDate = movements[0].occurredAt
        const lastDate = movements[movements.length - 1].occurredAt
        const daysDiff = Math.max(1, Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)))
        const dailyAverage = totalAmount / daysDiff

        const dayCount = new Map<string, number>()
        movements.forEach(m => {
            const day = format(m.occurredAt, 'EEEE', { locale: ptBR })
            dayCount.set(day, (dayCount.get(day) || 0) + 1)
        })
        const mostActiveDay = Array.from(dayCount.entries()).reduce((max, [day, count]) => 
            count > max[1] ? [day, count] : max, ['', 0])[0]

        return {
            biggestIn: biggestIn ? {
                amount: biggestIn.amount,
                date: biggestIn.occurredAt,
                description: biggestIn.description || 'Sem descrição'
            } : null,
            biggestOut: biggestOut ? {
                amount: biggestOut.amount,
                date: biggestOut.occurredAt,
                description: biggestOut.description || 'Sem descrição'
            } : null,
            dailyAverage,
            mostActiveDay,
            lastMovement: lastDate
        }
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
            color: row.color || '#3B82F6',
            icon: row.icon || '🏦',
            description: row.description,
            creditLimit: row.credit_limit ? Number(row.credit_limit) : undefined,
            bankName: row.bank_name,
            agency: row.agency,
            accountNumber: row.account_number,
            isFavorite: row.is_favorite || false,
            displayOrder: row.display_order || 0,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
        }
    }
}
