import { z } from 'zod';

export const UsageProductSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Nome é obrigatório"),
    contentAmount: z.number().positive("Conteúdo deve ser maior que 0"),
    measurementUnit: z.enum(['g', 'ml', 'un']),
    unitLabel: z.string().min(1, "Rótulo é obrigatório"), // tubo, frasco, pote
    stockQuantity: z.number().min(0).default(1),
    currentConsumed: z.number().min(0).default(0),
    totalUnitsConsumed: z.number().min(0).default(0),
    distinctClients: z.number().min(0).default(0).optional(),
    createdAt: z.string(),
    updatedAt: z.string().optional(),
});

export type UsageProduct = z.infer<typeof UsageProductSchema>;

export const CreateUsageProductSchema = UsageProductSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    currentConsumed: true,
    totalUnitsConsumed: true,
});

export type CreateUsageProductInput = z.infer<typeof CreateUsageProductSchema>;

// Log de uso por atendimento
export const UsageProductLogSchema = z.object({
    id: z.string(),
    usageProductId: z.string(),
    appointmentId: z.string().optional(),
    clientId: z.string().optional(),
    professionalId: z.string().optional(),
    amountUsed: z.number().positive("Quantidade deve ser maior que 0"),
    notes: z.string().optional(),
    formulaChangeReason: z.string().optional(),
    createdAt: z.string(),
    // Joined fields
    productName: z.string().optional(),
    measurementUnit: z.string().optional(),
});

export type UsageProductLog = z.infer<typeof UsageProductLogSchema>;

export const CreateUsageProductLogSchema = z.object({
    usageProductId: z.string(),
    appointmentId: z.string().optional(),
    clientId: z.string().optional(),
    professionalId: z.string().optional(),
    amountUsed: z.number().positive(),
    notes: z.string().optional(),
    formulaChangeReason: z.string().optional(),
});

export type CreateUsageProductLogInput = z.infer<typeof CreateUsageProductLogSchema>;
