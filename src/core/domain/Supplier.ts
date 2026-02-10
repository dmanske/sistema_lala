import { z } from "zod";

export const SupplierStatusSchema = z.enum(["ACTIVE", "INACTIVE"]);

export const SupplierSchema = z.object({
    id: z.string(),
    name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
    cnpj: z.string().optional(),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    email: z.string().email("E-mail inválido").optional().or(z.literal("")),
    notes: z.string().optional(),
    status: SupplierStatusSchema.default("ACTIVE"),
    createdAt: z.string(), // ISO Date
    updatedAt: z.string().optional(),
});

export type Supplier = z.infer<typeof SupplierSchema>;

export const CreateSupplierSchema = SupplierSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});

export type CreateSupplierInput = z.infer<typeof CreateSupplierSchema>;
