
import { Sale, SaleItem } from "@/core/domain/sales/types";
import { SaleRepository } from "@/core/repositories/SaleRepository";
import { AppointmentRepository } from "@/core/repositories/AppointmentRepository";
import { ServiceRepository } from "@/core/repositories/ServiceRepository";

export class CreateSale {
    constructor(
        private saleRepo: SaleRepository,
        private appointmentRepo: AppointmentRepository,
        private serviceRepo: ServiceRepository
    ) { }

    async execute(input: {
        tenantId: string;
        appointmentId?: string;
        customerId?: string;
        createdBy: string;
    }): Promise<Sale> {
        let items: SaleItem[] = [];
        let subtotal = 0;
        let customerId = input.customerId;

        // If from appointment, check existence first
        // If create request comes for an appointment that already has a sale, return it
        if (input.appointmentId) {
            const existing = await this.saleRepo.findByAppointmentId(input.appointmentId);
            if (existing) {
                // Sanitize items from localStorage (may have undefined numeric fields from older schema)
                if (existing.items) {
                    existing.items = existing.items.map((item: SaleItem) => ({
                        ...item,
                        unitPrice: item.unitPrice ?? 0,
                        qty: item.qty ?? 1,
                        totalPrice: item.totalPrice ?? ((item.unitPrice ?? 0) * (item.qty ?? 1)),
                    }));
                }
                // Recalculate totals
                const subtotal = (existing.items ?? []).reduce((acc: number, item: SaleItem) => acc + (item.unitPrice * item.qty), 0);
                existing.subtotal = subtotal;
                existing.total = subtotal - (existing.discount || 0);
                return existing;
            }

            const appointment = await this.appointmentRepo.getById(input.appointmentId);
            if (!appointment) {
                // If not found, throw error
                throw new Error("Appointment not found");
            }

            customerId = appointment.clientId;

            // Map services to sale items
            if (appointment.services && appointment.services.length > 0) {
                for (const sId of appointment.services) {
                    const service = await this.serviceRepo.getById(sId);
                    if (service) {
                        const price = service.price || 0;
                        items.push({
                            id: crypto.randomUUID(),
                            saleId: '', // Filled below
                            itemType: 'service',
                            name: service.name,
                            serviceId: service.id,
                            qty: 1,
                            unitPrice: price,
                            totalPrice: price
                        });
                        subtotal += price;
                    }
                }
            }
        }

        const saleId = crypto.randomUUID();
        const sale: Sale = {
            id: saleId,
            tenantId: input.tenantId,
            customerId: customerId,
            appointmentId: input.appointmentId,
            status: 'draft',
            subtotal,
            discount: 0,
            total: subtotal,
            createdAt: new Date().toISOString(),
            createdBy: input.createdBy,
            items: items.map(i => ({ ...i, saleId })),
            payments: []
        };

        return this.saleRepo.create(sale);
    }
}
