/**
 * Repository Factory
 * 
 * Centralizes repository instantiation with environment-based switching.
 * When USE_SUPABASE=true, returns Supabase implementations.
 * When USE_SUPABASE=false (default), returns LocalStorage implementations.
 * 
 * Usage:
 *   import { getClientRepository } from '@/infrastructure/repositories/factory';
 *   const clientRepo = getClientRepository();
 */

import { ClientRepository } from '@/core/repositories/ClientRepository';
import { ProductRepository } from '@/core/repositories/ProductRepository';
import { ServiceRepository } from '@/core/repositories/ServiceRepository';
import { SupplierRepository } from '@/core/repositories/SupplierRepository';
import { ProfessionalRepository } from '@/core/repositories/ProfessionalRepository';
import { PurchaseRepository } from '@/core/repositories/PurchaseRepository';
import { AppointmentRepository } from '@/core/repositories/AppointmentRepository';
import { SaleRepository } from '@/core/repositories/SaleRepository';
import { CreditRepository } from '@/core/repositories/CreditRepository';
import { StockMovementRepository as CoreStockMovementRepository } from '@/core/repositories/StockMovementRepository';
import { StockMovementRepository as LocalStockMovementInterface } from './stock/StockMovementRepository';
import { CashMovementRepository } from '@/core/repositories/CashMovementRepository';

// LocalStorage implementations
import { LocalStorageClientRepository } from './LocalStorageClientRepository';
import { LocalStorageProductRepository } from './LocalStorageProductRepository';
import { LocalStorageServiceRepository } from './LocalStorageServiceRepository';
import { LocalStorageSupplierRepository } from './LocalStorageSupplierRepository';
import { LocalStorageProfessionalRepository } from './LocalStorageProfessionalRepository';
import { LocalStoragePurchaseRepository } from './LocalStoragePurchaseRepository';
import { LocalStorageAppointmentRepository } from './LocalStorageAppointmentRepository';
import { LocalStorageSaleRepository } from './sales/LocalStorageSaleRepository';
import { LocalStorageCreditRepository } from './LocalStorageCreditRepository';
import { LocalStorageStockMovementRepository } from './stock/LocalStorageStockMovementRepository';

// Supabase implementations
import { SupabaseClientRepository } from './supabase/SupabaseClientRepository';
import { SupabaseProductRepository } from './supabase/SupabaseProductRepository';
import { SupabaseServiceRepository } from './supabase/SupabaseServiceRepository';
import { SupabaseSupplierRepository } from './supabase/SupabaseSupplierRepository';
import { SupabaseProfessionalRepository } from './supabase/SupabaseProfessionalRepository';
import { SupabasePurchaseRepository } from './supabase/SupabasePurchaseRepository';
import { SupabaseAppointmentRepository } from './supabase/SupabaseAppointmentRepository';
import { SupabaseSaleRepository } from './supabase/SupabaseSaleRepository';
import { SupabaseCreditRepository } from './supabase/SupabaseCreditRepository';
import { SupabaseStockMovementRepository } from './supabase/SupabaseStockMovementRepository';
import { SupabaseCashMovementRepository } from './supabase/SupabaseCashMovementRepository';

/**
 * Check if Supabase should be used.
 * Set NEXT_PUBLIC_USE_SUPABASE=true in .env.local to enable.
 */
