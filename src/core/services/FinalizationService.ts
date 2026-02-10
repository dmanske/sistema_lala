import { AppointmentRepository } from "@/core/repositories/AppointmentRepository";
import { ProductRepository } from "@/core/repositories/ProductRepository";
import { Appointment } from "@/core/domain/Appointment";
import { Product } from "@/core/domain/Product";

export interface FinalizeInput {
    services: {
        serviceId: string;
        name: string;
        price: number;
        professionalId: string;
    }[];
    products: {
        productId: string;
        name: string;
        price: number;
        cost: number;
        quantity: number;
    }[];
}

export class FinalizationService {
    constructor(
        private appointmentRepo: AppointmentRepository,
        private productRepo: ProductRepository
    ) { }

    async finalize(appointmentId: string, input: FinalizeInput): Promise<Appointment> {
        const appointment = await this.appointmentRepo.getById(appointmentId);
        if (!appointment) throw new Error("Agendamento não encontrado");

        if (appointment.status === 'DONE') throw new Error("Agendamento já finalizado");

        // 1. Calculate Totals
        const totalService = input.services.reduce((acc, s) => acc + s.price, 0);
        const totalProduct = input.products.reduce((acc, p) => acc + (p.price * p.quantity), 0);
        const totalValue = totalService + totalProduct;

        // 2. Process Stock Movements (OUT)
        for (const p of input.products) {
            await this.productRepo.addMovement({
                productId: p.productId,
                type: 'OUT',
                quantity: p.quantity,
                reason: `Atendimento ${appointmentId} - Finalização`,
                referenceId: appointmentId
            });
        }

        // 3. Update Appointment
        const updatedAppointment: Partial<Appointment> = {
            status: 'DONE',
            finalizedAt: new Date().toISOString(),
            finalizedServices: input.services,
            usedProducts: input.products,
            totalServiceValue: totalService,
            totalProductValue: totalProduct,
            totalValue: totalValue
        };

        return this.appointmentRepo.update(appointmentId, updatedAppointment);
    }
}
