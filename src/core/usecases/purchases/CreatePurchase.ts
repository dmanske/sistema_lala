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
                    reason: 'Compra',
                    referenceId: purchase.id,
                    referenceType: 'PURCHASE',
                    unitCost: item.unitCost,
                    supplierId: purchase.supplierId,
                });
            }
        }

        return purchase;
    }
}
