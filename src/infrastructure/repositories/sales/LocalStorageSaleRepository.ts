
import { Sale, SaleStatus } from "@/core/domain/sales/types";
import { SaleRepository } from "@/core/repositories/SaleRepository";

const STORAGE_KEY = 'salon_sales';

export class LocalStorageSaleRepository implements SaleRepository {
    private getStorage(): Sale[] {
        if (typeof window === 'undefined') return [];
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    private saveStorage(sales: Sale[]): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sales));
    }

    async create(sale: Sale): Promise<Sale> {
        const sales = this.getStorage();
        sales.push(sale);
        this.saveStorage(sales);
        return sale;
    }

    async findById(id: string): Promise<Sale | null> {
        const sales = this.getStorage();
        return sales.find(s => s.id === id) || null;
    }

    async findByAppointmentId(appointmentId: string): Promise<Sale | null> {
        const sales = this.getStorage();
        // Assuming we want active sales for an appointment, but maybe also completed ones?
        // Usually 1 appointment = 1 sale. The latest one or specific one.
        // For now, return the first matching one that is not canceled.
        return sales.find(s => s.appointmentId === appointmentId && s.status !== 'canceled') || null;
    }

    async findByCustomerId(customerId: string): Promise<Sale[]> {
        const sales = this.getStorage();
        return sales.filter(s => s.customerId === customerId);
    }

    async findAll(tenantId?: string): Promise<Sale[]> {
        const sales = this.getStorage();
        if (tenantId) {
            return sales.filter(s => s.tenantId === tenantId);
        }
        return sales.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    async update(id: string, partial: Partial<Sale>): Promise<Sale> {
        const sales = this.getStorage();
        const index = sales.findIndex(s => s.id === id);
        if (index === -1) throw new Error("Sale not found");

        const updated = { ...sales[index], ...partial };
        sales[index] = updated;
        this.saveStorage(sales);
        return updated;
    }

    async delete(id: string): Promise<void> {
        const sales = this.getStorage();
        const filtered = sales.filter(s => s.id !== id);
        this.saveStorage(filtered);
    }
}
