export type InstallmentStatus = 'PENDING' | 'RECEIVED';

export interface SaleInstallment {
  id: string;
  tenantId: string;
  saleId: string;
  installmentNumber: number;
  amount: number;
  dueDate: Date;
  status: InstallmentStatus;
  receivedAt?: Date;
  receivedAmount?: number;
  bankAccountId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaleInstallmentWithDetails extends SaleInstallment {
  saleTotal: number;
  saleDate: Date;
  clientId: string;
  clientName: string;
  clientPhone?: string;
  clientWhatsapp?: string;
  bankAccountName?: string;
  daysOverdue: number;
  isOverdue: boolean;
}

export interface CreateSaleInstallmentInput {
  saleId: string;
  installmentNumber: number;
  amount: number;
  dueDate: Date;
}

export interface RegisterReceiptInput {
  installmentId: string;
  receivedAmount: number;
  receivedAt: Date;
  bankAccountId: string;
  paymentMethod: 'CASH' | 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'CHECK';
  notes?: string;
}