function useSupabase(): boolean {
    const useSupabaseEnv = process.env.NEXT_PUBLIC_USE_SUPABASE;
    // Check if defined and explicitly true (handling potential whitespace or quotes)
    return !!useSupabaseEnv && useSupabaseEnv.replace(/['"\s]/g, '') === 'true';
}

// Singleton instances (lazy-initialized)
let clientRepo: ClientRepository | null = null;
let productRepo: ProductRepository | null = null;
let serviceRepo: ServiceRepository | null = null;
let supplierRepo: SupplierRepository | null = null;
let professionalRepo: ProfessionalRepository | null = null;
let purchaseRepo: PurchaseRepository | null = null;
let appointmentRepo: AppointmentRepository | null = null;
let saleRepo: SaleRepository | null = null;
let creditRepo: CreditRepository | null = null;
// Note: LocalStorage and Supabase implement different interfaces during migration.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let stockMovementRepo: any = null;
let cashMovementRepo: CashMovementRepository | null = null;

export function getClientRepository(): ClientRepository {
    if (!clientRepo) {
        clientRepo = useSupabase()
            ? new SupabaseClientRepository()
            : new LocalStorageClientRepository();
    }
    return clientRepo;
}

export function getProductRepository(): ProductRepository {
    if (!productRepo) {
        productRepo = useSupabase()
            ? new SupabaseProductRepository()
            : new LocalStorageProductRepository();
    }
    return productRepo;
}

export function getServiceRepository(): ServiceRepository {
    if (!serviceRepo) {
        serviceRepo = useSupabase()
            ? new SupabaseServiceRepository()
            : new LocalStorageServiceRepository();
    }
    return serviceRepo;
}

export function getSupplierRepository(): SupplierRepository {
    if (!supplierRepo) {
        supplierRepo = useSupabase()
            ? new SupabaseSupplierRepository()
            : new LocalStorageSupplierRepository();
    }
    return supplierRepo;
}

export function getProfessionalRepository(): ProfessionalRepository {
    if (!professionalRepo) {
        professionalRepo = useSupabase()
            ? new SupabaseProfessionalRepository()
            : new LocalStorageProfessionalRepository();
    }
    return professionalRepo;
}

export function getPurchaseRepository(): PurchaseRepository {
    if (!purchaseRepo) {
        purchaseRepo = useSupabase()
            ? new SupabasePurchaseRepository()
            : new LocalStoragePurchaseRepository();
    }
    return purchaseRepo;
}

export function getAppointmentRepository(): AppointmentRepository {
    if (!appointmentRepo) {
        appointmentRepo = useSupabase()
            ? new SupabaseAppointmentRepository()
            : new LocalStorageAppointmentRepository();
    }
    return appointmentRepo;
}

export function getSaleRepository(): SaleRepository {
    if (!saleRepo) {
        saleRepo = useSupabase()
            ? new SupabaseSaleRepository()
            : new LocalStorageSaleRepository();
    }
    return saleRepo as SaleRepository;
}

export function getCreditRepository(): CreditRepository {
    if (!creditRepo) {
        creditRepo = useSupabase()
            ? new SupabaseCreditRepository()
            : new LocalStorageCreditRepository();
    }
    return creditRepo;
}

export function getStockMovementRepository(): CoreStockMovementRepository | LocalStockMovementInterface {
    if (!stockMovementRepo) {
        stockMovementRepo = useSupabase()
            ? new SupabaseStockMovementRepository()
            : new LocalStorageStockMovementRepository();
    }
    return stockMovementRepo;
}

import { SupabaseClient } from '@supabase/supabase-js';

export function getCashMovementRepository(client?: SupabaseClient): CashMovementRepository {
    if (client) {
        return new SupabaseCashMovementRepository(client);
    }

    if (!cashMovementRepo) {
        if (useSupabase()) {
            cashMovementRepo = new SupabaseCashMovementRepository();
        } else {
            throw new Error('Cash module is only available with Supabase backend.');
        }
    }
    return cashMovementRepo;
}

/**
 * Reset all singletons (useful for testing or switching backends)
 */
export function resetRepositories(): void {
    clientRepo = null;
    productRepo = null;
    serviceRepo = null;
    supplierRepo = null;
    professionalRepo = null;
    purchaseRepo = null;
    appointmentRepo = null;
    saleRepo = null;
    creditRepo = null;
    stockMovementRepo = null;
    cashMovementRepo = null;
    bankAccountRepo = null;
}

// Singleton for BankAccountRepository
let bankAccountRepo: BankAccountRepository | null = null;
import { BankAccountRepository } from '@/core/repositories/BankAccountRepository';
import { SupabaseBankAccountRepository } from './supabase/SupabaseBankAccountRepository';
// import { LocalStorageBankAccountRepository } from './LocalStorageBankAccountRepository'; // Not implemented yet

export function getBankAccountRepository(): BankAccountRepository {
    if (!bankAccountRepo) {
        if (useSupabase()) {
            bankAccountRepo = new SupabaseBankAccountRepository();
        } else {
            // Placeholder: throw error or return mock if local storage not implemented
            throw new Error('Bank Account module is only available with Supabase backend.');
            // bankAccountRepo = new LocalStorageBankAccountRepository();
        }
    }
    return bankAccountRepo;
}
