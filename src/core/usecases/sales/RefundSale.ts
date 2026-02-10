
import { Sale } from "@/core/domain/sales/types";
import { SaleRepository } from "@/core/repositories/SaleRepository";
import { ProductRepository } from "@/core/repositories/ProductRepository"; // Correct import path? It's ProductRepository.
// Let's check imports. PaySale used: import { ProductRepository } from "@/core/repositories/ProductRepository"; Correct.

export class RefundSale {
    constructor(
        private saleRepo: SaleRepository,
        private productRepo: ProductRepository
    ) { }

    async execute(input: {
        saleId: string,
        refundedBy: string
    }): Promise<Sale> {
        const sale = await this.saleRepo.findById(input.saleId);
        if (!sale) throw new Error("Sale not found");

        if (sale.status !== 'paid') {
            throw new Error("Only paid sales can be refunded");
        }

        // Revert Stock
        if (sale.items) {
            for (const item of sale.items) {
                if (item.itemType === 'product' && item.productId) {
                    await this.productRepo.addMovement({
                        productId: item.productId,
                        type: 'IN',
                        quantity: item.qty,
                        reason: `Reembolso Venda #${sale.id.slice(0, 8)}`,
                        referenceId: sale.id
                    });
                }
            }
        }

        // Update Sale Status
        // Note: We are keeping payments as is for record, but status changes.
        // Ideally we should record a refund transaction, but for MVP just status change + stock revert is enough.

        return this.saleRepo.update(sale.id, {
            status: 'refunded'
        });
    }
}
