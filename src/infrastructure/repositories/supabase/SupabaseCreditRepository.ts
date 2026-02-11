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
        const tenantId = await this.getTenantId();

        const { data: inserted, error } = await this.supabase
            .from('credit_movements')
            .insert({
                id: data.id || undefined,
                tenant_id: tenantId,
                client_id: data.clientId,
                type: data.type,
                amount: data.amount,
                origin: data.origin,
                note: data.note || null,
            })
            .select()
            .single();

        if (error) throw new Error(`Failed to create credit movement: ${error.message}`);

        // Update client credit_balance
        const delta = data.type === 'CREDIT' ? data.amount : -data.amount;
        // Try RPC first (atomic)
        const { error: updateError } = await this.supabase.rpc('update_client_credit', {
            p_client_id: data.clientId,
            p_delta: delta,
        });

        // Fallback: manual update if RPC doesn't exist yet or fails for other reasons
        if (updateError) {
            // Check current balance
            const { data: client } = await this.supabase
                .from('clients')
                .select('credit_balance')
                .eq('id', data.clientId)
                .single();

            if (client) {
                await this.supabase
                    .from('clients')
                    .update({ credit_balance: Number(client.credit_balance) + delta })
                    .eq('id', data.clientId);
            }
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
