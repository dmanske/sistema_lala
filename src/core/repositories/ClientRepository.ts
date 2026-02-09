import { Client, CreateClientInput } from '@/core/domain/Client';

export interface ClientRepository {
    getAll(filter?: { status?: string; search?: string }): Promise<Client[]>;
    getById(id: string): Promise<Client | null>;
    create(client: CreateClientInput): Promise<Client>;
    update(id: string, client: Partial<Client>): Promise<Client>;
    delete(id: string): Promise<boolean>;
}
