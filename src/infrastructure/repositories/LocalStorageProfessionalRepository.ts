import { Professional, CreateProfessionalInput, UpdateProfessionalInput } from "@/core/domain/Professional";
import { ProfessionalRepository } from "@/core/repositories/ProfessionalRepository";

const STORAGE_KEY = "professionals";

export class LocalStorageProfessionalRepository implements ProfessionalRepository {
    async getAll(): Promise<Professional[]> {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    async getById(id: string): Promise<Professional | null> {
        const all = await this.getAll();
        return all.find(p => p.id === id) || null;
    }

    async getActive(): Promise<Professional[]> {
        const all = await this.getAll();
        return all.filter(p => p.status === "ACTIVE");
    }

    async create(data: CreateProfessionalInput): Promise<Professional> {
        const all = await this.getAll();
        const newProfessional: Professional = {
            ...data,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
        };
        all.push(newProfessional);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
        return newProfessional;
    }

    async update(id: string, data: UpdateProfessionalInput): Promise<Professional> {
        const all = await this.getAll();
        const index = all.findIndex(p => p.id === id);
        if (index === -1) {
            throw new Error("Professional not found");
        }
        const updated: Professional = {
            ...all[index],
            ...data,
            updatedAt: new Date().toISOString(),
        };
        all[index] = updated;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
        return updated;
    }

    async delete(id: string): Promise<void> {
        const all = await this.getAll();
        const filtered = all.filter(p => p.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
}
