import { CashMovementRepository } from '@/core/repositories/CashMovementRepository'

export class GetCashSummary {
    constructor(private repo: CashMovementRepository) { }

    async execute(filters?: { startDate?: Date; endDate?: Date }) {
        return this.repo.getSummary(filters)
    }
}
