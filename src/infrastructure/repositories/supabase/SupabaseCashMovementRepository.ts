import { createClient } from '@/lib/supabase/client'
import { CashMovement } from '@/core/domain/CashMovement'
import { CashMovementRepository } from '@/core/repositories/CashMovementRepository'

import { SupabaseClient } from '@supabase/supabase-js'

export class SupabaseCashMovementRepository implements CashMovementRepository {
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

    async create(movement: Omit<CashMovement, 'id' | 'createdAt' | 'tenantId'>): Promise<CashMovement> {
        const tenantId = await this.getTenantId()

        const { data, error } = await this.supabase
            .from('cash_movements')
            .insert({
                tenant_id: tenantId,
                type: movement.type,
                amount: movement.amount,
                method: movement.method,
                source_type: movement.sourceType,
                source_id: movement.sourceId || null,
                description: movement.description || null,
                occurred_at: movement.occurredAt.toISOString(),
                created_by: movement.createdBy || null
            })
            .select()
            .single()

        if (error) throw new Error(`Failed to create cash movement: ${error.message}`)
        return this.mapFromDb(data)
    }

    async list(filters?: {
        startDate?: Date
        endDate?: Date
        type?: 'IN' | 'OUT'
        method?: string
    }): Promise<CashMovement[]> {
        let query = this.supabase
            .from('cash_movements')
            .select('*')
            .order('occurred_at', { ascending: false })

        if (filters?.startDate) {
            query = query.gte('occurred_at', filters.startDate.toISOString())
        }
        if (filters?.endDate) {
            query = query.lte('occurred_at', filters.endDate.toISOString())
        }
        if (filters?.type) {
            query = query.eq('type', filters.type)
        }
        if (filters?.method) {
            query = query.eq('method', filters.method)
        }

        const { data, error } = await query
        if (error) throw new Error(`Failed to list cash movements: ${error.message}`)
        return (data || []).map(this.mapFromDb)
    }

    async getSummary(filters?: { startDate?: Date; endDate?: Date }): Promise<{ totalIn: number; totalOut: number; balance: number }> {
        let query = this.supabase
            .from('cash_movements')
            .select('type, amount, occurred_at')

        if (filters?.startDate) {
            query = query.gte('occurred_at', filters.startDate.toISOString())
        }
        if (filters?.endDate) {
            query = query.lte('occurred_at', filters.endDate.toISOString())
        }

        const { data, error } = await query
        if (error) throw new Error(`Failed to get cash summary: ${error.message}`)

        let totalIn = 0
        let totalOut = 0

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data?.forEach((row: any) => {
            const val = Number(row.amount)
            if (row.type === 'IN') {
                totalIn += val
            } else if (row.type === 'OUT') {
                totalOut += val
            }
        })

        return {
            totalIn,
            totalOut,
            balance: totalIn - totalOut
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private mapFromDb(row: any): CashMovement {
        return {
            id: row.id,
            tenantId: row.tenant_id,
            type: row.type,
            amount: Number(row.amount),
            method: row.method,
            sourceType: row.source_type,
            sourceId: row.source_id,
            description: row.description,
            occurredAt: new Date(row.occurred_at),
            createdBy: row.created_by,
            createdAt: new Date(row.created_at)
        }
    }
}
