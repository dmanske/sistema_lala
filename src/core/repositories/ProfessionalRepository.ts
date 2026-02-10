import { Professional, CreateProfessionalInput, UpdateProfessionalInput } from "@/core/domain/Professional";

export interface ProfessionalRepository {
    getAll(): Promise<Professional[]>;
    getById(id: string): Promise<Professional | null>;
    getActive(): Promise<Professional[]>;
    create(data: CreateProfessionalInput): Promise<Professional>;
    update(id: string, data: UpdateProfessionalInput): Promise<Professional>;
    delete(id: string): Promise<void>;
}
