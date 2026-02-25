import { IAccountPayableRepository } from '@/core/repositories/AccountPayableRepository';
import { AccountPayableSummary } from '@/core/domain/entities/AccountPayable';

export class GetAccountsPayableSummary {
  constructor(private repository: IAccountPayableRepository) {}

  async execute(): Promise<AccountPayableSummary> {
    return await this.repository.getSummary();
  }
}
