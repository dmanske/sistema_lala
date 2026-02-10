import { Product, CreateProductInput, ProductMovement, CreateProductMovementInput } from '@/core/domain/Product';
import { ProductRepository } from '@/core/repositories/ProductRepository';

const PRODUCTS_KEY = 'salon_products';
const MOVEMENTS_KEY = 'salon_product_movements';

export class LocalStorageProductRepository implements ProductRepository {
    private getProductsRaw(): Product[] {
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem(PRODUCTS_KEY);
        if (!stored) return [];
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

    /**
     * Computa o estoque atual de um produto baseado EXCLUSIVAMENTE nas movimentações.
     * IN = soma, OUT = subtrai. Estoque é SEMPRE o resultado desta função.
     */
    computeStock(productId: string): number {
        const movements = this.getMovementsRaw().filter(m => m.productId === productId);
        return movements.reduce((acc, m) => {
            if (m.type === 'IN') return acc + m.quantity;
            if (m.type === 'OUT') return acc - m.quantity;
            return acc;
        }, 0);
    }

    /**
     * Retorna produto com currentStock computado das movimentações.
     */
    private enrichProduct(product: Product): Product {
        return {
            ...product,
            currentStock: this.computeStock(product.id),
        };
    }

    async getAll(filter?: { search?: string; lowStock?: boolean }): Promise<Product[]> {
        let products = this.getProductsRaw().map(p => this.enrichProduct(p));

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
        const product = this.getProductsRaw().find(p => p.id === id);
        if (!product) return null;
        return this.enrichProduct(product);
    }

    /**
     * Cria um produto. Se initialStock > 0, gera automaticamente uma movimentação IN "Estoque Inicial".
     */
    async create(input: CreateProductInput & { initialStock?: number }): Promise<Product> {
        const products = this.getProductsRaw();
        const newProduct: Product = {
            ...input,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            currentStock: 0, // Será computado das movimentações
            netValue: input.price - (input.cost || 0) - (input.commission || 0)
        };
        products.push(newProduct);
        this.saveProducts(products);

        // Se tem estoque inicial, criar movimentação IN automática
        const initialStock = (input as any).initialStock;
        if (initialStock && initialStock > 0) {
            await this.addMovement({
                productId: newProduct.id,
                type: 'IN',
                quantity: initialStock,
                reason: 'Estoque Inicial',
            });
        }

        return this.enrichProduct(newProduct);
    }

    async update(id: string, input: Partial<Product>): Promise<Product> {
        const products = this.getProductsRaw();
        const idx = products.findIndex(p => p.id === id);
        if (idx === -1) throw new Error("Product not found");

        const current = products[idx];
        // Não permitir atualizar currentStock diretamente
        const { currentStock, ...safeInput } = input;
        const updated = { ...current, ...safeInput, updatedAt: new Date().toISOString() };

        if (input.price !== undefined || input.cost !== undefined || input.commission !== undefined) {
            const p = input.price ?? current.price;
            const c = input.cost ?? current.cost;
            const com = input.commission ?? current.commission;
            updated.netValue = p - c - com;
        }

        products[idx] = updated;
        this.saveProducts(products);
        return this.enrichProduct(updated);
    }

    async delete(id: string): Promise<boolean> {
        const products = this.getProductsRaw();
        const filtered = products.filter(p => p.id !== id);
        if (filtered.length === products.length) return false;
        this.saveProducts(filtered);
        // Também limpar movimentações do produto excluído
        const movements = this.getMovementsRaw().filter(m => m.productId !== id);
        this.saveMovementsRaw(movements);
        return true;
    }

    // --- Movements ---

    /**
     * Adiciona uma movimentação de estoque.
     * O estoque do produto será atualizado automaticamente via computeStock().
     * Não há mais atualização direta do campo currentStock no produto.
     */
    async addMovement(input: CreateProductMovementInput): Promise<ProductMovement> {
        const movements = this.getMovementsRaw();
        const movement: ProductMovement = {
            ...input,
            id: crypto.randomUUID(),
            date: new Date().toISOString()
        };
        movements.push(movement);
        this.saveMovementsRaw(movements);

        // Atualizar lastMovement no produto (apenas metadado, não o estoque)
        const products = this.getProductsRaw();
        const idx = products.findIndex(p => p.id === input.productId);
        if (idx !== -1) {
            products[idx].lastMovement = new Date().toISOString();
            this.saveProducts(products);
        }

        return movement;
    }

    async getMovements(productId: string): Promise<ProductMovement[]> {
        return this.getMovementsRaw()
            .filter(m => m.productId === productId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
}
