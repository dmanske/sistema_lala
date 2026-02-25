export type AccountPayableCategory =
  | 'COMPRA'
  | 'ALUGUEL'
  | 'ENERGIA'
  | 'AGUA'
  | 'INTERNET'
  | 'TELEFONE'
  | 'IMPOSTOS'
  | 'SALARIOS'
  | 'OUTROS';

export type AccountPayableStatus =
  | 'PENDING'
  | 'PARTIAL'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED';

export interface AccountPayable {
  id: string;
  tenantId: string;
  description: string;
  amount: number;
  dueDate: Date;
  purchaseId?: string;
  supplierId?: string;
  category: AccountPayableCategory;
  paymentStatus: AccountPayableStatus;
  paidAmount: number;
  notes?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccountPayableWithDetails extends AccountPayable {
  supplierName?: string;
  purchaseNumber?: string;
  remainingAmount: number;
  daysOverdue?: number;
  isOverdue: boolean;
}

export interface CreateAccountPayableInput {
  description: string;
  amount: number;
  dueDate: Date;
  purchaseId?: string;
  supplierId?: string;
  category: AccountPayableCategory;
  notes?: string;
  createdBy?: string;
}

export interface AccountPayableSummary {
  totalPending: number;
  totalOverdue: number;
  totalPaidThisMonth: number;
  countPending: number;
  countOverdue: number;
  byCategory: Record<AccountPayableCategory, number>;
}
