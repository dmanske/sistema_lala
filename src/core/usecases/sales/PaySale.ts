
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
        payments: { method: PaymentMethod, amount: number, change?: number, bankAccountId: string }[],
        createdBy: string
    }): Promise<void> {
        const sale = await this.saleRepo.findById(input.saleId);
        if (!sale) throw new Error("Sale not found");

        if (sale.status === 'paid') {
            throw new Error("Sale already paid or refunded");
        }

        // Map domain stock items to repository format
        const stockItems = sale.items
            ?.filter(item => item.itemType === 'product' && item.productId)
            .map(item => ({
                productId: item.productId as string,
                qty: item.qty
            }));

        // Summarize Wallet deductions (Credit or Fiado)
        const walletDeduction = input.payments
            .filter(p => p.method === 'credit' || p.method === 'fiado')
            .reduce((acc, p) => acc + p.amount, 0);

        let creditDebit = undefined;
        if (walletDeduction > 0 && sale.customerId) {
            creditDebit = {
                clientId: sale.customerId,
                amount: walletDeduction
            };
        }

        await this.saleRepo.pay(
            sale.id,
            input.payments,
            stockItems,
            creditDebit,
            input.payments.find(p => p.change && p.change > 0)?.change || 0
        );
    }
}
