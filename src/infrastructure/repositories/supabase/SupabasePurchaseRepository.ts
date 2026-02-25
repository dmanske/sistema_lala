import { createClient } from '@/lib/supabase/client';
import { Purchase, CreatePurchaseInput, UpdatePurchaseInput } from '@/core/domain/Purchase';
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

    async getAll(filter?: { supplierId?: string; startDate?: string; endDate?: string; paymentStatus?: string }): Promise<Purchase[]> {
        // RLS will automatically filter by tenant_id
        let query = this.supabase
            .from('purchases')
            .select(`
                *,
                purchase_items (
                    id, purchase_id, product_id, quantity, unit_cost, line_total
                ),
                purchase_payments (
                    id, purchase_id, bank_account_id, amount, method, paid_at, notes, created_at
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
        if (filter?.paymentStatus) {
            query = query.eq('payment_status', filter.paymentStatus);
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
                ),
                purchase_payments (
                    id, purchase_id, bank_account_id, amount, method, paid_at, notes, created_at
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
        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Calculate total
        const total = input.items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);

        // Determine payment status (UPPERCASE as required by constraint)
        const paymentStatus = input.paidAt ? 'PAID' : 'PENDING';

        // Use RPC for atomicity (creates purchase + items + stock movements + cash movement)
        const { data: purchaseId, error } = await this.supabase.rpc('create_purchase_with_movements', {
            p_purchase: {
                supplier_id: input.supplierId,
                date: input.date,
                notes: input.notes || null,
                total_amount: total,
                payment_status: paymentStatus,
                payment_method: input.paymentMethod || null,
                tenant_id: tenantId,
                created_by: user.id,
            },
            p_items: input.items.map(item => ({
                product_id: item.productId,
                quantity: item.quantity,
                unit_cost: item.unitCost,
            })),
            p_bank_account_id: input.bankAccountId || null,
        });

        if (error) throw new Error(`Failed to create purchase: ${error.message}`);

        // Fetch the created purchase with items
        const purchase = await this.getById(purchaseId);
        if (!purchase) throw new Error('Purchase created but not found');
        return purchase;
    }

    async update(id: string, input: UpdatePurchaseInput): Promise<Purchase> {
        // Use RPC for atomicity (updates purchase + items + adjusts stock movements)
        const { error } = await this.supabase.rpc('update_purchase', {
            p_purchase_id: id,
            p_date: input.date,
            p_notes: input.notes || null,
            p_items: input.items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                unitCost: item.unitCost,
            })),
        });

        if (error) throw new Error(`Failed to update purchase: ${error.message}`);

        // Fetch the updated purchase
        const purchase = await this.getById(id);
        if (!purchase) throw new Error('Purchase updated but not found');
        return purchase;
    }

    async delete(id: string): Promise<void> {
        // Use RPC for atomicity (deletes purchase + reverses stock + reverses payments)
        const { error } = await this.supabase.rpc('delete_purchase', {
            p_purchase_id: id,
        });

        if (error) throw new Error(`Failed to delete purchase: ${error.message}`);
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

        const payments = (row.purchase_payments || []).map((payment: Record<string, unknown>) => ({
            id: payment.id as string,
            purchaseId: payment.purchase_id as string,
            bankAccountId: payment.bank_account_id as string,
            amount: Number(payment.amount),
            method: payment.method as string,
            paidAt: payment.paid_at as string,
            notes: payment.notes as string | undefined,
            createdAt: payment.created_at as string,
        }));

        return {
            id: row.id,
            supplierId: row.supplier_id,
            date: row.date,
            notes: row.notes || undefined,
            total: Number(row.total) || 0,
            items: items.length > 0 ? items : undefined,
            paymentStatus: row.payment_status || 'PENDING',
            payments: payments.length > 0 ? payments : undefined,
            paymentType: row.payment_type || 'IMMEDIATE',
            // Legacy fields (kept for backward compatibility)
            paymentMethod: row.payment_method || undefined,
            paidAmount: Number(row.paid_amount) || 0,
            paidAt: row.paid_at || undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at || undefined,
        };
    }
}
