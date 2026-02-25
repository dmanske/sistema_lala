import { IAccountPayableRepository } from '@/core/repositories/AccountPayableRepository';
import { CreateAccountPayablePaymentInput } from '@/core/domain/entities/AccountPayablePayment';

export class RegisterPayment {
  constructor(private repository: IAccountPayableRepository) {}

  async execute(input: CreateAccountPayablePaymentInput): Promise<string> {
    // Validations
    if (input.amount <= 0) {
      throw new Error('Payment amount must be greater than zero');
    }

    if (!input.paidAt) {
      throw new Error('Payment date is required');
    }

    // Get account to validate remaining amount
    const account = await this.repository.getById(input.accountPayableId);
    if (!account) {
      throw new Error('Account payable not found');
    }

    const remainingAmount = account.amount - account.paidAmount;
    if (input.amount > remainingAmount) {
      throw new Error(`Payment amount (${input.amount}) exceeds remaining balance (${remainingAmount})`);
    }

    // Register payment (RPC handles status update and cash_movements)
    return await this.repository.registerPayment(input);
  }
}
