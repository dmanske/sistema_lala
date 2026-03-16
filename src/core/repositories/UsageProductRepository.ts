import { UsageProduct, CreateUsageProductInput, UsageProductLog, CreateUsageProductLogInput } from "@/core/domain/UsageProduct";

export interface UsageProductRepository {
    getAll(filter?: { search?: string }): Promise<UsageProduct[]>;
    getById(id: string): Promise<UsageProduct | null>;
    create(input: CreateUsageProductInput): Promise<UsageProduct>;
    update(id: string, input: Partial<UsageProduct>): Promise<UsageProduct>;
    delete(id: string): Promise<boolean>;
    // Logs
    addLog(input: CreateUsageProductLogInput): Promise<UsageProductLog>;
    getLogsByAppointment(appointmentId: string): Promise<UsageProductLog[]>;
    getLogsByClient(clientId: string): Promise<UsageProductLog[]>;
    getLastFormulaForClient(clientId: string, serviceType?: string): Promise<UsageProductLog[]>;
}
