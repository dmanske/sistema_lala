import { createClient } from '@/lib/supabase/client';
import { Purchase, CreatePurchaseInput } from '@/core/domain/Purchase';
import { PurchaseRepository } from '@/core/repositories/PurchaseRepository';

export class SupabasePurchaseRepository implements PurchaseRepository {
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

    async getAll(filter?: { supplierId?: string; startDate?: string; endDate?: string }): Promise<Purchase[]> {
        // RLS will automatically filter by tenant_id
        let query = this.supabase
            .from('purchases')
            .select(`
                *,
                purchase_items (
                    id, purchase_id, product_id, quantity, unit_cost, line_total
                )
            `)
            .order('date', { ascending: false });

        if (filter?.supplierId) {
            query = query.eq('supplier_id', filter.supplierId);
        }
        if (filter?.startDate) {
            query = query.gte('date', filter.startDate);
        }
        if (filter?.endDate) {
            query = query.lte('date', filter.endDate);
        }

        const { data, error } = await query;
        if (error) throw new Error(`Failed to fetch purchases: ${error.message}`);
        return (data || []).map(this.mapFromDb);
    }

    async getById(id: string): Promise<Purchase | null> {
        const { data, error } = await this.supabase
            .from('purchases')
            .select(`
                *,
                purchase_items (
                    id, purchase_id, product_id, quantity, unit_cost, line_total
                )
            `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(`Failed to fetch purchase: ${error.message}`);
        }
        return data ? this.mapFromDb(data) : null;
    }

    async create(input: CreatePurchaseInput): Promise<Purchase> {
        const tenantId = await this.getTenantId();

        // Use RPC for atomicity (creates purchase + items + stock movements + cash movement)
        const { data: purchaseId, error } = await this.supabase.rpc('create_purchase_with_movements', {
            p_tenant_id: tenantId,
            p_supplier_id: input.supplierId,
            p_date: input.date,
            p_notes: input.notes || null,
            p_items: input.items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                unitCost: item.unitCost,
            })),
            p_payment_method: input.paymentMethod || null,
            p_paid_amount: input.paidAmount || 0,
            p_paid_at: input.paidAt || null,
            p_bank_account_id: input.bankAccountId || null,
        });

        if (error) throw new Error(`Failed to create purchase: ${error.message}`);

        // Fetch the created purchase with items
        const purchase = await this.getById(purchaseId);
        if (!purchase) throw new Error('Purchase created but not found');
        return purchase;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private mapFromDb(row: any): Purchase {
        const items = (row.purchase_items || []).map((item: Record<string, unknown>) => ({
            id: item.id as string,
            purchaseId: item.purchase_id as string,
            productId: item.product_id as string,
            quantity: Number(item.quantity),
            unitCost: Number(item.unit_cost),
            lineTotal: Number(item.line_total) || Number(item.quantity) * Number(item.unit_cost),
        }));

        return {
            id: row.id,
            supplierId: row.supplier_id,
            date: row.date,
            notes: row.notes || undefined,
            total: Number(row.total) || 0,
            items: items.length > 0 ? items : undefined,
            paymentMethod: row.payment_method || undefined,
            paidAmount: Number(row.paid_amount) || 0,
            paidAt: row.paid_at || undefined,
            createdAt: row.created_at,
        };
    }
}
