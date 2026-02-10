
import { Sale, SaleItem } from "@/core/domain/sales/types";
import { SaleRepository } from "@/core/repositories/SaleRepository";

export class UpdateSale {
    constructor(private saleRepo: SaleRepository) { }

    async execute(saleId: string, items: SaleItem[]): Promise<Sale> {
        const sale = await this.saleRepo.findById(saleId);
        if (!sale) throw new Error("Sale not found");

        if (sale.status === 'paid' || sale.status === 'refunded') {
            throw new Error("Cannot update finalized sale");
        }

        // Recalculate totals with safe defaults
        const subtotal = items.reduce((acc, item) => acc + ((item.unitPrice ?? 0) * (item.qty ?? 1)), 0);
        const total = subtotal - (sale.discount || 0);

        const updatedSale = {
            ...sale,
            items,
            subtotal,
            total
        };

        return this.saleRepo.update(saleId, updatedSale);
    }
}
