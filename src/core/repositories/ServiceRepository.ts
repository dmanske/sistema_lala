import { Service, CreateServiceInput } from "@/core/domain/Service";

export interface ServiceRepository {
    getAll(filter?: { search?: string }): Promise<Service[]>;
    getById(id: string): Promise<Service | null>;
    create(input: CreateServiceInput): Promise<Service>;
    update(id: string, input: Partial<Service>): Promise<Service>;
    delete(id: string): Promise<boolean>;
}
