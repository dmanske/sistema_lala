
import { Sale, PaymentMethod } from '@/core/domain/sales/types';

export interface SaleRepository {
    create(sale: Sale): Promise<Sale>;
    findById(id: string): Promise<Sale | null>;
    findByAppointmentId(appointmentId: string): Promise<Sale | null>;
    findByCustomerId(customerId: string): Promise<Sale[]>;
    findAll(tenantId?: string): Promise<Sale[]>;
    update(id: string, sale: Partial<Sale>): Promise<Sale>;
    delete(id: string): Promise<void>;
    pay(saleId: string, payments: { method: PaymentMethod, amount: number, bankAccountId?: string }[], stockItems?: { productId: string, qty: number }[], creditDebit?: { clientId: string, amount: number }, change?: number): Promise<void>;
    refund(saleId: string): Promise<void>;
}
