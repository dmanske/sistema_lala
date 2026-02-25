import { Appointment } from "@/core/domain/Appointment";
import { AppointmentRepository } from "@/core/repositories/AppointmentRepository";
import { ProductRepository } from "@/core/repositories/ProductRepository";

export interface FinalizedService {
    serviceId: string;
    name: string;
    price: number;
    professionalId: string;
}

export interface UsedProduct {
    productId: string;
    name: string;
    price: number;
    cost: number;
    quantity: number;
}

export interface FinalizeAppointmentInput {
    appointmentId: string;
    finalizedServices: FinalizedService[];
    usedProducts: UsedProduct[];
}

export class FinalizeAppointment {
    constructor(
        private appointmentRepository: AppointmentRepository,
        private productRepository: ProductRepository
    ) {}

    async execute(input: FinalizeAppointmentInput): Promise<Appointment> {
        // Get appointment
        const appointment = await this.appointmentRepository.getById(input.appointmentId);
        if (!appointment) {
            throw new Error("Agendamento não encontrado");
        }

        // Validate status
        if (appointment.status === "DONE") {
            throw new Error("Agendamento já foi finalizado");
        }

        if (appointment.status === "CANCELED" || appointment.status === "NO_SHOW") {
            throw new Error("Não é possível finalizar um agendamento cancelado ou com falta");
        }

        // Calculate totals
        const totalServiceValue = input.finalizedServices.reduce((sum, s) => sum + s.price, 0);
        const totalProductValue = input.usedProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
        const totalValue = totalServiceValue + totalProductValue;

        // Update product stock
        for (const product of input.usedProducts) {
            const currentProduct = await this.productRepository.getById(product.productId);
            if (!currentProduct) {
                throw new Error(`Produto ${product.name} não encontrado`);
            }

            const newStock = currentProduct.currentStock - product.quantity;
            if (newStock < 0) {
                throw new Error(`Estoque insuficiente para o produto ${product.name}`);
            }

            await this.productRepository.update(product.productId, {
                currentStock: newStock
            });
        }

        // Update appointment
        const updated = await this.appointmentRepository.update(input.appointmentId, {
            status: "DONE",
            finalizedAt: new Date().toISOString(),
            finalizedServices: input.finalizedServices,
            usedProducts: input.usedProducts,
            totalServiceValue,
            totalProductValue,
            totalValue
        });

        return updated;
    }
}
