import { Product, CreateProductInput, ProductMovement, CreateProductMovementInput } from "@/core/domain/Product";

export interface ProductRepository {
    getAll(filter?: { search?: string; lowStock?: boolean }): Promise<Product[]>;
    getById(id: string): Promise<Product | null>;
    create(input: CreateProductInput): Promise<Product>;
    update(id: string, input: Partial<Product>): Promise<Product>;
    delete(id: string): Promise<boolean>;

    // Stock Movement
    addMovement(movement: CreateProductMovementInput): Promise<ProductMovement>;
    getMovements(productId: string): Promise<ProductMovement[]>;
}
