
import { Sale, SalePayment, SaleStatus, PaymentMethod } from "@/core/domain/sales/types";
import { SaleRepository } from "@/core/repositories/SaleRepository";
import { ProductRepository } from "@/core/repositories/ProductRepository";
import { AppointmentRepository } from "@/core/repositories/AppointmentRepository";
import { CreditRepository } from "@/core/repositories/CreditRepository";

export class PaySale {
    constructor(
        private saleRepo: SaleRepository,
        private productRepo: ProductRepository,
        private appointmentRepo: AppointmentRepository,
        private creditRepo: CreditRepository
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

        // NOVO: Abater dívida automaticamente se houver pagamento excedente
        if (sale.customerId) {
            // Calcular total pago (excluindo crédito e fiado que já foram processados)
            const cashPayments = input.payments.filter(p => p.method !== 'credit' && p.method !== 'fiado');
            const totalPaid = cashPayments.reduce((acc, p) => acc + p.amount, 0);

            // Calcular excedente (pagamento - valor da venda)
            const excess = totalPaid - (sale.total || 0);

            if (excess > 0) {
                // Verificar se o cliente tem dívida
                const movements = await this.creditRepo.getByClientId(sale.customerId);
                const currentBalance = movements.reduce((acc, m) => {
                    return m.type === 'CREDIT' ? acc + m.amount : acc - m.amount;
                }, 0);

                // Se tem dívida (saldo negativo), criar crédito para abater
                if (currentBalance < 0) {
                    const debtAmount = Math.abs(currentBalance);
                    const creditAmount = Math.min(excess, debtAmount);

                    // Usar a conta bancária do primeiro pagamento em dinheiro
                    const bankAccountId = cashPayments[0]?.bankAccountId;

                    await this.creditRepo.create({
                        id: crypto.randomUUID(),
                        clientId: sale.customerId,
                        type: 'CREDIT',
                        amount: creditAmount,
                        origin: 'CASH',
                        note: `Pagamento excedente aplicado na dívida (R$ ${creditAmount.toFixed(2)})`,
                        createdAt: new Date().toISOString(),
                        bankAccountId
                    });
                }
            }
        }
    }
}
