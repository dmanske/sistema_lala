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

export const PurchaseSchema = z.object({
    id: z.string(),
    supplierId: z.string().min(1, "Fornecedor é obrigatório"),
    date: z.string(), // ISO Date
    notes: z.string().optional(),
    total: z.number().min(0),
    items: z.array(PurchaseItemSchema).optional(),

    // Payment info
    paymentMethod: z.enum(["CASH", "PIX", "CARD", "TRANSFER", "WALLET"]).optional(),
    paidAmount: z.number().min(0).optional(),
    paidAt: z.string().optional(), // ISO string

    createdAt: z.string(),
});

export type Purchase = z.infer<typeof PurchaseSchema>;

export const CreatePurchaseSchema = PurchaseSchema.omit({
    id: true,
    total: true, // Computed
    items: true,
    createdAt: true,
}).extend({
    items: z.array(CreatePurchaseItemSchema).min(1, "Adicione pelo menos um item"),
});

export type CreatePurchaseInput = z.infer<typeof CreatePurchaseSchema>;
