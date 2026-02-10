import { Product, CreateProductInput, ProductMovement, CreateProductMovementInput } from '@/core/domain/Product';
import { ProductRepository } from '@/core/repositories/ProductRepository';

const PRODUCTS_KEY = 'salon_products';
const MOVEMENTS_KEY = 'salon_product_movements';

// Mock Data
const MOCK_PRODUCTS: Product[] = [
    {
        id: "p1", name: "Shampoo Premium 5L", cost: 150, profitAmount: 0, profitPercentage: 0, price: 0, commission: 0,
        currentStock: 2, minStock: 1, createdAt: new Date().toISOString()
    },
    {
        id: "p2", name: "Esmalte Vermelho", cost: 10, profitAmount: 0, profitPercentage: 0, price: 0, commission: 0,
        currentStock: 15, minStock: 5, createdAt: new Date().toISOString()
    },
    {
        id: "p3", name: "Creme Hidratante (Venda)", cost: 30, profitAmount: 20, profitPercentage: 66, price: 50, commission: 5,
        currentStock: 10, minStock: 2, createdAt: new Date().toISOString()
    }
];

export class LocalStorageProductRepository implements ProductRepository {
    private getProducts(): Product[] {
        if (typeof window === 'undefined') return MOCK_PRODUCTS;
        const stored = localStorage.getItem(PRODUCTS_KEY);
        if (!stored) {
            localStorage.setItem(PRODUCTS_KEY, JSON.stringify(MOCK_PRODUCTS));
            return [...MOCK_PRODUCTS];
        }
        return JSON.parse(stored);
    }

    private saveProducts(products: Product[]): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
        }
    }

    private getMovementsRaw(): ProductMovement[] {
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem(MOVEMENTS_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    private saveMovementsRaw(movements: ProductMovement[]): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(MOVEMENTS_KEY, JSON.stringify(movements));
        }
    }

    async getAll(filter?: { search?: string; lowStock?: boolean }): Promise<Product[]> {
        let products = this.getProducts();

        if (filter?.search) {
            const s = filter.search.toLowerCase();
            products = products.filter(p => p.name.toLowerCase().includes(s));
        }

        if (filter?.lowStock) {
            products = products.filter(p => p.currentStock <= p.minStock);
        }

        return products.sort((a, b) => a.name.localeCompare(b.name));
    }

    async getById(id: string): Promise<Product | null> {
        return this.getProducts().find(p => p.id === id) || null;
    }

    async create(input: CreateProductInput): Promise<Product> {
        const products = this.getProducts();
        const newProduct: Product = {
            ...input,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            currentStock: 0, // Starts at 0, use movement to add stock
            netValue: input.price - (input.cost || 0) - (input.commission || 0)
        };
        products.push(newProduct);
        this.saveProducts(products);
        return newProduct;
    }

    async update(id: string, input: Partial<Product>): Promise<Product> {
        const products = this.getProducts();
        const idx = products.findIndex(p => p.id === id);
        if (idx === -1) throw new Error("Product not found");

        const current = products[idx];
        const updated = { ...current, ...input, updatedAt: new Date().toISOString() };

        if (input.price !== undefined || input.cost !== undefined || input.commission !== undefined) {
            const p = input.price ?? current.price;
            const c = input.cost ?? current.cost;
            const com = input.commission ?? current.commission;
            updated.netValue = p - c - com;
        }

        products[idx] = updated;
        this.saveProducts(products);
        return updated;
    }

    async delete(id: string): Promise<boolean> {
        const products = this.getProducts();
        const filtered = products.filter(p => p.id !== id);
        if (filtered.length === products.length) return false;
        this.saveProducts(filtered);
        return true;
    }

    // --- Movements ---

    async addMovement(input: CreateProductMovementInput): Promise<ProductMovement> {
        const movements = this.getMovementsRaw();
        const movement: ProductMovement = {
            ...input,
            id: crypto.randomUUID(),
            date: new Date().toISOString()
        };
        movements.push(movement);
        this.saveMovementsRaw(movements);

        // Update Product Stock
        await this.updateStock(input.productId, input.type, input.quantity);

        return movement;
    }

    async getMovements(productId: string): Promise<ProductMovement[]> {
        return this.getMovementsRaw()
            .filter(m => m.productId === productId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    private async updateStock(productId: string, type: 'IN' | 'OUT', quantity: number): Promise<void> {
        const products = this.getProducts();
        const idx = products.findIndex(p => p.id === productId);
        if (idx === -1) return; // Should technically throw, but let's be safe

        const product = products[idx];
        let newStock = product.currentStock;

        if (type === 'IN') newStock += quantity;
        else newStock -= quantity;

        // Prevent negative?? Or allow? Usually physical stock allows correction later.
        // But logic says stock updates on finalization. If stock < 0, maybe warn but allow or block?
        // Basic requirement: "Estoque só baixa após FINALIZAÇÃO".
        // I'll allow negative for now (business decision needed), but generally better to allow and show alert.

        product.currentStock = newStock;
        product.lastMovement = new Date().toISOString();

        products[idx] = product;
        this.saveProducts(products);
    }
}
