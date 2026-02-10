
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

        // 3. Update items and recalculate totals
        const items = data.items.map(item => ({
            ...item,
            saleId: data.saleId,
            totalPrice: item.qty * item.unitPrice
        }));

        const subtotal = items.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);
        const total = subtotal - (sale.discount || 0);

        return this.saleRepo.update(data.saleId, {
            items: items as any, // Cast to any to bypass complex mapping for now if needed, but SaleItem[] is better
            subtotal,
            total
        });
    }
}
