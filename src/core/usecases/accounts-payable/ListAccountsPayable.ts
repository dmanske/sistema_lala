import { IAccountPayableRepository, AccountPayableFilters } from '@/core/repositories/AccountPayableRepository';
import { AccountPayableWithDetails } from '@/core/domain/entities/AccountPayable';

export class ListAccountsPayable {
  constructor(private repository: IAccountPayableRepository) {}

  async execute(filters?: AccountPayableFilters): Promise<AccountPayableWithDetails[]> {
    return await this.repository.list(filters);
  }
}
