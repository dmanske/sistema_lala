import { Supplier, CreateSupplierInput } from '@/core/domain/Supplier';
import { SupplierRepository } from '@/core/repositories/SupplierRepository';

const STORAGE_KEY = 'salon_suppliers';

export class LocalStorageSupplierRepository implements SupplierRepository {
    private getSuppliers(): Supplier[] {
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        return JSON.parse(stored);
    }

    private saveSuppliers(suppliers: Supplier[]): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(suppliers));
        }
    }

    async getAll(filter?: { search?: string; status?: string }): Promise<Supplier[]> {
        let suppliers = this.getSuppliers();

        if (filter?.status && filter.status !== 'ALL') {
            suppliers = suppliers.filter((s) => s.status === filter.status);
        }

        if (filter?.search) {
            const searchLower = filter.search.toLowerCase();
            suppliers = suppliers.filter(
                (s) =>
                    s.name.toLowerCase().includes(searchLower) ||
                    (s.email && s.email.toLowerCase().includes(searchLower)) ||
                    (s.cnpj && s.cnpj.includes(searchLower))
            );
        }

        return suppliers.sort((a, b) => a.name.localeCompare(b.name));
    }

    async getById(id: string): Promise<Supplier | null> {
        return this.getSuppliers().find((s) => s.id === id) || null;
    }

    async create(input: CreateSupplierInput): Promise<Supplier> {
        const suppliers = this.getSuppliers();
        const newSupplier: Supplier = {
            ...input,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            status: input.status || 'ACTIVE'
        };
        suppliers.push(newSupplier);
        this.saveSuppliers(suppliers);
        return newSupplier;
    }

    async update(id: string, input: Partial<Supplier>): Promise<Supplier> {
        const suppliers = this.getSuppliers();
        const index = suppliers.findIndex((s) => s.id === id);
        if (index === -1) throw new Error('Supplier not found');

        const current = suppliers[index];
        const updated = { ...current, ...input, updatedAt: new Date().toISOString() };

        suppliers[index] = updated;
        this.saveSuppliers(suppliers);
        return updated;
    }

    async delete(id: string): Promise<boolean> {
        const suppliers = this.getSuppliers();
        const filtered = suppliers.filter((s) => s.id !== id);
        if (filtered.length === suppliers.length) return false;

        this.saveSuppliers(filtered);
        return true;
    }
}
