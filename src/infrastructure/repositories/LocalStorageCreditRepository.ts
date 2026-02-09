import { CreditMovement } from "@/core/domain/Credit";
import { CreditRepository } from "@/core/repositories/CreditRepository";

const STORAGE_KEY = "sistema_lala_credits";

export class LocalStorageCreditRepository implements CreditRepository {
    async create(data: CreditMovement): Promise<CreditMovement> {
        const movements = await this.getAll();
        movements.push(data);
        if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(movements));
        }
        return data;
    }

    async getByClientId(clientId: string): Promise<CreditMovement[]> {
        const all = await this.getAll();
        return all
            .filter(m => m.clientId === clientId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    private async getAll(): Promise<CreditMovement[]> {
        if (typeof window === "undefined") return [];
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        try {
            return JSON.parse(data);
        } catch {
            return [];
        }
    }
}
