
import { UpsertSaleItemsDTO, Sale } from '@/core/domain/sales/types';
import { SaleRepository } from '@/infrastructure/repositories/sales/SaleRepository';

export const upsertSaleItemsUseCase = async (
    repo: SaleRepository,
    dto: UpsertSaleItemsDTO
): Promise<Sale> => {
    // Future validation can be added here
    // e.g. checking if product exists or active
    return await repo.upsertItems(dto);
};
