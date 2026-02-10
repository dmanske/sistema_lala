
import { SaleItem } from '@/core/domain/sales/types';
import { SaleRepository } from '@/core/repositories/SaleRepository';

export interface ProductHistoryItem {
    id: string; // saleItem.id
    saleId: string;
    productName?: string; // Could be enriched if we had a product catalog repo here
    qty: number;
    totalPrice: number;
    date: string;
    origin: 'appointment' | 'single_sale';
}

export const getCustomerProductHistoryUseCase = async (
    repo: SaleRepository,
    customerId: string
): Promise<ProductHistoryItem[]> => {
    // Get all items
    // Since listItemsByCustomer might be basic, we might need to fetch sales to know origin
    const sales = await repo.findByCustomerId(customerId);

    const history: ProductHistoryItem[] = [];

    for (const sale of sales) {
        if (!sale.items || sale.status === 'canceled' || sale.status === 'refunded') continue;

        for (const item of sale.items) {
            if (item.itemType === 'product') {
                history.push({
                    id: item.id,
                    saleId: sale.id,
                    qty: item.qty,
                    totalPrice: item.totalPrice,
                    date: sale.createdAt,
                    origin: sale.appointmentId ? 'appointment' : 'single_sale',
                });
            }
        }
    }

    // Sort by date desc
    return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};
