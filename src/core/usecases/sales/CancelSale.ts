
import { Sale } from '@/core/domain/sales/types';
import { SaleRepository } from '@/core/repositories/SaleRepository';

export class CancelSale {
    constructor(private saleRepo: SaleRepository) { }

    async execute(saleId: string): Promise<Sale> {
        const sale = await this.saleRepo.findById(saleId);
        if (!sale) throw new Error('Sale not found');

        if (sale.status === 'paid' || sale.status === 'refunded') {
            throw new Error('Cannot cancel processed sale. Use Refund instead.');
        }

        return this.saleRepo.cancel(saleId);
    }
}
