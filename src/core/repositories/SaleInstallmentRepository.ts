import type { 
  SaleInstallment, 
  SaleInstallmentWithDetails,
  CreateSaleInstallmentInput,
  RegisterReceiptInput
} from '../domain/entities/SaleInstallment';

export interface ISaleInstallmentRepository {
  getById(id: string): Promise<SaleInstallmentWithDetails | null>;
  getBySaleId(saleId: string): Promise<SaleInstallmentWithDetails[]>;
  getPending(filters?: {
    clientId?: string;
    startDate?: Date;
    endDate?: Date;
    overdue?: boolean;
  }): Promise<SaleInstallmentWithDetails[]>;
  getOverdue(): Promise<SaleInstallmentWithDetails[]>;
  create(input: CreateSaleInstallmentInput): Promise<string>;
  createBatch(inputs: CreateSaleInstallmentInput[]): Promise<string[]>;
  registerReceipt(input: RegisterReceiptInput): Promise<string>;
  getSummary(): Promise<{
    totalPending: number;
    totalOverdue: number;
    totalDueIn7Days: number;
    totalDueIn30Days: number;
    countPending: number;
    countOverdue: number;
  }>;
}
