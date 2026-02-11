
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
    }): Promise<void> {
        const sale = await this.saleRepo.findById(input.saleId);
        if (!sale) throw new Error("Sale not found");

        if (sale.status !== 'paid') {
            throw new Error("Only paid sales can be refunded");
        }

        // Atomic refund via repository (calls RPC)
        await this.saleRepo.refund(sale.id);
    }
}
