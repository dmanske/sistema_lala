import { IAccountPayableRepository } from '@/core/repositories/AccountPayableRepository';
import { CreateAccountPayableInput, AccountPayable } from '@/core/domain/entities/AccountPayable';

export class CreateAccountPayable {
  constructor(private repository: IAccountPayableRepository) {}

  async execute(input: CreateAccountPayableInput): Promise<AccountPayable> {
    // Validations
    if (!input.description || input.description.trim() === '') {
      throw new Error('Description is required');
    }

    if (input.amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }

    if (!input.dueDate) {
      throw new Error('Due date is required');
    }

    // Create account payable
    return await this.repository.create(input);
  }
}
