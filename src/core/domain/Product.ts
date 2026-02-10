import { z } from 'zod';

export const ProductSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Nome é obrigatório"),
    cost: z.number().min(0).default(0),
    profitAmount: z.number().min(0).default(0),
    profitPercentage: z.number().min(0).default(0),
    price: z.number().min(0),
    commission: z.number().min(0).default(0),
    netValue: z.number().optional(),
    minStock: z.number().min(0).default(0),
    currentStock: z.number().default(0),
    lastMovement: z.string().optional(), // Date ISO - Date of last stock change
    createdAt: z.string(),
    updatedAt: z.string().optional(),
});

export type Product = z.infer<typeof ProductSchema>;

export const CreateProductSchema = ProductSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    currentStock: true, // Created with 0 usually, updated via movement
    lastMovement: true,
}).extend({
    minStock: z.number().min(0),
    cost: z.number().min(0),
    profitAmount: z.number().min(0),
    profitPercentage: z.number().min(0),
    commission: z.number().min(0),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;

// --- Movement Domain ---

export const ProductMovementTypeSchema = z.enum(['IN', 'OUT']);
export type ProductMovementType = z.infer<typeof ProductMovementTypeSchema>;

export const ProductMovementSchema = z.object({
    id: z.string(),
    productId: z.string(),
    type: ProductMovementTypeSchema,
    quantity: z.number().positive("Quantidade deve ser positiva"),
    reason: z.string().min(1, "Motivo é obrigatório"), // "Compra", "Ajuste", "Uso em Atendimento"
    referenceId: z.string().optional(), // Appointment ID or Adjustment ID or Purchase ID
    referenceType: z.enum(['APPOINTMENT', 'ADJUSTMENT', 'PURCHASE', 'REFUND']).optional(),
    unitCost: z.number().min(0).optional(),
    supplierId: z.string().optional(),
    date: z.string(), // ISO Date
});

export type ProductMovement = z.infer<typeof ProductMovementSchema>;

export const CreateProductMovementSchema = ProductMovementSchema.omit({
    id: true,
    date: true // Usually set by backend/service
});

export type CreateProductMovementInput = z.infer<typeof CreateProductMovementSchema>;
