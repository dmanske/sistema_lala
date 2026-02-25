import { z } from 'zod';

export const PurchaseItemSchema = z.object({
    id: z.string(),
    purchaseId: z.string(),
    productId: z.string(),
    quantity: z.number().positive("Quantidade deve ser positiva"),
    unitCost: z.number().min(0, "Custo unitário não pode ser negativo"),
    lineTotal: z.number().min(0),
});

export type PurchaseItem = z.infer<typeof PurchaseItemSchema>;

export const CreatePurchaseItemSchema = PurchaseItemSchema.omit({
    id: true,
    purchaseId: true,
    lineTotal: true, // Computed
});

export type CreatePurchaseItemInput = z.infer<typeof CreatePurchaseItemSchema>;

// Purchase Payment Schema
export const PurchasePaymentSchema = z.object({
    id: z.string(),
    purchaseId: z.string(),
    bankAccountId: z.string(),
    amount: z.number().positive("Valor deve ser positivo"),
    method: z.enum(["CASH", "PIX", "CARD", "TRANSFER", "WALLET"]),
    paidAt: z.string(), // ISO string
    notes: z.string().optional(),
    createdAt: z.string(),
});

export type PurchasePayment = z.infer<typeof PurchasePaymentSchema>;

export const CreatePurchasePaymentSchema = PurchasePaymentSchema.omit({
    id: true,
    createdAt: true,
    paidAt: true, // Will be set to now
});

export type CreatePurchasePaymentInput = z.infer<typeof CreatePurchasePaymentSchema>;

export const PurchaseSchema = z.object({
    id: z.string(),
    supplierId: z.string().min(1, "Fornecedor é obrigatório"),
    date: z.string(), // ISO Date
    notes: z.string().optional(),
    total: z.number().min(0),
    items: z.array(PurchaseItemSchema).optional(),
    
    // Payment status
    paymentStatus: z.enum(["PENDING", "PARTIAL", "PAID"]).default("PENDING"),
    payments: z.array(PurchasePaymentSchema).optional(),

    // Installment support
    paymentType: z.enum(["IMMEDIATE", "SINGLE_DUE", "INSTALLMENT"]).default("IMMEDIATE"),
    installmentsCount: z.number().min(1).max(12).optional(),
    firstDueDate: z.string().optional(), // ISO Date

    // Legacy payment info (deprecated, kept for backward compatibility)
    paymentMethod: z.enum(["CASH", "PIX", "CARD", "TRANSFER", "WALLET"]).optional(),
    paidAmount: z.number().min(0).optional(),
    paidAt: z.string().optional(), // ISO string

    createdAt: z.string(),
    updatedAt: z.string().optional(),
});

export type Purchase = z.infer<typeof PurchaseSchema>;

export const CreatePurchaseSchema = PurchaseSchema.omit({
    id: true,
    total: true, // Computed
    items: true,
    createdAt: true,
    updatedAt: true,
    paymentStatus: true,
    payments: true,
}).extend({
    items: z.array(CreatePurchaseItemSchema).min(1, "Adicione pelo menos um item"),
    bankAccountId: z.string().optional(),
    costCenterId: z.string().optional(),
    projectId: z.string().optional(),
    // Installment fields
    installmentInterval: z.number().min(1).default(30).optional(), // Days between installments
});

export type CreatePurchaseInput = z.infer<typeof CreatePurchaseSchema>;

export const UpdatePurchaseSchema = z.object({
    date: z.string(),
    notes: z.string().optional(),
    items: z.array(CreatePurchaseItemSchema).min(1, "Adicione pelo menos um item"),
});

export type UpdatePurchaseInput = z.infer<typeof UpdatePurchaseSchema>;

// Helper to calculate payment summary
export interface PurchasePaymentSummary {
    total: number;
    paid: number;
    remaining: number;
    status: "PENDING" | "PARTIAL" | "PAID";
}

export function calculatePaymentSummary(purchase: Purchase): PurchasePaymentSummary {
    const total = purchase.total;
    const paid = purchase.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
    const remaining = Math.max(0, total - paid);
    
    let status: "PENDING" | "PARTIAL" | "PAID" = "PENDING";
    if (paid >= total) {
        status = "PAID";
    } else if (paid > 0) {
        status = "PARTIAL";
    }
    
    return { total, paid, remaining, status };
}
