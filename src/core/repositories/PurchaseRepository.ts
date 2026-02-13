import { Purchase, CreatePurchaseInput, UpdatePurchaseInput } from "@/core/domain/Purchase";

export interface PurchaseRepository {
    getAll(filter?: { supplierId?: string; startDate?: string; endDate?: string; paymentStatus?: string }): Promise<Purchase[]>;
    getById(id: string): Promise<Purchase | null>;
    create(input: CreatePurchaseInput): Promise<Purchase>;
    update(id: string, input: UpdatePurchaseInput): Promise<Purchase>;
    delete(id: string): Promise<void>;
}
