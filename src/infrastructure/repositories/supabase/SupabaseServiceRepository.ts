import { createClient } from '@/lib/supabase/client';
import { Service, CreateServiceInput } from '@/core/domain/Service';
import { ServiceRepository } from '@/core/repositories/ServiceRepository';

export class SupabaseServiceRepository implements ServiceRepository {
    private supabase = createClient();

    private async getTenantId(): Promise<string> {
        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data: profile, error } = await this.supabase
            .from('profiles')
            .select('tenant_id')
            .eq('id', user.id)
            .single();

        if (error || !profile) {
            throw new Error('Failed to fetch user profile for tenant context');
        }

        return profile.tenant_id;
    }

    async getAll(filter?: { search?: string }): Promise<Service[]> {
        // RLS will automatically filter by tenant_id
        let query = this.supabase
            .from('services')
            .select('*')
            .order('created_at', { ascending: false });

        if (filter?.search) {
            query = query.ilike('name', `%${filter.search}%`);
        }

        const { data, error } = await query;
        if (error) throw new Error(`Failed to fetch services: ${error.message}`);
        return (data || []).map(this.mapFromDb);
    }

    async getById(id: string): Promise<Service | null> {
        const { data, error } = await this.supabase
            .from('services')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(`Failed to fetch service: ${error.message}`);
        }
        return data ? this.mapFromDb(data) : null;
    }

    async create(input: CreateServiceInput): Promise<Service> {
        const tenantId = await this.getTenantId();

        const { data, error } = await this.supabase
            .from('services')
            .insert({
                tenant_id: tenantId,
                name: input.name,
                duration: input.duration,
                cost: input.cost,
                profit_amount: input.profitAmount,
                profit_percentage: input.profitPercentage,
                price: input.price,
                commission: input.commission,
                net_value: input.netValue || null,
            })
            .select()
            .single();

        if (error) throw new Error(`Failed to create service: ${error.message}`);
        return this.mapFromDb(data);
    }

    async update(id: string, input: Partial<Service>): Promise<Service> {
        // RLS ensures updates are only on user's tenant
        const updateData: Record<string, unknown> = {};
        if (input.name !== undefined) updateData.name = input.name;
        if (input.duration !== undefined) updateData.duration = input.duration;
        if (input.cost !== undefined) updateData.cost = input.cost;
        if (input.profitAmount !== undefined) updateData.profit_amount = input.profitAmount;
        if (input.profitPercentage !== undefined) updateData.profit_percentage = input.profitPercentage;
        if (input.price !== undefined) updateData.price = input.price;
        if (input.commission !== undefined) updateData.commission = input.commission;
        if (input.netValue !== undefined) updateData.net_value = input.netValue;

        const { data, error } = await this.supabase
            .from('services')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(`Failed to update service: ${error.message}`);
        return this.mapFromDb(data);
    }

    async delete(id: string): Promise<boolean> {
        // RLS ensures deletions are only on user's tenant
        const { error } = await this.supabase
            .from('services')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Failed to delete service: ${error.message}`);
        return true;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private mapFromDb(row: any): Service {
        return {
            id: row.id,
            name: row.name,
            duration: Number(row.duration),
            cost: Number(row.cost) || 0,
            profitAmount: Number(row.profit_amount) || 0,
            profitPercentage: Number(row.profit_percentage) || 0,
            price: Number(row.price) || 0,
            commission: Number(row.commission) || 0,
            netValue: row.net_value ? Number(row.net_value) : undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at || undefined,
        };
    }
}
