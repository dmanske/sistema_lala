
import { Sale, SalePayment, SaleStatus, PaymentMethod } from "@/core/domain/sales/types";
import { SaleRepository } from "@/core/repositories/SaleRepository";
import { ProductRepository } from "@/core/repositories/ProductRepository";
import { AppointmentRepository } from "@/core/repositories/AppointmentRepository";

export class PaySale {
    constructor(
        private saleRepo: SaleRepository,
        private productRepo: ProductRepository,
        private appointmentRepo: AppointmentRepository
    ) { }

    async execute(input: {
        saleId: string,
        method: PaymentMethod,
        amount: number,
        paidAt: Date,
        createdBy: string
    }): Promise<Sale> {
        const sale = await this.saleRepo.findById(input.saleId);
        if (!sale) throw new Error("Sale not found");

        if (sale.status === 'paid' || sale.status === 'refunded') {
            throw new Error("Sale already paid or refunded");
        }

        const payment: SalePayment = {
            id: crypto.randomUUID(),
            saleId: sale.id,
            method: input.method,
            amount: input.amount,
            paidAt: input.paidAt.toISOString()
        };

        const updatedPayments = [...(sale.payments || []), payment];
        const totalPaid = updatedPayments.reduce((acc, p) => acc + p.amount, 0);

        // Check if fully paid
        let newStatus: SaleStatus = sale.status;
        if (totalPaid >= sale.total - 0.01) { // Floating point tolerance
            newStatus = 'paid';

            // Deduct Stock for products only
            if (sale.items) {
                for (const item of sale.items) {
                    if (item.itemType === 'product' && item.productId) {
                        // We don't wait for individual stock updates to block, but for consistency we should await
                        await this.productRepo.addMovement({
                            productId: item.productId,
                            type: 'OUT',
                            quantity: item.qty,
                            reason: `Sale ${sale.id}`,
                            referenceId: sale.id
                        });
                    }
                }
            }

            // Update Appointment Status if linked
            if (sale.appointmentId) {
                // Fetch appointment to ensure it exists
                const appt = await this.appointmentRepo.getById(sale.appointmentId);
                if (appt) {
                    await this.appointmentRepo.update(sale.appointmentId, {
                        ...appt, // Must pass full object if required, or partial if supported. 
                        // AppointmentRepository usually takes Partial. Check repo.
                        status: 'DONE',
                        finalizedAt: new Date().toISOString()
                    });
                }
            }
        } else {
            newStatus = 'pending_payment';
        }

        return this.saleRepo.update(sale.id, {
            status: newStatus,
            payments: updatedPayments
        });
    }
}
