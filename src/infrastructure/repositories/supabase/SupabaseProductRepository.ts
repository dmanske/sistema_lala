import { createClient } from '@/lib/supabase/client';
import { Product, CreateProductInput, ProductMovement, CreateProductMovementInput } from '@/core/domain/Product';
import { ProductRepository } from '@/core/repositories/ProductRepository';

export class SupabaseProductRepository implements ProductRepository {
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

    async getAll(filter?: { search?: string; lowStock?: boolean }): Promise<Product[]> {
        // RLS will automatically filter by tenant_id
        let query = this.supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (filter?.search) {
            query = query.ilike('name', `%${filter.search}%`);
        }

        const { data, error } = await query;
        if (error) throw new Error(`Failed to fetch products: ${error.message}`);

        let products = (data || []).map(this.mapFromDb);

        if (filter?.lowStock) {
            products = products.filter(p => p.currentStock <= p.minStock);
        }

        return products;
    }

    async getById(id: string): Promise<Product | null> {
        const { data, error } = await this.supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(`Failed to fetch product: ${error.message}`);
        }
        return data ? this.mapFromDb(data) : null;
    }

    async create(input: CreateProductInput): Promise<Product> {
        const tenantId = await this.getTenantId();

        const { data, error } = await this.supabase
            .from('products')
            .insert({
                tenant_id: tenantId,
                name: input.name,
                cost: input.cost,
                profit_amount: input.profitAmount,
                profit_percentage: input.profitPercentage,
                price: input.price,
                commission: input.commission,
                net_value: input.netValue || null,
                min_stock: input.minStock,
                current_stock: 0,
            })
            .select()
            .single();

        if (error) throw new Error(`Failed to create product: ${error.message}`);
        return this.mapFromDb(data);
    }

    async update(id: string, input: Partial<Product>): Promise<Product> {
        // RLS ensures updates are only on user's tenant
        const updateData: Record<string, unknown> = {};
        if (input.name !== undefined) updateData.name = input.name;
        if (input.cost !== undefined) updateData.cost = input.cost;
        if (input.profitAmount !== undefined) updateData.profit_amount = input.profitAmount;
        if (input.profitPercentage !== undefined) updateData.profit_percentage = input.profitPercentage;
        if (input.price !== undefined) updateData.price = input.price;
        if (input.commission !== undefined) updateData.commission = input.commission;
        if (input.netValue !== undefined) updateData.net_value = input.netValue;
        if (input.minStock !== undefined) updateData.min_stock = input.minStock;
        if (input.currentStock !== undefined) updateData.current_stock = input.currentStock;

        const { data, error } = await this.supabase
            .from('products')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(`Failed to update product: ${error.message}`);
        return this.mapFromDb(data);
    }

    async delete(id: string): Promise<boolean> {
        // RLS ensures deletions are only on user's tenant
        const { error } = await this.supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Failed to delete product: ${error.message}`);
        return true;
    }

    async addMovement(movement: CreateProductMovementInput): Promise<ProductMovement> {
        const tenantId = await this.getTenantId();

        const { data, error } = await this.supabase
            .from('product_movements')
            .insert({
                tenant_id: tenantId,
                product_id: movement.productId,
                type: movement.type,
                quantity: movement.quantity,
                reason: movement.reason,
                reference_id: movement.referenceId || null,
                reference_type: movement.referenceType || null,
                unit_cost: movement.unitCost || null,
                supplier_id: movement.supplierId || null,
            })
            .select()
            .single();

        if (error) throw new Error(`Failed to add movement: ${error.message}`);

        // Update current_stock cache (read-modify-write)
        const stockDelta = movement.type === 'IN' ? movement.quantity : -movement.quantity;
        const product = await this.getById(movement.productId);
        if (product) {
            await this.supabase
                .from('products')
                .update({
                    current_stock: product.currentStock + stockDelta,
                    last_movement: new Date().toISOString(),
                })
                .eq('id', movement.productId);
        }

        return this.mapMovementFromDb(data);
    }

    async getMovements(productId: string): Promise<ProductMovement[]> {
        const { data, error } = await this.supabase
            .from('product_movements')
            .select('*')
            .eq('product_id', productId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(`Failed to fetch movements: ${error.message}`);
        return (data || []).map(this.mapMovementFromDb);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private mapFromDb(row: any): Product {
        return {
            id: row.id,
            name: row.name,
            cost: Number(row.cost) || 0,
            profitAmount: Number(row.profit_amount) || 0,
            profitPercentage: Number(row.profit_percentage) || 0,
            price: Number(row.price) || 0,
            commission: Number(row.commission) || 0,
            netValue: row.net_value ? Number(row.net_value) : undefined,
            minStock: Number(row.min_stock) || 0,
            currentStock: Number(row.current_stock) || 0,
            lastMovement: row.last_movement || undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at || undefined,
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private mapMovementFromDb(row: any): ProductMovement {
        return {
            id: row.id,
            productId: row.product_id,
            type: row.type,
            quantity: Number(row.quantity),
            reason: row.reason,
            referenceId: row.reference_id || undefined,
            referenceType: row.reference_type || undefined,
            unitCost: row.unit_cost ? Number(row.unit_cost) : undefined,
            supplierId: row.supplier_id || undefined,
            date: row.created_at,
        };
    }
}
