import * as z from "zod";

export const ProfessionalStatusSchema = z.enum(["ACTIVE", "INACTIVE"]);
export type ProfessionalStatus = z.infer<typeof ProfessionalStatusSchema>;

export const ProfessionalSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Nome é obrigatório"),
    phone: z.string().optional(),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida (formato: #RRGGBB)"),
    status: ProfessionalStatusSchema,
    commission: z.number().min(0).max(100), // Comissão em %
    specialties: z.array(z.string()).optional(),
    createdAt: z.string(),
    updatedAt: z.string().optional(),
});

export type Professional = z.infer<typeof ProfessionalSchema>;

export const CreateProfessionalSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    phone: z.string().optional(),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida (formato: #RRGGBB)"),
    status: ProfessionalStatusSchema,
    commission: z.number().min(0).max(100),
    specialties: z.array(z.string()).optional(),
});

export type CreateProfessionalInput = z.infer<typeof CreateProfessionalSchema>;

export const UpdateProfessionalSchema = CreateProfessionalSchema.partial();
export type UpdateProfessionalInput = z.infer<typeof UpdateProfessionalSchema>;
