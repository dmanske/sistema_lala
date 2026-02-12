import { createClient } from '@/lib/supabase/client';
import { Client, CreateClientInput } from '@/core/domain/Client';
import { ClientRepository } from '@/core/repositories/ClientRepository';

export class SupabaseClientRepository implements ClientRepository {
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

    async getAll(filter?: { status?: string; search?: string }): Promise<Client[]> {
        // RLS will automatically filter by tenant_id
        let query = this.supabase
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false });

        if (filter?.status) {
            query = query.eq('status', filter.status);
        }
        if (filter?.search) {
            query = query.or(`name.ilike.%${filter.search}%,phone.ilike.%${filter.search}%`);
        }

        const { data, error } = await query;
        if (error) throw new Error(`Failed to fetch clients: ${error.message}`);
        return (data || []).map(this.mapFromDb);
    }

    async getById(id: string): Promise<Client | null> {
        const { data, error } = await this.supabase
            .from('clients')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw new Error(`Failed to fetch client: ${error.message}`);
        }
        return data ? this.mapFromDb(data) : null;
    }

    async create(input: CreateClientInput): Promise<Client> {
        const tenantId = await this.getTenantId();

        const { data, error } = await this.supabase
            .from('clients')
            .insert({
                tenant_id: tenantId,
                name: input.name,
                birth_date: input.birthDate || null,
                phone: input.phone || null,
                whatsapp: input.whatsapp || null,
                city: input.city,
                notes: input.notes || null,
                photo_url: input.photoUrl || null,
                status: input.status || 'ACTIVE',
            })
            .select()
            .single();

        if (error) throw new Error(`Failed to create client: ${error.message}`);
        return this.mapFromDb(data);
    }

    async update(id: string, client: Partial<Client>): Promise<Client> {
        // RLS ensures updates are only on user's tenant
        const updateData: Record<string, unknown> = {};
        if (client.name !== undefined) updateData.name = client.name;
        if (client.birthDate !== undefined) updateData.birth_date = client.birthDate || null;
        if (client.phone !== undefined) updateData.phone = client.phone || null;
        if (client.whatsapp !== undefined) updateData.whatsapp = client.whatsapp || null;
        if (client.city !== undefined) updateData.city = client.city;
        if (client.notes !== undefined) updateData.notes = client.notes || null;
        if (client.photoUrl !== undefined) updateData.photo_url = client.photoUrl || null;
        if (client.status !== undefined) updateData.status = client.status;
        if (client.creditBalance !== undefined) updateData.credit_balance = client.creditBalance;

        const { data, error } = await this.supabase
            .from('clients')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(`Failed to update client: ${error.message}`);
        return this.mapFromDb(data);
    }

    async delete(id: string): Promise<boolean> {
        // RLS ensures deletion is only on user's tenant
        const { error } = await this.supabase
            .from('clients')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Failed to delete client: ${error.message}`);
        return true;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private mapFromDb(row: any): Client {
        return {
            id: row.id,
            name: row.name,
            birthDate: row.birth_date || undefined,
            phone: row.phone || undefined,
            whatsapp: row.whatsapp || undefined,
            city: row.city,
            notes: row.notes || undefined,
            photoUrl: row.photo_url || undefined,
            status: row.status,
            createdAt: row.created_at,
            creditBalance: Number(row.credit_balance) || 0,
            hasHistory: false, // Will be computed when needed
        };
    }
}
