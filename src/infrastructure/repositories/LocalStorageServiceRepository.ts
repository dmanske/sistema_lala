import { Service, CreateServiceInput } from '@/core/domain/Service';
import { ServiceRepository } from '@/core/repositories/ServiceRepository';

const SERVICE_KEY = 'salon_services';

import { SERVICE_SEED_DATA as MOCK_SERVICES } from '@/lib/seedServices';

export class LocalStorageServiceRepository implements ServiceRepository {
    private getServices(): Service[] {
        if (typeof window === 'undefined') return MOCK_SERVICES;
        const stored = localStorage.getItem(SERVICE_KEY);
        if (!stored) {
            localStorage.setItem(SERVICE_KEY, JSON.stringify(MOCK_SERVICES));
            return MOCK_SERVICES;
        }
        return JSON.parse(stored);
    }

    private saveServices(services: Service[]): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(SERVICE_KEY, JSON.stringify(services));
            // Trigger storage event for reactivity if needed, or rely on SWR/React Query key invalidation
        }
    }

    async getAll(filter?: { search?: string }): Promise<Service[]> {
        let services = this.getServices();

        if (filter?.search) {
            const searchLower = filter.search.toLowerCase();
            services = services.filter((s) => s.name.toLowerCase().includes(searchLower));
        }

        return services.sort((a, b) => a.name.localeCompare(b.name));
    }

    async getById(id: string): Promise<Service | null> {
        const services = this.getServices();
        return services.find((s) => s.id === id) || null;
    }

    async create(input: CreateServiceInput): Promise<Service> {
        const services = this.getServices();
        const newService: Service = {
            ...input,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            netValue: input.price - (input.cost || 0) - (input.commission || 0) // Basic calc
        };
        services.push(newService);
        this.saveServices(services);
        return newService;
    }

    async update(id: string, input: Partial<Service>): Promise<Service> {
        const services = this.getServices();
        const index = services.findIndex((s) => s.id === id);
        if (index === -1) throw new Error("Service not found");

        const current = services[index];
        const updated: Service = {
            ...current,
            ...input,
            updatedAt: new Date().toISOString(),
        };

        // Recalculate netValue if price/cost/commission changed
        if (input.price !== undefined || input.cost !== undefined || input.commission !== undefined) {
            const p = input.price ?? current.price;
            const c = input.cost ?? current.cost;
            const com = input.commission ?? current.commission;
            updated.netValue = p - c - com;
        }

        services[index] = updated;
        this.saveServices(services);
        return updated;
    }

    async delete(id: string): Promise<boolean> {
        const services = this.getServices();
        const filtered = services.filter((s) => s.id !== id);
        if (filtered.length === services.length) return false;

        this.saveServices(filtered);
        return true;
    }
}
