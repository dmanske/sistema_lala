import type { ISaleInstallmentRepository } from '@/core/repositories/SaleInstallmentRepository';
import type { RegisterReceiptInput } from '@/core/domain/entities/SaleInstallment';

export class RegisterReceipt {
  constructor(private repository: ISaleInstallmentRepository) {}

  async execute(input: RegisterReceiptInput): Promise<string> {
    // Validar valor recebido
    if (input.receivedAmount <= 0) {
      throw new Error('Received amount must be positive');
    }

    // Buscar parcela para validar
    const installment = await this.repository.getById(input.installmentId);
    
    if (!installment) {
      throw new Error('Installment not found');
    }

    if (installment.status === 'RECEIVED') {
      throw new Error('Installment already received');
    }

    // Registrar recebimento (cria movimento no caixa automaticamente via RPC)
    const movementId = await this.repository.registerReceipt(input);

    return movementId;
  }
}
