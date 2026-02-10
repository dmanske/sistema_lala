import { Purchase, CreatePurchaseInput } from "@/core/domain/Purchase";

export interface PurchaseRepository {
    getAll(filter?: { supplierId?: string; startDate?: string; endDate?: string }): Promise<Purchase[]>;
    getById(id: string): Promise<Purchase | null>;
    create(input: CreatePurchaseInput): Promise<Purchase>;
}
