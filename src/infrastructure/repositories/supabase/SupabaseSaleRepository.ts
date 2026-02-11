import { createClient } from '@/lib/supabase/client';
import { Sale, PaymentMethod } from '@/core/domain/sales/types';
import { SaleRepository } from '@/core/repositories/SaleRepository';

export class SupabaseSaleRepository implements SaleRepository {
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

    async create(sale: Sale): Promise<Sale> {
        const tenantId = await this.getTenantId();

        const { data, error } = await this.supabase
            .from('sales')
            .insert({
                id: sale.id || undefined,
                tenant_id: tenantId,
                customer_id: sale.customerId || null,
                appointment_id: sale.appointmentId || null,
                status: sale.status,
                subtotal: sale.subtotal,
                discount: sale.discount,
                total: sale.total,
                created_by: sale.createdBy,
            })
            .select()
            .single();

        if (error) throw new Error(`Failed to create sale: ${error.message}`);

        // Insert items
        if (sale.items && sale.items.length > 0) {
            const { error: itemsError } = await this.supabase
                .from('sale_items')
                .insert(sale.items.map(item => ({
                    id: item.id || undefined,
                    sale_id: data.id,
                    item_type: item.itemType,
                    item_name: item.name,
                    product_id: item.productId || null,
                    service_id: item.serviceId || null,
                    qty: item.qty,
                    unit_price: item.unitPrice,
                    total_price: item.totalPrice,
                    commission_value: item.commissionValue || null,
                    cost_snapshot: item.costSnapshot || null,
                })));

            if (itemsError) throw new Error(`Failed to create sale items: ${itemsError.message}`);
        }

        // Insert payments
        if (sale.payments && sale.payments.length > 0) {
            const { error: paymentsError } = await this.supabase
                .from('sale_payments')
                .insert(sale.payments.map(payment => ({
                    id: payment.id || undefined,
                    sale_id: data.id,
                    method: payment.method,
                    amount: payment.amount,
                    paid_at: payment.paidAt,
                    change_amount: payment.change || 0,
                })));

            if (paymentsError) throw new Error(`Failed to create sale payments: ${paymentsError.message}`);
        }

        return this.mapFromDb(data, sale.items, sale.payments);
    }

    async findById(id: string): Promise<Sale | null> {
        const { data, error } = await this.supabase
            .from('sales')
            .select(`
                *,
                sale_items (*),
                sale_payments (*)
            `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(`Failed to fetch sale: ${error.message}`);
        }
        return data ? this.mapFromDbFull(data) : null;
    }

    async findByAppointmentId(appointmentId: string): Promise<Sale | null> {
        const { data, error } = await this.supabase
            .from('sales')
            .select(`
                *,
                sale_items (*),
                sale_payments (*)
            `)
            .eq('appointment_id', appointmentId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) throw new Error(`Failed to fetch sale by appointment: ${error.message}`);
        return data ? this.mapFromDbFull(data) : null;
    }

