import {
  AccountPayable,
  AccountPayableWithDetails,
  CreateAccountPayableInput,
  AccountPayableSummary,
  AccountPayableStatus,
  AccountPayableCategory,
} from '../domain/entities/AccountPayable';
import {
  AccountPayablePayment,
  CreateAccountPayablePaymentInput,
} from '../domain/entities/AccountPayablePayment';

export interface AccountPayableFilters {
  status?: AccountPayableStatus;
  category?: AccountPayableCategory;
  supplierId?: string;
  startDate?: Date;
  endDate?: Date;
  overdue?: boolean;
}

export interface IAccountPayableRepository {
  // Account Payable CRUD
  create(input: CreateAccountPayableInput): Promise<AccountPayable>;
  getById(id: string): Promise<AccountPayableWithDetails | null>;
  list(filters?: AccountPayableFilters): Promise<AccountPayableWithDetails[]>;
  update(id: string, data: Partial<AccountPayable>): Promise<AccountPayable>;
  delete(id: string): Promise<void>;

  // Payments
  registerPayment(input: CreateAccountPayablePaymentInput): Promise<string>;
  getPayments(accountPayableId: string): Promise<AccountPayablePayment[]>;

  // Queries
  getOverdue(): Promise<AccountPayableWithDetails[]>;
  getDueSoon(days: number): Promise<AccountPayableWithDetails[]>;
  getSummary(): Promise<AccountPayableSummary>;
}
