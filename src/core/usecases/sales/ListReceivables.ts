import type { ISaleInstallmentRepository } from '@/core/repositories/SaleInstallmentRepository';
import type { SaleInstallmentWithDetails } from '@/core/domain/entities/SaleInstallment';

export interface ListReceivablesInput {
  status?: 'PENDING' | 'RECEIVED' | 'OVERDUE';
  clientId?: string;
  startDate?: Date;
  endDate?: Date;
}

export class ListReceivables {
  constructor(private repository: ISaleInstallmentRepository) {}

  async execute(input: ListReceivablesInput = {}): Promise<SaleInstallmentWithDetails[]> {
    if (input.status === 'OVERDUE') {
      return this.repository.getOverdue();
    }

    if (input.status === 'PENDING' || !input.status) {
      return this.repository.getPending({
        clientId: input.clientId,
        startDate: input.startDate,
        endDate: input.endDate,
        overdue: false,
      });
    }

    if (input.status === 'RECEIVED') {
      return this.repository.getReceived();
    }

    return [];
  }
}
