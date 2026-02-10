import { PurchaseRepository } from '@/core/repositories/PurchaseRepository';
import { SupplierRepository } from '@/core/repositories/SupplierRepository';

export class DeleteSupplier {
    constructor(
        private supplierRepo: SupplierRepository,
        private purchaseRepo: PurchaseRepository
    ) { }

    async execute(id: string): Promise<boolean> {
        // Check existance
        const supplier = await this.supplierRepo.getById(id);
        if (!supplier) throw new Error("Fornecedor não encontrado");

        // Check constraints
        const purchases = await this.purchaseRepo.getAll({ supplierId: id });
        if (purchases.length > 0) {
            throw new Error("Não é possível excluir fornecedor com compras vinculadas. Sugestão: Inativar.");
        }

        return this.supplierRepo.delete(id);
    }
}
