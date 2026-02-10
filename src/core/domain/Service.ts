import { z } from 'zod';

export const ServiceSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Nome é obrigatório"),
    duration: z.number().min(1, "Duração mínima de 1 minuto"),
    cost: z.number().min(0).default(0), // Custo
    profitAmount: z.number().min(0).default(0), // Quero lucrar R$
    profitPercentage: z.number().min(0).default(0), // % Lucro
    price: z.number().min(0), // Preço de Venda
    commission: z.number().min(0).default(0), // Comissão
    // Validation: netValue is typically calculated, but we store it as requested.
    // Formula: Preço - Custo - Comissão (usually).
    netValue: z.number().optional(),
    createdAt: z.string(),
    updatedAt: z.string().optional(),
});

export type Service = z.infer<typeof ServiceSchema>;

export const CreateServiceSchema = ServiceSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true
}).extend({
    cost: z.number().min(0),
    profitAmount: z.number().min(0),
    profitPercentage: z.number().min(0),
    commission: z.number().min(0),
});

export type CreateServiceInput = z.infer<typeof CreateServiceSchema>;
