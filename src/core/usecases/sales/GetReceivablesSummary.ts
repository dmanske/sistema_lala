import type { ISaleInstallmentRepository } from '@/core/repositories/SaleInstallmentRepository';

export interface ReceivablesSummary {
  totalPending: number;
  totalOverdue: number;
  totalDueIn7Days: number;
  totalDueIn30Days: number;
  countPending: number;
  countOverdue: number;
}

export class GetReceivablesSummary {
  constructor(private repository: ISaleInstallmentRepository) {}

  async execute(): Promise<ReceivablesSummary> {
    return this.repository.getSummary();
  }
}
