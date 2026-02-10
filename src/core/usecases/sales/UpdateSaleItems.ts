
import { UpsertSaleItemsDTO, Sale } from '@/core/domain/sales/types';
import { SaleRepository } from '@/core/repositories/SaleRepository';

export class UpdateSaleItems {
    constructor(private saleRepo: SaleRepository) { }

    async execute(data: UpsertSaleItemsDTO): Promise<Sale> {
        // 1. Fetch current sale state
        const sale = await this.saleRepo.findById(data.saleId);
        if (!sale) throw new Error('Sale not found');

        // 2. Validate current status
        if (sale.status === 'paid' || sale.status === 'refunded' || sale.status === 'canceled') {
            throw new Error(`Cannot update items for sale with status ${sale.status}`);
        }

        // 3. Update items (using existing repo method, which recalculates totals)
        return this.saleRepo.upsertItems(data);
    }
}
