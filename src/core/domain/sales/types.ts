
import { z } from 'zod';
import { saleSchema, saleItemSchema, salePaymentSchema } from './schemas';

export type SaleStatus = 'draft' | 'pending_payment' | 'paid' | 'canceled' | 'refunded';
export type PaymentMethod = 'pix' | 'card' | 'cash' | 'transfer' | 'credit' | 'fiado';
export type SaleItemType = 'product' | 'service';

export type Sale = z.infer<typeof saleSchema>;
export type SaleItem = z.infer<typeof saleItemSchema>;
export type SalePayment = z.infer<typeof salePaymentSchema>;

export interface CreateSaleDTO {
    tenantId: string;
    customerId?: string;
    appointmentId?: string;
    createdBy: string;
}

export interface UpsertSaleItemsDTO {
    saleId: string;
    items: Omit<SaleItem, 'saleId' | 'totalPrice'>[];
}

export interface PaySaleDTO {
    saleId: string;
    method: PaymentMethod;
    amount: number;
    paidAt: Date;
    createdBy: string;
}

export interface RefundSaleDTO {
    saleId: string;
    createdBy: string;
}
