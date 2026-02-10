
import { Sale } from "@/core/domain/sales/types";
import { SaleRepository } from "@/core/repositories/SaleRepository";

export class GetSale {
    constructor(private saleRepo: SaleRepository) { }

    async execute(id: string): Promise<Sale | null> {
        return this.saleRepo.findById(id);
    }
}
