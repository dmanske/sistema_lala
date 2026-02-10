import * as z from "zod";

export const AppointmentStatusSchema = z.enum([
    "PENDING",
    "CONFIRMED",
    "CANCELED",
    "NO_SHOW",
    "DONE",
    "BLOCKED"
]);

export type AppointmentStatus = z.infer<typeof AppointmentStatusSchema>;

export interface Appointment {
    id: string;
    clientId?: string; // Optional - empty if BLOCKED
    professionalId: string;
    services: string[]; // List of service IDs or names for now
    date: string; // YYYY-MM-DD (civil date)
    startTime: string; // HH:mm
    durationMinutes: number;
    status: AppointmentStatus;
    notes?: string;
    serviceLines?: ServiceLine[]; // Normalized structure
    // Finalization Data
    finalizedAt?: string;
    finalizedServices?: Array<{
        serviceId: string;
        name: string;
        price: number;
        professionalId: string;
    }>;
    usedProducts?: Array<{
        productId: string;
        name: string;
        price: number; // Sale price at moment of sale
        cost: number; // Cost at moment of sale (for reporting)
        quantity: number;
    }>;
    totalServiceValue?: number;
    totalProductValue?: number;
    totalValue?: number;
}

export const FinalizedServiceSchema = z.object({
    serviceId: z.string(),
    name: z.string(),
    price: z.number(),
    professionalId: z.string(),
});

export interface ServiceLine {
    id: string;
    serviceId: string;
    qty: number;
    priceSnapshot: number;
    durationSnapshot: number;
    priceOverride?: number;
}

export const UsedProductSchema = z.object({
    productId: z.string(),
    name: z.string(),
    price: z.number(),
    cost: z.number(),
    quantity: z.number(),
});

export const CreateAppointmentSchema = z.object({
    clientId: z.string().optional(),
    professionalId: z.string().min(1, "Profissional é obrigatório"),
    services: z.array(z.string()).optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (AAAA-MM-DD)"),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida (HH:mm)"),
    durationMinutes: z.number().min(1, "Duração mínima de 1 minuto"),
    status: AppointmentStatusSchema,
    notes: z.string().optional(),

    // Recurrence (Optional for now)
    seriesId: z.string().optional(),
    isRecurring: z.boolean().optional(),
    recurrenceRule: z.string().optional(),

    // New normalized structure
    serviceLines: z.array(z.object({
        id: z.string(),
        serviceId: z.string(),
        qty: z.number().min(1),
        priceSnapshot: z.number().min(0),
        durationSnapshot: z.number().min(1),
        priceOverride: z.number().optional()
    })).optional(),
}).superRefine((data, ctx) => {
    if (data.status !== "BLOCKED") {
        if (!data.clientId || data.clientId.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Cliente é obrigatório",
                path: ["clientId"],
            });
        }
        if (!data.services || data.services.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Selecione pelo menos um serviço",
                path: ["services"],
            });
        }
    }
});

export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;

