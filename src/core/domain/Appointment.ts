import * as z from "zod";

export const AppointmentStatusSchema = z.enum([
    "PENDING",
    "CONFIRMED",
    "CANCELED",
    "NO_SHOW",
    "DONE"
]);

export type AppointmentStatus = z.infer<typeof AppointmentStatusSchema>;

export interface Appointment {
    id: string;
    clientId: string;
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
    clientId: z.string().min(1, "Cliente é obrigatório"),
    professionalId: z.string().min(1, "Profissional é obrigatório"),
    services: z.array(z.string()).min(1, "Selecione pelo menos um serviço"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (AAAA-MM-DD)"),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida (HH:mm)"),
    durationMinutes: z.number().min(1, "Duração mínima de 1 minuto"),
    status: AppointmentStatusSchema.default("PENDING"),
    notes: z.string().optional(),

    // Recurrence (Optional for now)
    seriesId: z.string().optional(),
    isRecurring: z.boolean().optional(),
    recurrenceRule: z.string().optional(),

    // New normalized structure
    serviceLines: z.array(z.object({
        id: z.string(),
        serviceId: z.string(),
        qty: z.number().min(1).default(1),
        priceSnapshot: z.number().min(0),
        durationSnapshot: z.number().min(1),
        priceOverride: z.number().optional()
    })).optional(),
});

export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;

// Mock data (Deprecated - use Services from Repository)
export const MOCK_PROFESSIONALS = [
    { id: "p1", name: "Lala (Principal)", color: "#8b5cf6" },
    { id: "p2", name: "Bruna Designer", color: "#ec4899" },
    { id: "p3", name: "Carol Estética", color: "#10b981" },
];

// Kept for backward compatibility but should be replaced by ServiceRepository calls
export const MOCK_SERVICES = [
    { id: "s1", name: "Corte Feminino", duration: 60, price: 120 },
    { id: "s2", name: "Escova Modelada", duration: 45, price: 80 },
    { id: "s3", name: "Manicure", duration: 40, price: 45 },
    { id: "s4", name: "Pedicure", duration: 40, price: 50 },
    { id: "s5", name: "Coloração", duration: 90, price: 180 },
    { id: "s6", name: "Design de Sobrancelha", duration: 30, price: 40 },
];
