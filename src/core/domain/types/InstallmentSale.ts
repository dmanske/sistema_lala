export interface InstallmentPlan {
  numberOfInstallments: number;
  firstDueDate: Date;
  installmentAmount: number;
  totalAmount: number;
}

export interface InstallmentInput {
  installmentNumber: number;
  amount: number;
  dueDate: Date;
}

export interface CreateInstallmentSaleInput {
  saleId: string;
  installments: InstallmentInput[];
}
