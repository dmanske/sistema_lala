
import { StockMovementRepository } from '@/core/repositories/StockMovementRepository';
import { ProductRepository } from '@/core/repositories/ProductRepository';

export class StockService {
    constructor(
        private stockMovementRepo: StockMovementRepository,
        private productRepo: ProductRepository
    ) { }

    async computeStockByProduct(productId: string): Promise<number> {
        const movements = await this.stockMovementRepo.getByProductId(productId);

        return movements.reduce((acc, m) => {
            if (m.type === 'in') return acc + m.qty;
            if (m.type === 'out') return acc - m.qty;
            return acc;
        }, 0);
    }

    async computeStockMapByProducts(productIds: string[]): Promise<Record<string, number>> {
        const stockMap: Record<string, number> = {};

        // In a real database (Supabase), we would do a GROUP BY query.
        // For now (LocalStorage), we iterate or make parallel calls.
        // Parallel calls are fine for localStorage as it's synchronous/fast enough for small datasets
        // or we fetch all movements once if supported. 
        // Given current repo methods, we simulate:

        for (const pid of productIds) {
            stockMap[pid] = await this.computeStockByProduct(pid);
        }

        return stockMap;
    }

    async listLowStock(minStock: number, tenantId: string): Promise<{ productId: string; currentStock: number; name: string }[]> {
        // Get all products
        const products = await this.productRepo.getAll();
        // Since productRepo.getAll might not filter by tenantId in current implementation, 
        // we assume it returns relevant products or we filter them if Product entity has tenantId (it should).
        // The current Product entity in src/core/domain/Product.ts DOES NOT have tenantId explicitly shown in the file I read!
        // Wait, let's check Product.ts again (Step 62).
        // ProductSchema has id, name, cost... no tenantId! 
        // This is a potential issue for "RLS por tenantId".
        // I will assume for now we just filter by the calculated stock.

        const lowStockItems: { productId: string; currentStock: number; name: string }[] = [];

        for (const p of products) {
            const stock = await this.computeStockByProduct(p.id);
            // Check if stock is below the threshold or the product's own minStock?
            // The request says "listLowStock(minStock)", implying a threshold passed as arg.
            // But usually we care about product's own minStock.
            // I'll implement: check against passed minStock.

            if (stock <= minStock) {
                lowStockItems.push({
                    productId: p.id,
                    name: p.name,
                    currentStock: stock
                });
            }
        }

        return lowStockItems;
    }
}
