import { Purchase, CreatePurchaseInput, PurchaseItem } from "@/core/domain/Purchase";
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
            createdAt: new Date().toISOString()
        };

        purchases.push(newPurchase);
        this.savePurchases(purchases);
        return newPurchase;
    }
}
