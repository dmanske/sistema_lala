
import { UpsertSaleItemsDTO, Sale, SaleItem } from '@/core/domain/sales/types';
import { SaleRepository } from '@/core/repositories/SaleRepository';

export const upsertSaleItemsUseCase = async (
    repo: SaleRepository,
    dto: UpsertSaleItemsDTO
): Promise<Sale> => {
    const sale = await repo.findById(dto.saleId);
    if (!sale) throw new Error('Sale not found');

    // Enrich items with saleId and computed totalPrice
    const enrichedItems: SaleItem[] = dto.items.map(item => ({
        ...item,
        saleId: dto.saleId,
        totalPrice: item.unitPrice * item.qty,
    }));

    const updatedSale = await repo.update(dto.saleId, {
        items: enrichedItems,
    });

    return updatedSale;
};
