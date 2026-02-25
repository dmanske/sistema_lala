export type PaymentMethod =
  | 'DINHEIRO'
  | 'PIX'
  | 'TRANSFERENCIA'
  | 'CARTAO_DEBITO'
  | 'CARTAO_CREDITO'
  | 'BOLETO'
  | 'CHEQUE';

export interface AccountPayablePayment {
  id: string;
  tenantId: string;
  accountPayableId: string;
  amount: number;
  paidAt: Date;
  paymentMethod: PaymentMethod;
  bankAccountId?: string;
  notes?: string;
  createdBy?: string;
  createdAt: Date;
}

export interface AccountPayablePaymentWithDetails extends AccountPayablePayment {
  bankAccountName?: string;
  createdByName?: string;
}

export interface CreateAccountPayablePaymentInput {
  accountPayableId: string;
  amount: number;
  paidAt: Date;
  paymentMethod: PaymentMethod;
  bankAccountId?: string;
  notes?: string;
  createdBy?: string;
}
