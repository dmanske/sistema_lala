export type BankTransferStatus = 'SCHEDULED' | 'EXECUTED' | 'CANCELLED';

export interface BankTransfer {
  id: string;
  tenantId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  scheduledDate: Date;
  executedDate?: Date;
  status: BankTransferStatus;
  description?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