    async findByCustomerId(customerId: string): Promise<Sale[]> {
        const { data, error } = await this.supabase
            .from('sales')
            .select(`
                *,
                sale_items (*),
                sale_payments (*)
            `)
            .eq('customer_id', customerId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(`Failed to fetch customer sales: ${error.message}`);
        return (data || []).map(this.mapFromDbFull);
    }

    async findAll(tenantId?: string): Promise<Sale[]> {
        // RLS will automatically filter by tenant_id
        let query = this.supabase
            .from('sales')
            .select(`
                *,
                sale_items (*),
                sale_payments (*)
            `)
            .order('created_at', { ascending: false });

        if (tenantId) {
            query = query.eq('tenant_id', tenantId);
        }

        const { data, error } = await query;
        if (error) throw new Error(`Failed to fetch sales: ${error.message}`);
        return (data || []).map(this.mapFromDbFull);
    }

    async update(id: string, sale: Partial<Sale>): Promise<Sale> {
        const updateData: Record<string, unknown> = {};
        if (sale.status !== undefined) updateData.status = sale.status;
        if (sale.subtotal !== undefined) updateData.subtotal = sale.subtotal;
        if (sale.discount !== undefined) updateData.discount = sale.discount;
        if (sale.total !== undefined) updateData.total = sale.total;

        const { error } = await this.supabase
            .from('sales')
            .update(updateData)
            .eq('id', id);

        if (error) throw new Error(`Failed to update sale: ${error.message}`);

        // Update items if provided
        if (sale.items) {
            await this.supabase.from('sale_items').delete().eq('sale_id', id);
            if (sale.items.length > 0) {
                await this.supabase
                    .from('sale_items')
                    .insert(sale.items.map(item => ({
                        sale_id: id,
                        item_type: item.itemType,
                        item_name: item.name,
                        product_id: item.productId || null,
                        service_id: item.serviceId || null,
                        qty: item.qty,
                        unit_price: item.unitPrice,
                        total_price: item.totalPrice,
                        commission_value: item.commissionValue || null,
                        cost_snapshot: item.costSnapshot || null,
                    })));
            }
        }

        // Update payments if provided
        if (sale.payments) {
            await this.supabase.from('sale_payments').delete().eq('sale_id', id);
            if (sale.payments.length > 0) {
                await this.supabase
                    .from('sale_payments')
                    .insert(sale.payments.map(payment => ({
                        sale_id: id,
                        method: payment.method,
                        amount: payment.amount,
                        paid_at: payment.paidAt,
                        change_amount: payment.change || 0,
                    })));
            }
        }

        const updated = await this.findById(id);
        if (!updated) throw new Error('Sale not found after update');
        return updated;
    }

    async delete(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('sales')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Failed to delete sale: ${error.message}`);
    }

    async pay(
        saleId: string,
        payments: { method: PaymentMethod, amount: number }[],
        stockItems?: { productId: string, qty: number }[],
        creditDebit?: { clientId: string, amount: number },
        change?: number
    ): Promise<void> {
        const { error } = await this.supabase.rpc('pay_sale', {
            p_sale_id: saleId,
            p_payments: payments,
            p_stock_items: stockItems || [],
            p_credit_debit: creditDebit || null,
            p_change_amount: change || 0
        });

        if (error) {
            console.error('RPC pay_sale error:', error);
            throw new Error(`Failed to pay sale via RPC: ${error.message}`);
        }
    }

    async refund(saleId: string): Promise<void> {
        const { error } = await this.supabase.rpc('refund_sale', {
            p_sale_id: saleId
        });

        if (error) {
            console.error('RPC refund_sale error:', error);
            throw new Error(`Failed to refund sale via RPC: ${error.message}`);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private mapFromDb(row: any, items?: any[], payments?: any[]): Sale {
        return {
            id: row.id,
            tenantId: row.tenant_id,
            customerId: row.customer_id || undefined,
            appointmentId: row.appointment_id || undefined,
            status: row.status,
            subtotal: Number(row.subtotal) || 0,
            discount: Number(row.discount) || 0,
            total: Number(row.total) || 0,
            createdAt: row.created_at,
            createdBy: row.created_by,
            items: items || undefined,
            payments: payments || undefined,
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private mapFromDbFull(row: any): Sale {
        const items = (row.sale_items || []).map((item: Record<string, unknown>) => ({
            id: item.id as string,
            saleId: item.sale_id as string,
            itemType: item.item_type as string,
            name: item.item_name as string,
            productId: (item.product_id as string) || undefined,
            serviceId: (item.service_id as string) || undefined,
            qty: Number(item.qty),
            unitPrice: Number(item.unit_price),
            totalPrice: Number(item.total_price),
            commissionValue: item.commission_value ? Number(item.commission_value) : undefined,
            costSnapshot: item.cost_snapshot ? Number(item.cost_snapshot) : undefined,
        }));

        const payments = (row.sale_payments || []).map((payment: Record<string, unknown>) => ({
            id: payment.id as string,
            saleId: payment.sale_id as string,
            method: payment.method as string,
            amount: Number(payment.amount),
            paidAt: payment.paid_at as string,
            change: payment.change_amount ? Number(payment.change_amount) : undefined,
        }));

        return {
            id: row.id,
            tenantId: row.tenant_id,
            customerId: row.customer_id || undefined,
            appointmentId: row.appointment_id || undefined,
            status: row.status,
            subtotal: Number(row.subtotal) || 0,
            discount: Number(row.discount) || 0,
            total: Number(row.total) || 0,
            createdAt: row.created_at,
            createdBy: row.created_by,
            items: items.length > 0 ? items : undefined,
            payments: payments.length > 0 ? payments : undefined,
        };
    }
}
