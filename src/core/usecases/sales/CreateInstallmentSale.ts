import type { ISaleInstallmentRepository } from '@/core/repositories/SaleInstallmentRepository';
import type { CreateInstallmentSaleInput } from '@/core/domain/types/InstallmentSale';

export class CreateInstallmentSale {
  constructor(private repository: ISaleInstallmentRepository) {}

  async execute(input: CreateInstallmentSaleInput): Promise<string[]> {
    // Validar que há pelo menos uma parcela
    if (input.installments.length === 0) {
      throw new Error('At least one installment is required');
    }

    // Validar que os números das parcelas são sequenciais
    const sortedInstallments = [...input.installments].sort(
      (a, b) => a.installmentNumber - b.installmentNumber
    );

    for (let i = 0; i < sortedInstallments.length; i++) {
      if (sortedInstallments[i].installmentNumber !== i + 1) {
        throw new Error('Installment numbers must be sequential starting from 1');
      }
    }

    // Validar que todas as parcelas têm valor positivo
    for (const installment of input.installments) {
      if (installment.amount <= 0) {
        throw new Error('All installments must have positive amounts');
      }
    }

    // Criar parcelas em lote
    const installmentIds = await this.repository.createBatch(
      input.installments.map(inst => ({
        saleId: input.saleId,
        installmentNumber: inst.installmentNumber,
        amount: inst.amount,
        dueDate: inst.dueDate,
      }))
    );

    return installmentIds;
  }
}
