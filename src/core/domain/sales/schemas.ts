
import { z } from 'zod';

export const saleItemSchema = z.object({
    id: z.string().uuid(),
    saleId: z.string().uuid(),
    itemType: z.enum(['product', 'service']),
    name: z.string(), // Snapshot name
    productId: z.string().optional(),
    serviceId: z.string().optional(),
    qty: z.number().min(1),
    unitPrice: z.number().min(0),
    totalPrice: z.number().min(0),
    commissionValue: z.number().optional(),
    costSnapshot: z.number().optional(), // Snapshot of product cost at time of sale
});

export const salePaymentSchema = z.object({
    id: z.string().uuid(),
    saleId: z.string().uuid(),
    method: z.enum(['pix', 'card', 'cash', 'transfer']),
    amount: z.number().min(0),
    paidAt: z.string().datetime(), // ISO string
});

export const saleSchema = z.object({
    id: z.string().uuid(),
    tenantId: z.string(),
    customerId: z.string().optional(),
    appointmentId: z.string().optional(), // Link to appointment if originated there
    status: z.enum(['draft', 'pending_payment', 'paid', 'canceled', 'refunded']),
    subtotal: z.number().min(0),
    discount: z.number().min(0),
    total: z.number().min(0),
    createdAt: z.string().datetime(),
    createdBy: z.string(),
    items: z.array(saleItemSchema).optional(),
    payments: z.array(salePaymentSchema).optional(),
});
