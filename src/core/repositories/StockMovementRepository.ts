
import { StockMovement, CreateStockMovementDTO } from '@/core/domain/stock/types';

export interface StockMovementRepository {
    create(data: CreateStockMovementDTO): Promise<StockMovement>;
    getByProductId(productId: string): Promise<StockMovement[]>;
    getByReference(referenceId: string): Promise<StockMovement[]>;
    getAll(tenantId: string): Promise<StockMovement[]>;
}
