import { createClient } from '@/lib/supabase/client';
import { CreditMovement } from '@/core/domain/Credit';
import { CreditRepository } from '@/core/repositories/CreditRepository';

export class SupabaseCreditRepository implements CreditRepository {
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

    async create(data: CreditMovement): Promise<CreditMovement> {
        // Use RPC to ensure atomicity and Cash Ledger integration
        // Note: data.id is ignored as RPC/DB generates UUIDs
        const { data: insertedId, error } = await this.supabase.rpc('add_client_credit', {
            p_client_id: data.clientId,
            p_amount: data.amount,
            p_origin: data.origin,
            p_note: data.note || null,
        });

        if (error) throw new Error(`Failed to create credit movement: ${error.message}`);

        // Fetch the created movement to return full object
        const { data: inserted, error: fetchError } = await this.supabase
            .from('credit_movements')
            .select('*')
            .eq('id', insertedId)
            .single();

        if (fetchError || !inserted) {
            // In rare case fetch fails but insert succeeded, return constructed object
            // but prefer fetching for consistency (created_at, etc)
            return { ...data, id: insertedId as string };
        }

        return this.mapFromDb(inserted);
    }

    async getByClientId(clientId: string): Promise<CreditMovement[]> {
        const { data, error } = await this.supabase
            .from('credit_movements')
            .select('*')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(`Failed to fetch credit movements: ${error.message}`);
        return (data || []).map(this.mapFromDb);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private mapFromDb(row: any): CreditMovement {
        return {
            id: row.id,
            clientId: row.client_id,
            type: row.type,
            amount: Number(row.amount),
            origin: row.origin,
            note: row.note || undefined,
            createdAt: row.created_at,
        };
    }
}
