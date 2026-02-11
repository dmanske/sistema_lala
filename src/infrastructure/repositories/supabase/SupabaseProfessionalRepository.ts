import { createClient } from '@/lib/supabase/client';
import { Professional, CreateProfessionalInput, UpdateProfessionalInput } from '@/core/domain/Professional';
import { ProfessionalRepository } from '@/core/repositories/ProfessionalRepository';

export class SupabaseProfessionalRepository implements ProfessionalRepository {
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

    async getAll(): Promise<Professional[]> {
        // RLS will automatically filter by tenant_id
        const { data, error } = await this.supabase
            .from('professionals')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw new Error(`Failed to fetch professionals: ${error.message}`);
        return (data || []).map(this.mapFromDb);
    }

    async getById(id: string): Promise<Professional | null> {
        const { data, error } = await this.supabase
            .from('professionals')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(`Failed to fetch professional: ${error.message}`);
        }
        return data ? this.mapFromDb(data) : null;
    }

    async getActive(): Promise<Professional[]> {
        // RLS handles tenant filtering
        const { data, error } = await this.supabase
            .from('professionals')
            .select('*')
            .eq('status', 'ACTIVE')
            .order('name', { ascending: true });

        if (error) throw new Error(`Failed to fetch active professionals: ${error.message}`);
        return (data || []).map(this.mapFromDb);
    }

    async create(input: CreateProfessionalInput): Promise<Professional> {
        const tenantId = await this.getTenantId();

        const { data, error } = await this.supabase
            .from('professionals')
            .insert({
                tenant_id: tenantId,
                name: input.name,
                phone: input.phone || null,
                email: input.email || null,
                color: input.color,
                status: input.status,
                commission: input.commission,
                specialties: input.specialties || [],
            })
            .select()
            .single();

        if (error) throw new Error(`Failed to create professional: ${error.message}`);
        return this.mapFromDb(data);
    }

    async update(id: string, input: UpdateProfessionalInput): Promise<Professional> {
        // RLS ensures updates are only on user's tenant
        const updateData: Record<string, unknown> = {};
        if (input.name !== undefined) updateData.name = input.name;
        if (input.phone !== undefined) updateData.phone = input.phone || null;
        if (input.email !== undefined) updateData.email = input.email || null;
        if (input.color !== undefined) updateData.color = input.color;
        if (input.status !== undefined) updateData.status = input.status;
        if (input.commission !== undefined) updateData.commission = input.commission;
        if (input.specialties !== undefined) updateData.specialties = input.specialties;

        const { data, error } = await this.supabase
            .from('professionals')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(`Failed to update professional: ${error.message}`);
        return this.mapFromDb(data);
    }

    async delete(id: string): Promise<void> {
        // RLS ensures deletion is only on user's tenant
        const { error } = await this.supabase
            .from('professionals')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Failed to delete professional: ${error.message}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private mapFromDb(row: any): Professional {
        return {
            id: row.id,
            name: row.name,
            phone: row.phone || undefined,
            email: row.email || undefined,
            color: row.color,
            status: row.status,
            commission: Number(row.commission) || 0,
            specialties: row.specialties || undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at || undefined,
        };
    }
}
