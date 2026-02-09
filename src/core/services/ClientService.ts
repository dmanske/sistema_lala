import { Client, CreateClientInput } from '@/core/domain/Client';
import { ClientRepository } from '@/core/repositories/ClientRepository';

export class BusinessError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'BusinessError';
    }
}

export class ClientService {
    constructor(private repo: ClientRepository) { }

    async getAll(filter?: { status?: string; search?: string }): Promise<Client[]> {
        return this.repo.getAll(filter);
    }

    async getById(id: string): Promise<Client | null> {
        return this.repo.getById(id);
    }

    async create(input: CreateClientInput): Promise<Client> {
        // Validations could go here
        return this.repo.create(input);
    }

    async update(id: string, input: Partial<Client>): Promise<Client> {
        return this.repo.update(id, input);
    }

    async delete(id: string): Promise<void> {
        const client = await this.repo.getById(id);

        if (!client) {
            throw new Error('Client not found');
        }

        if (client.hasHistory) {
            throw new BusinessError('Client has history (appointments, financial records). Cannot delete. Suggest inactivating instead.');
        }

        const success = await this.repo.delete(id);
        if (!success) {
            throw new Error('Failed to delete client');
        }
    }
}
