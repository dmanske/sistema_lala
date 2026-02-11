import { createClient } from '@/lib/supabase/client';
import { StockMovement, CreateStockMovementDTO } from '@/core/domain/stock/types';
import { StockMovementRepository } from '@/core/repositories/StockMovementRepository';

export class SupabaseStockMovementRepository implements StockMovementRepository {
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

    async create(data: CreateStockMovementDTO): Promise<StockMovement> {
        const tenantId = data.tenantId || await this.getTenantId();

        const { data: inserted, error } = await this.supabase
            .from('stock_movements')
            .insert({
                tenant_id: tenantId,
                product_id: data.productId,
                type: data.type,
                qty: data.qty,
                reason: data.reason,
                reference_type: data.referenceType || null,
                reference_id: data.referenceId || null,
                created_by: data.createdBy,
            })
            .select()
            .single();

        if (error) throw new Error(`Failed to create stock movement: ${error.message}`);

        // Update product current_stock cache
        const stockDelta = data.type === 'in' ? data.qty : -data.qty;
        const { data: product } = await this.supabase
            .from('products')
            .select('current_stock')
            .eq('id', data.productId)
            .single();

        if (product) {
            await this.supabase
                .from('products')
                .update({
                    current_stock: Number(product.current_stock) + stockDelta,
                    last_movement: new Date().toISOString(),
                })
                .eq('id', data.productId);
        }

        return this.mapFromDb(inserted);
    }

    async getByProductId(productId: string): Promise<StockMovement[]> {
        const { data, error } = await this.supabase
            .from('stock_movements')
            .select('*')
            .eq('product_id', productId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(`Failed to fetch stock movements: ${error.message}`);
        return (data || []).map(this.mapFromDb);
    }

    async getByReference(referenceId: string): Promise<StockMovement[]> {
        const { data, error } = await this.supabase
            .from('stock_movements')
            .select('*')
            .eq('reference_id', referenceId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(`Failed to fetch stock movements by reference: ${error.message}`);
        return (data || []).map(this.mapFromDb);
    }

    async getAll(tenantId: string): Promise<StockMovement[]> {
        // RLS will automatically filter by tenant_id
        let query = this.supabase
            .from('stock_movements')
            .select('*')
            .order('created_at', { ascending: false });

        if (tenantId) {
            query = query.eq('tenant_id', tenantId);
        }

        const { data, error } = await query;
        if (error) throw new Error(`Failed to fetch all stock movements: ${error.message}`);
        return (data || []).map(this.mapFromDb);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private mapFromDb(row: any): StockMovement {
        return {
            id: row.id,
            tenantId: row.tenant_id,
            productId: row.product_id,
            type: row.type,
            qty: Number(row.qty),
            reason: row.reason,
            referenceType: row.reference_type || undefined,
            referenceId: row.reference_id || undefined,
            createdAt: row.created_at,
            createdBy: row.created_by,
        };
    }
}
