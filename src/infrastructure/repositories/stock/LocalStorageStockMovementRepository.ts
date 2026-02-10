
import { StockMovement, CreateStockMovementDTO, StockReferenceType } from '@/core/domain/stock/types';
import { StockMovementRepository } from './StockMovementRepository';

const STOCK_KEY = 'lala_stock_movements';

export class LocalStorageStockMovementRepository implements StockMovementRepository {
    private getMovements(): StockMovement[] {
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem(STOCK_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    private saveMovements(movements: StockMovement[]): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STOCK_KEY, JSON.stringify(movements));
        }
    }

    async createMovement(data: CreateStockMovementDTO): Promise<StockMovement> {
        const movements = this.getMovements();
        const newMovement: StockMovement = {
            id: crypto.randomUUID(),
            tenantId: data.tenantId,
            productId: data.productId,
            type: data.type,
            qty: data.qty,
            reason: data.reason,
            referenceType: data.referenceType,
            referenceId: data.referenceId,
            createdAt: new Date().toISOString(),
            createdBy: data.createdBy,
        };
        movements.push(newMovement);
        this.saveMovements(movements);
        return newMovement;
    }

    async listByProduct(productId: string): Promise<StockMovement[]> {
        return this.getMovements()
            .filter((m) => m.productId === productId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    async listByReference(referenceType: StockReferenceType, referenceId: string): Promise<StockMovement[]> {
        return this.getMovements().filter(
            (m) => m.referenceType === referenceType && m.referenceId === referenceId
        );
    }

    async computeStockByProduct(productId: string): Promise<number> {
        const movements = await this.listByProduct(productId);
        return movements.reduce((acc, m) => {
            if (m.type === 'in') return acc + m.qty;
            if (m.type === 'out') return acc - m.qty;
            return acc;
        }, 0);
    }
}
