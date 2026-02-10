
import { Sale } from "@/core/domain/sales/types";
import { SaleRepository } from "@/core/repositories/SaleRepository";

export class ListSales {
    constructor(private saleRepo: SaleRepository) { }

    async execute(tenantId?: string): Promise<Sale[]> {
        return this.saleRepo.findAll(tenantId);
    }

    async byCustomer(customerId: string): Promise<Sale[]> {
        return this.saleRepo.findByCustomerId(customerId);
    }
}
