"use server";

import { FinalizeAppointment } from "@/core/usecases/appointments/FinalizeAppointment";
import { getAppointmentRepository, getProductRepository } from "@/infrastructure/repositories/factory";

export async function finalizeAppointment(input: {
    appointmentId: string;
    finalizedServices: Array<{
        serviceId: string;
        name: string;
        price: number;
        professionalId: string;
    }>;
    usedProducts: Array<{
        productId: string;
        name: string;
        price: number;
        cost: number;
        quantity: number;
    }>;
}) {
    const useCase = new FinalizeAppointment(
        getAppointmentRepository(),
        getProductRepository()
    );

    try {
        const result = await useCase.execute(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error finalizing appointment:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erro ao finalizar agendamento"
        };
    }
}
