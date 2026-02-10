
import { SaleRepository } from '@/core/repositories/SaleRepository';
import { StockMovementRepository } from '@/infrastructure/repositories/stock/StockMovementRepository';
import { RefundSaleDTO } from '@/core/domain/sales/types';

export const refundSaleUseCase = async (
    saleRepo: SaleRepository,
    stockRepo: StockMovementRepository,
    dto: RefundSaleDTO
): Promise<void> => {
    const sale = await saleRepo.findById(dto.saleId);
    if (!sale) throw new Error('Sale not found');

    if (sale.status !== 'paid') {
        throw new Error('Only paid sales can be refunded');
    }

    // 1. Update Status
    await saleRepo.update(dto.saleId, { status: 'refunded' as any });

    // 2. Create Stock Movements (IN) for Product items (Return to stock)
    if (sale.items) {
        for (const item of sale.items) {
            if (item.itemType === 'product' && item.productId) {
                await stockRepo.createMovement({
                    tenantId: sale.tenantId,
                    productId: item.productId,
                    type: 'in',
                    qty: item.qty,
                    reason: 'refund',
                    referenceType: 'sale',
                    referenceId: sale.id,
                    createdBy: dto.createdBy,
                });
            }
        }
    }
};
