import { createClient } from '@/lib/supabase/client';
import { Supplier, CreateSupplierInput } from '@/core/domain/Supplier';
import { SupplierRepository } from '@/core/repositories/SupplierRepository';

export class SupabaseSupplierRepository implements SupplierRepository {
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

    async getAll(filter?: { search?: string; status?: string }): Promise<Supplier[]> {
        // RLS will automatically filter by tenant_id
        let query = this.supabase
            .from('suppliers')
            .select('*')
            .order('created_at', { ascending: false });

        if (filter?.status) {
            query = query.eq('status', filter.status);
        }
        if (filter?.search) {
            query = query.or(`name.ilike.%${filter.search}%,cnpj.ilike.%${filter.search}%,email.ilike.%${filter.search}%`);
        }

        const { data, error } = await query;
        if (error) throw new Error(`Failed to fetch suppliers: ${error.message}`);
        return (data || []).map(this.mapFromDb);
    }

    async getById(id: string): Promise<Supplier | null> {
        const { data, error } = await this.supabase
            .from('suppliers')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(`Failed to fetch supplier: ${error.message}`);
        }
        return data ? this.mapFromDb(data) : null;
    }

    async create(input: CreateSupplierInput): Promise<Supplier> {
        const tenantId = await this.getTenantId();

        const { data, error } = await this.supabase
            .from('suppliers')
            .insert({
                tenant_id: tenantId,
                name: input.name,
                cnpj: input.cnpj || null,
                phone: input.phone || null,
                whatsapp: input.whatsapp || null,
                email: input.email || null,
                notes: input.notes || null,
                status: input.status || 'ACTIVE',
            })
            .select()
            .single();

        if (error) throw new Error(`Failed to create supplier: ${error.message}`);
        return this.mapFromDb(data);
    }

    async update(id: string, input: Partial<Supplier>): Promise<Supplier> {
        // RLS ensures updates are only on user's tenant
        const updateData: Record<string, unknown> = {};
        if (input.name !== undefined) updateData.name = input.name;
        if (input.cnpj !== undefined) updateData.cnpj = input.cnpj || null;
        if (input.phone !== undefined) updateData.phone = input.phone || null;
        if (input.whatsapp !== undefined) updateData.whatsapp = input.whatsapp || null;
        if (input.email !== undefined) updateData.email = input.email || null;
        if (input.notes !== undefined) updateData.notes = input.notes || null;
        if (input.status !== undefined) updateData.status = input.status;

        const { data, error } = await this.supabase
            .from('suppliers')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(`Failed to update supplier: ${error.message}`);
        return this.mapFromDb(data);
    }

    async delete(id: string): Promise<boolean> {
        // RLS ensures deletions are only on user's tenant
        const { error } = await this.supabase
            .from('suppliers')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Failed to delete supplier: ${error.message}`);
        return true;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private mapFromDb(row: any): Supplier {
        return {
            id: row.id,
            name: row.name,
            cnpj: row.cnpj || undefined,
            phone: row.phone || undefined,
            whatsapp: row.whatsapp || undefined,
            email: row.email || undefined,
            notes: row.notes || undefined,
            status: row.status,
            createdAt: row.created_at,
            updatedAt: row.updated_at || undefined,
        };
    }
}
