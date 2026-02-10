import { CreatePurchaseInput, Purchase } from "@/core/domain/Purchase";
import { ProductRepository } from "@/core/repositories/ProductRepository";
import { PurchaseRepository } from "@/core/repositories/PurchaseRepository";

export class CreatePurchase {
    constructor(
        private purchaseRepo: PurchaseRepository,
        private productRepo: ProductRepository
    ) { }

    async execute(input: CreatePurchaseInput): Promise<Purchase> {
        // 1. Create Purchase Record
        const purchase = await this.purchaseRepo.create(input);

        // 2. Generate Stock Movements for each item
        if (purchase.items && purchase.items.length > 0) {
            for (const item of purchase.items) {
                await this.productRepo.addMovement({
                    productId: item.productId,
                    type: 'IN',
                    quantity: item.quantity,
                    reason: `Compra #${purchase.id.slice(0, 8)}`,
                    referenceId: purchase.id,
                    referenceType: 'PURCHASE',
                    unitCost: item.unitCost,
                    supplierId: purchase.supplierId,
                    date: new Date().toISOString() // Recording movement at creation time
                });
            }
        }

        return purchase;
    }
}
