import { Supplier, CreateSupplierInput } from "@/core/domain/Supplier";

export interface SupplierRepository {
    getAll(filter?: { search?: string; status?: string }): Promise<Supplier[]>;
    getById(id: string): Promise<Supplier | null>;
    create(input: CreateSupplierInput): Promise<Supplier>;
    update(id: string, input: Partial<Supplier>): Promise<Supplier>;
    delete(id: string): Promise<boolean>;
}
