import { createClient } from '@/lib/supabase/client';
import { UsageProduct, CreateUsageProductInput, UsageProductLog, CreateUsageProductLogInput } from '@/core/domain/UsageProduct';
import { UsageProductRepository } from '@/core/repositories/UsageProductRepository';

export class SupabaseUsageProductRepository implements UsageProductRepository {
    private supabase = createClient();

    private async getTenantId(): Promise<string> {
        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        const { data: profile, error } = await this.supabase
            .from('profiles').select('tenant_id').eq('id', user.id).single();
        if (error || !profile) throw new Error('Failed to fetch tenant');
        return profile.tenant_id;
    }

    private mapFromDb(row: any): UsageProduct {
        return {
            id: row.id,
            name: row.name,
            contentAmount: parseFloat(row.content_amount),
            measurementUnit: row.measurement_unit,
            unitLabel: row.unit_label,
            currentConsumed: parseFloat(row.current_consumed || '0'),
            totalUnitsConsumed: row.total_units_consumed || 0,
            stockQuantity: row.stock_quantity ?? 1,
            lastResetAt: row.last_reset_at,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }

    private mapLogFromDb(row: any): UsageProductLog {
        return {
            id: row.id,
            usageProductId: row.usage_product_id,
            appointmentId: row.appointment_id,
            clientId: row.client_id,
            professionalId: row.professional_id,
            amountUsed: parseFloat(row.amount_used),
            notes: row.notes,
            formulaChangeReason: row.formula_change_reason,
            tubeNumber: row.tube_number ?? 1,
            createdAt: row.created_at,
            productName: row.usage_products?.name,
            measurementUnit: row.usage_products?.measurement_unit,
        };
    }

    async getAll(filter?: { search?: string }): Promise<UsageProduct[]> {
        let query = this.supabase.from('usage_products').select('*').order('name');
        if (filter?.search) query = query.ilike('name', `%${filter.search}%`);
        const { data, error } = await query;
        if (error) throw new Error(`Failed to fetch usage products: ${error.message}`);
        const products = (data || []).map(this.mapFromDb);

        // Fetch distinct client counts per product
        if (products.length > 0) {
            const { data: logData } = await this.supabase
                .from('usage_product_logs')
                .select('usage_product_id, client_id, created_at');
            if (logData && logData.length > 0) {
                const clientsByProduct = new Map<string, Set<string>>();
                const currentTubeClientsByProduct = new Map<string, Set<string>>();
                for (const log of logData) {
                    if (!log.client_id) continue;
                    // Total distinct clients
                    if (!clientsByProduct.has(log.usage_product_id)) {
                        clientsByProduct.set(log.usage_product_id, new Set());
                    }
                    clientsByProduct.get(log.usage_product_id)!.add(log.client_id);

                    // Current tube clients (logs since last_reset_at)
                    const product = products.find(p => p.id === log.usage_product_id);
                    if (product?.lastResetAt && new Date(log.created_at) >= new Date(product.lastResetAt)) {
                        if (!currentTubeClientsByProduct.has(log.usage_product_id)) {
                            currentTubeClientsByProduct.set(log.usage_product_id, new Set());
                        }
                        currentTubeClientsByProduct.get(log.usage_product_id)!.add(log.client_id);
                    }
                }
                for (const product of products) {
                    product.distinctClients = clientsByProduct.get(product.id)?.size || 0;
                    product.currentTubeClients = currentTubeClientsByProduct.get(product.id)?.size || 0;
                }
            }
        }

        return products;
    }

    async getById(id: string): Promise<UsageProduct | null> {
        const { data, error } = await this.supabase
            .from('usage_products').select('*').eq('id', id).single();
        if (error) { if (error.code === 'PGRST116') return null; throw error; }
        return this.mapFromDb(data);
    }

    async create(input: CreateUsageProductInput): Promise<UsageProduct> {
        const tenantId = await this.getTenantId();
        const { data, error } = await this.supabase.from('usage_products').insert({
            tenant_id: tenantId,
            name: input.name,
            content_amount: input.contentAmount,
            measurement_unit: input.measurementUnit,
            unit_label: input.unitLabel,
            stock_quantity: input.stockQuantity ?? 1,
        }).select().single();
        if (error) throw new Error(`Failed to create: ${error.message}`);
        return this.mapFromDb(data);
    }

    async update(id: string, input: Partial<UsageProduct>): Promise<UsageProduct> {
        const updateData: any = { updated_at: new Date().toISOString() };
        if (input.name !== undefined) updateData.name = input.name;
        if (input.contentAmount !== undefined) updateData.content_amount = input.contentAmount;
        if (input.measurementUnit !== undefined) updateData.measurement_unit = input.measurementUnit;
        if (input.unitLabel !== undefined) updateData.unit_label = input.unitLabel;
        if (input.stockQuantity !== undefined) updateData.stock_quantity = input.stockQuantity;
        if (input.currentConsumed !== undefined) updateData.current_consumed = input.currentConsumed;
        if (input.totalUnitsConsumed !== undefined) updateData.total_units_consumed = input.totalUnitsConsumed;
        if (input.lastResetAt !== undefined) updateData.last_reset_at = input.lastResetAt;

        const { data, error } = await this.supabase
            .from('usage_products').update(updateData).eq('id', id).select().single();
        if (error) throw new Error(`Failed to update: ${error.message}`);
        return this.mapFromDb(data);
    }

    async delete(id: string): Promise<boolean> {
        const { error } = await this.supabase.from('usage_products').delete().eq('id', id);
        if (error) throw new Error(`Failed to delete: ${error.message}`);
        return true;
    }

    async addLog(input: CreateUsageProductLogInput): Promise<UsageProductLog> {
        const tenantId = await this.getTenantId();

        // Get current product to determine tube number
        const product = await this.getById(input.usageProductId);
        const currentTubeNumber = product ? product.totalUnitsConsumed + 1 : 1;

        // 1. Insert log
        const { data, error } = await this.supabase.from('usage_product_logs').insert({
            tenant_id: tenantId,
            usage_product_id: input.usageProductId,
            appointment_id: input.appointmentId || null,
            client_id: input.clientId || null,
            professional_id: input.professionalId || null,
            amount_used: input.amountUsed,
            notes: input.notes || null,
            formula_change_reason: input.formulaChangeReason || null,
            tube_number: currentTubeNumber,
        }).select('*, usage_products(name, measurement_unit)').single();
        if (error) throw new Error(`Failed to add log: ${error.message}`);

        // 2. Update consumption on the product (product already fetched above)
        if (product) {
            let newConsumed = product.currentConsumed + input.amountUsed;
            let newUnits = product.totalUnitsConsumed;
            let newStock = product.stockQuantity;

            // Check if a unit was fully consumed — discount from stock
            while (newConsumed >= product.contentAmount) {
                newConsumed -= product.contentAmount;
                newUnits++;
                if (newStock > 0) newStock--;
            }

            const updateData: Partial<UsageProduct> = {
                currentConsumed: parseFloat(newConsumed.toFixed(2)),
                totalUnitsConsumed: newUnits,
                stockQuantity: newStock,
            };

            // If units changed, a new tube started — update lastResetAt
            if (newUnits > product.totalUnitsConsumed) {
                updateData.lastResetAt = new Date().toISOString();
            }

            await this.update(input.usageProductId, updateData);
        }

        return this.mapLogFromDb(data);
    }

    async getLogsByAppointment(appointmentId: string): Promise<UsageProductLog[]> {
        const { data, error } = await this.supabase
            .from('usage_product_logs')
            .select('*, usage_products(name, measurement_unit)')
            .eq('appointment_id', appointmentId)
            .order('created_at');
        if (error) throw new Error(`Failed to fetch logs: ${error.message}`);
        return (data || []).map((r: any) => this.mapLogFromDb(r));
    }

    async getLogsByClient(clientId: string): Promise<UsageProductLog[]> {
        const { data, error } = await this.supabase
            .from('usage_product_logs')
            .select('*, usage_products(name, measurement_unit)')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false });
        if (error) throw new Error(`Failed to fetch client logs: ${error.message}`);
        return (data || []).map((r: any) => this.mapLogFromDb(r));
    }

    async getAllLogs(): Promise<UsageProductLog[]> {
        const { data, error } = await this.supabase
            .from('usage_product_logs')
            .select('*, usage_products(name, measurement_unit)')
            .order('created_at', { ascending: false });
        if (error) throw new Error(`Failed to fetch all logs: ${error.message}`);
        return (data || []).map((r: any) => ({
            ...this.mapLogFromDb(r),
            clientName: undefined, // will be enriched separately if needed
            professionalName: undefined,
        }));
    }

    async getAllLogsWithDetails(): Promise<(UsageProductLog & { clientName?: string; professionalName?: string })[]> {
        const { data, error } = await this.supabase
            .from('usage_product_logs')
            .select(`
                *,
                usage_products(name, measurement_unit),
                clients(name),
                professionals(name)
            `)
            .order('created_at', { ascending: false });
        if (error) throw new Error(`Failed to fetch logs with details: ${error.message}`);
        return (data || []).map((r: any) => ({
            ...this.mapLogFromDb(r),
            clientName: r.clients?.name,
            professionalName: r.professionals?.name,
        }));
    }

    async getLogsByProduct(productId: string): Promise<UsageProductLog[]> {
        const { data, error } = await this.supabase
            .from('usage_product_logs')
            .select('*, usage_products(name, measurement_unit), clients(name), professionals(name)')
            .eq('usage_product_id', productId)
            .order('tube_number', { ascending: true })
            .order('created_at', { ascending: true });
        if (error) throw new Error(`Failed to fetch product logs: ${error.message}`);
        return (data || []).map((r: any) => ({
            ...this.mapLogFromDb(r),
            clientName: r.clients?.name,
            professionalName: r.professionals?.name,
        }));
    }

    async getLastFormulaForClient(clientId: string): Promise<UsageProductLog[]> {
        // Get the most recent appointment_id for this client that has usage logs
        const { data: lastLog, error: lastErr } = await this.supabase
            .from('usage_product_logs')
            .select('appointment_id')
            .eq('client_id', clientId)
            .not('appointment_id', 'is', null)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (lastErr || !lastLog?.appointment_id) return [];

        return this.getLogsByAppointment(lastLog.appointment_id);
    }
}
