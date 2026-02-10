
import { StockMovement, CreateStockMovementDTO, StockReferenceType } from '@/core/domain/stock/types';

export interface StockMovementRepository {
    createMovement(data: CreateStockMovementDTO): Promise<StockMovement>;
    listByProduct(productId: string): Promise<StockMovement[]>;
    listByReference(referenceType: StockReferenceType, referenceId: string): Promise<StockMovement[]>;
    computeStockByProduct(productId: string): Promise<number>;
}
