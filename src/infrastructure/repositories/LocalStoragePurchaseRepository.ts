import { Purchase, CreatePurchaseInput, UpdatePurchaseInput, PurchaseItem } from "@/core/domain/Purchase";
import { PurchaseRepository } from "@/core/repositories/PurchaseRepository";

const STORAGE_KEY = 'salon_purchases';

export class LocalStoragePurchaseRepository implements PurchaseRepository {
    private getPurchases(): Purchase[] {
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        return JSON.parse(stored);
    }

    private savePurchases(purchases: Purchase[]): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(purchases));
        }
    }

    async getAll(filter?: { supplierId?: string; startDate?: string; endDate?: string }): Promise<Purchase[]> {
        let items = this.getPurchases();

        if (filter?.supplierId) {
            items = items.filter(p => p.supplierId === filter.supplierId);
        }

        if (filter?.startDate) {
            items = items.filter(p => p.date >= filter.startDate!);
        }

        if (filter?.endDate) {
            items = items.filter(p => p.date <= filter.endDate!);
        }

        return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    async getById(id: string): Promise<Purchase | null> {
        return this.getPurchases().find(p => p.id === id) || null;
    }

    async create(input: CreatePurchaseInput): Promise<Purchase> {
        const purchases = this.getPurchases();

        const purchaseId = crypto.randomUUID();

        // Calculate items
        let grandTotal = 0;
        const purchaseItems: PurchaseItem[] = input.items.map(itemInput => {
            const lineTotal = itemInput.quantity * itemInput.unitCost;
            grandTotal += lineTotal;
            return {
                ...itemInput,
                id: crypto.randomUUID(),
                purchaseId: purchaseId,
                lineTotal
            };
        });

        const newPurchase: Purchase = {
            id: purchaseId,
            supplierId: input.supplierId,
            date: input.date || new Date().toISOString().split('T')[0],
            notes: input.notes,
            total: grandTotal,
            items: purchaseItems,
            paymentStatus: 'PENDING',
            createdAt: new Date().toISOString()
        };

        purchases.push(newPurchase);
        this.savePurchases(purchases);
        return newPurchase;
    }

    async update(id: string, input: UpdatePurchaseInput): Promise<Purchase> {
        const purchases = this.getPurchases();
        const index = purchases.findIndex(p => p.id === id);
        
        if (index === -1) {
            throw new Error('Purchase not found');
        }

        const existingPurchase = purchases[index];

        // Check if has payments
        if (existingPurchase.payments && existingPurchase.payments.length > 0) {
            throw new Error('Cannot update purchase with existing payments. Delete payments first.');
        }

        // Calculate new items
        let grandTotal = 0;
        const purchaseItems: PurchaseItem[] = input.items.map(itemInput => {
            const lineTotal = itemInput.quantity * itemInput.unitCost;
            grandTotal += lineTotal;
            return {
                ...itemInput,
                id: crypto.randomUUID(),
                purchaseId: id,
                lineTotal
            };
        });

        const updatedPurchase: Purchase = {
            ...existingPurchase,
            date: input.date,
            notes: input.notes,
            total: grandTotal,
            items: purchaseItems,
            updatedAt: new Date().toISOString()
        };

        purchases[index] = updatedPurchase;
        this.savePurchases(purchases);
        return updatedPurchase;
    }

    async delete(id: string): Promise<void> {
        const purchases = this.getPurchases();
        const filtered = purchases.filter(p => p.id !== id);
        this.savePurchases(filtered);
    }
}
