import { createClient } from '@/lib/supabase/client';
import { PurchasePayment, CreatePurchasePaymentInput } from '@/core/domain/Purchase';
import { PurchasePaymentRepository } from '@/core/repositories/PurchasePaymentRepository';

export class SupabasePurchasePaymentRepository implements PurchasePaymentRepository {
    private supabase = createClient();

    async getByPurchaseId(purchaseId: string): Promise<PurchasePayment[]> {
        const { data, error } = await this.supabase
            .from('purchase_payments')
            .select('*')
            .eq('purchase_id', purchaseId)
            .order('paid_at', { ascending: false });

        if (error) throw new Error(`Failed to fetch purchase payments: ${error.message}`);
        return (data || []).map(this.mapFromDb);
    }

    async create(input: CreatePurchasePaymentInput): Promise<PurchasePayment> {
        // Call RPC function to register payment (handles cash movement and status update)
        const { data, error } = await this.supabase.rpc('register_purchase_payment', {
            p_purchase_id: input.purchaseId,
            p_bank_account_id: input.bankAccountId,
            p_amount: input.amount,
            p_method: input.method,
            p_notes: input.notes || null
        });

        if (error) throw new Error(`Failed to register purchase payment: ${error.message}`);

        // Fetch the created payment
        const payment = await this.getById(data);
        if (!payment) throw new Error('Payment created but not found');
        
        return payment;
    }

    async delete(id: string): Promise<boolean> {
        // Call RPC function to delete payment (handles cash movement reversal and status update)
        const { error } = await this.supabase.rpc('delete_purchase_payment', {
            p_payment_id: id
        });

        if (error) throw new Error(`Failed to delete purchase payment: ${error.message}`);
        return true;
    }

    async getById(id: string): Promise<PurchasePayment | null> {
        const { data, error } = await this.supabase
            .from('purchase_payments')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw new Error(`Failed to fetch purchase payment: ${error.message}`);
        }

        return data ? this.mapFromDb(data) : null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private mapFromDb(row: any): PurchasePayment {
        return {
            id: row.id,
            purchaseId: row.purchase_id,
            bankAccountId: row.bank_account_id,
            amount: Number(row.amount),
            method: row.method,
            paidAt: row.paid_at,
            notes: row.notes || undefined,
            createdAt: row.created_at
        };
    }
}
