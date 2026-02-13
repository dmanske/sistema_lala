import { PurchasePayment, CreatePurchasePaymentInput } from '../domain/Purchase';

export interface PurchasePaymentRepository {
    /**
     * Get all payments for a specific purchase
     */
    getByPurchaseId(purchaseId: string): Promise<PurchasePayment[]>;

    /**
     * Register a new payment for a purchase
     * This will create a cash movement (OUT) and update purchase payment status
     */
    create(input: CreatePurchasePaymentInput): Promise<PurchasePayment>;

    /**
     * Delete a payment (reverses cash movement and updates purchase status)
     */
    delete(id: string): Promise<boolean>;

    /**
     * Get payment by ID
     */
    getById(id: string): Promise<PurchasePayment | null>;
}
