
import { z } from 'zod';
import { stockMovementSchema } from './schemas';

export type StockMovementType = 'in' | 'out';
export type StockMovementReason = 'sale' | 'refund' | 'adjust' | 'initial';
export type StockReferenceType = 'sale';

export type StockMovement = z.infer<typeof stockMovementSchema>;

export interface CreateStockMovementDTO {
    tenantId: string;
    productId: string;
    type: StockMovementType;
    qty: number; // positive number
    reason: StockMovementReason;
    referenceType?: StockReferenceType;
    referenceId?: string; // e.g. saleId
    createdBy: string;
}
