import { Client, CreateClientInput } from '@/core/domain/Client';
import { ClientRepository } from '@/core/repositories/ClientRepository';

const STORAGE_KEY = 'salon_clients';

import { CLIENT_SEED_DATA as SEED_DATA } from '@/lib/seedClients';

export class LocalStorageClientRepository implements ClientRepository {
    private getClients(): Client[] {
        if (typeof window === 'undefined') return SEED_DATA; // Server-side fallback

        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
            return SEED_DATA;
        }
        return JSON.parse(stored);
    }

    private saveClients(clients: Client[]): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
        }
    }

    async getAll(filter?: { status?: string; search?: string }): Promise<Client[]> {
        let clients = this.getClients();

        if (filter?.status && filter.status !== 'ALL') {
            clients = clients.filter((c) => c.status === filter.status);
        }

        if (filter?.search) {
            const searchLower = filter.search.toLowerCase();
            clients = clients.filter(
                (c) =>
                    c.name.toLowerCase().includes(searchLower) ||
                    (c.phone && c.phone.includes(searchLower))
            );
        }

        // Sort by name
        return clients.sort((a, b) => a.name.localeCompare(b.name));
    }

    async getById(id: string): Promise<Client | null> {
        const clients = this.getClients();
        return clients.find((c) => c.id === id) || null;
    }

    async create(input: CreateClientInput): Promise<Client> {
        const clients = this.getClients();
        const newClient: Client = {
            ...input,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            creditBalance: 0,
            hasHistory: false, // New clients have no history
        };

        clients.push(newClient);
        this.saveClients(clients);
        return newClient;
    }

    async update(id: string, input: Partial<Client>): Promise<Client> {
        const clients = this.getClients();
        const index = clients.findIndex((c) => c.id === id);

        if (index === -1) {
            throw new Error('Client not found');
        }

        const updatedClient = { ...clients[index], ...input };
        clients[index] = updatedClient;
        this.saveClients(clients);
        return updatedClient;
    }

    async delete(id: string): Promise<boolean> {
        const clients = this.getClients();
        const filteredClients = clients.filter((c) => c.id !== id);

        if (filteredClients.length === clients.length) {
            return false; // Not found
        }

        this.saveClients(filteredClients);
        return true;
    }
}
