import { createClient } from '@/lib/supabase/client'
import { CashRegister, CashRegisterWithUser, CashRegisterSummary, CashRegisterSummaryWithUser } from '@/core/domain/entities/CashRegister'
import { CashRegisterMovement, CashRegisterMovementWithUser } from '@/core/domain/entities/CashRegisterMovement'
import { 
    CashRegisterRepository, 
    CreateCashRegisterInput,
    CreateMovementInput,
    GetHistoryFilters
} from '@/core/repositories/CashRegisterRepository'
import { SupabaseClient } from '@supabase/supabase-js'
import { startOfDay, endOfDay } from 'date-fns'

export class SupabaseCashRegisterRepository implements CashRegisterRepository {
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

    async getCurrentOpen(): Promise<CashRegister | null> {
        const tenantId = await this.getTenantId()

        const { data, error } = await this.supabase
            .from('cash_registers')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('status', 'OPEN')
            .order('opened_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (error) throw new Error(`Failed to get current open cash register: ${error.message}`)
        if (!data) return null

        return this.mapFromDb(data)
    }

    async getById(id: string): Promise<CashRegister | null> {
        const tenantId = await this.getTenantId()

        const { data, error } = await this.supabase
            .from('cash_registers')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('id', id)
            .maybeSingle()

        if (error) throw new Error(`Failed to get cash register by id: ${error.message}`)
        if (!data) return null

        return this.mapFromDb(data)
    }

    async getByIdWithUser(id: string): Promise<CashRegisterWithUser | null> {
        const tenantId = await this.getTenantId()

        const { data, error } = await this.supabase
            .from('cash_registers')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('id', id)
            .maybeSingle()

        if (error) throw new Error(`Failed to get cash register with user: ${error.message}`)
        if (!data) return null

        // Fetch user names separately
        const openedByProfile = data.opened_by ? await this.getUserName(data.opened_by) : undefined
        const closedByProfile = data.closed_by ? await this.getUserName(data.closed_by) : undefined

        return {
            ...this.mapFromDb(data),
            openedByName: openedByProfile,
            closedByName: closedByProfile
        }
    }

    async getHistory(filters?: GetHistoryFilters): Promise<CashRegisterWithUser[]> {
        const tenantId = await this.getTenantId()

        let query = this.supabase
            .from('cash_registers')
            .select('*')
            .eq('tenant_id', tenantId)

        if (filters?.status) {
            query = query.eq('status', filters.status)
        }

        if (filters?.openedBy) {
            query = query.eq('opened_by', filters.openedBy)
        }

        if (filters?.startDate) {
            query = query.gte('opened_at', startOfDay(filters.startDate).toISOString())
        }

        if (filters?.endDate) {
            query = query.lte('opened_at', endOfDay(filters.endDate).toISOString())
        }

        query = query.order('opened_at', { ascending: false })

        const { data, error } = await query

        if (error) throw new Error(`Failed to get cash register history: ${error.message}`)
        if (!data) return []

        // Fetch user names for all records
        const results = await Promise.all(
            data.map(async (row) => {
                const openedByProfile = row.opened_by ? await this.getUserName(row.opened_by) : undefined
                const closedByProfile = row.closed_by ? await this.getUserName(row.closed_by) : undefined

                return {
                    ...this.mapFromDb(row),
                    openedByName: openedByProfile,
                    closedByName: closedByProfile
                }
            })
        )

        return results
    }

    private async getUserName(userId: string): Promise<string | undefined> {
        try {
            const { data, error } = await this.supabase
                .from('profiles')
                .select('full_name')
                .eq('id', userId)
                .maybeSingle()

            if (error || !data) return undefined
            return data.full_name
        } catch {
            return undefined
        }
    }

    async getSummary(id: string): Promise<CashRegisterSummaryWithUser | null> {
        const cashRegister = await this.getById(id)
        if (!cashRegister) return null

        const tenantId = await this.getTenantId()

        // Get movements count and totals
        const { data: movements, error: movementsError } = await this.supabase
            .from('cash_register_movements')
            .select('type, amount')
            .eq('tenant_id', tenantId)
            .eq('cash_register_id', id)

        if (movementsError) throw new Error(`Failed to get movements: ${movementsError.message}`)

        const movementsCount = movements?.length || 0
        const totalSangria = movements
            ?.filter(m => m.type === 'SANGRIA')
            .reduce((sum, m) => sum + m.amount, 0) || 0
        const totalSuprimento = movements
            ?.filter(m => m.type === 'SUPRIMENTO')
            .reduce((sum, m) => sum + m.amount, 0) || 0

        // Get sales count and total
        // If cash register is closed, filter sales up to closed_at
        let salesQuery = this.supabase
            .from('sales')
            .select('total')
            .eq('tenant_id', tenantId)
            .gte('created_at', cashRegister.openedAt.toISOString())

        if (cashRegister.closedAt) {
            salesQuery = salesQuery.lte('created_at', cashRegister.closedAt.toISOString())
        }

        const { data: salesData, error: salesQueryError } = await salesQuery

        if (salesQueryError) throw new Error(`Failed to get sales: ${salesQueryError.message}`)

        const salesCount = salesData?.length || 0
        const totalSales = salesData?.reduce((sum, s) => sum + s.total, 0) || 0

        // Get user name for opened_by
        const openedByName = await this.getUserName(cashRegister.openedBy)

        // Get bank account name if exists
        let bankAccountName: string | undefined
        if (cashRegister.bankAccountId) {
            const { data: bankAccount } = await this.supabase
                .from('bank_accounts')
                .select('name')
                .eq('id', cashRegister.bankAccountId)
                .maybeSingle()
            
            bankAccountName = bankAccount?.name
        }

        // Create CashRegisterWithUser
        const cashRegisterWithUser: CashRegisterWithUser = {
            ...cashRegister,
            openedByName,
            bankAccountName
        }

        return {
            cashRegister: cashRegisterWithUser,
            movementsCount,
            totalSangria,
            totalSuprimento,
            salesCount,
            totalSales
        }
    }

    async create(input: CreateCashRegisterInput): Promise<CashRegister> {
        // Call the RPC function to open cash register
        const { data, error } = await this.supabase
            .rpc('abrir_caixa_rpc', {
                p_initial_balance: input.initialBalance,
                p_bank_account_id: input.bankAccountId,
                p_opened_by: input.openedBy
            })

        if (error) throw new Error(`Failed to create cash register: ${error.message}`)
        if (!data) throw new Error('Failed to create cash register: No data returned')

        // Fetch the created cash register
        const cashRegister = await this.getById(data)
        if (!cashRegister) throw new Error('Failed to fetch created cash register')

        return cashRegister
    }

    async getMovements(cashRegisterId: string): Promise<CashRegisterMovementWithUser[]> {
        const tenantId = await this.getTenantId()

        const { data, error } = await this.supabase
            .from('cash_register_movements')
            .select(`
                *,
                created_by_profile:profiles!cash_register_movements_created_by_fkey(full_name)
            `)
            .eq('tenant_id', tenantId)
            .eq('cash_register_id', cashRegisterId)
            .order('created_at', { ascending: false })

        if (error) throw new Error(`Failed to get cash register movements: ${error.message}`)
        if (!data) return []

        return data.map(row => this.mapMovementFromDbWithUser(row))
    }

    async createMovement(input: CreateMovementInput): Promise<CashRegisterMovement> {
        const tenantId = await this.getTenantId()
        const { data: { user } } = await this.supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const createdBy = input.createdBy || user.id

        // Validate amount
        if (input.amount <= 0) {
            throw new Error('Amount must be greater than zero')
        }

        // Validate reason
        if (!input.reason || input.reason.trim() === '') {
            throw new Error('Reason cannot be empty')
        }

        // Call the appropriate RPC based on movement type
        const rpcName = input.type === 'SANGRIA' ? 'registrar_sangria_rpc' : 'registrar_suprimento_rpc'
        
        const { data, error } = await this.supabase
            .rpc(rpcName, {
                p_cash_register_id: input.cashRegisterId,
                p_amount: input.amount,
                p_reason: input.reason,
                p_created_by: createdBy
            })

        if (error) throw new Error(`Failed to create ${input.type.toLowerCase()}: ${error.message}`)
        if (!data) throw new Error(`Failed to create ${input.type.toLowerCase()}: No data returned`)

        // Fetch the created movement
        const { data: movement, error: fetchError } = await this.supabase
            .from('cash_register_movements')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('id', data)
            .single()

        if (fetchError) throw new Error(`Failed to fetch created movement: ${fetchError.message}`)
        if (!movement) throw new Error('Failed to fetch created movement')

        return this.mapMovementFromDb(movement)
    }

    private mapMovementFromDb(row: any): CashRegisterMovement {
        return {
            id: row.id,
            tenantId: row.tenant_id,
            cashRegisterId: row.cash_register_id,
            type: row.type,
            amount: row.amount,
            reason: row.reason,
            createdBy: row.created_by,
            createdAt: new Date(row.created_at)
        }
    }

    private mapMovementFromDbWithUser(row: any): CashRegisterMovementWithUser {
        return {
            ...this.mapMovementFromDb(row),
            createdByName: row.created_by_profile?.full_name
        }
    }

    private mapFromDb(row: any): CashRegister {
        return {
            id: row.id,
            tenantId: row.tenant_id,
            openedBy: row.opened_by,
            openedAt: new Date(row.opened_at),
            initialBalance: row.initial_balance,
            bankAccountId: row.bank_account_id,
            status: row.status,
            closedBy: row.closed_by,
            closedAt: row.closed_at ? new Date(row.closed_at) : null,
            expectedBalance: row.expected_balance,
            actualBalance: row.actual_balance,
            difference: row.difference,
            notes: row.notes,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
        }
    }


}
