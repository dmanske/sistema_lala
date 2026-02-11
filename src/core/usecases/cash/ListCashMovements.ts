import { CashMovementRepository } from '@/core/repositories/CashMovementRepository'

export class ListCashMovements {
    constructor(private repo: CashMovementRepository) { }

    async execute(filters?: {
        startDate?: Date
        endDate?: Date
        type?: 'IN' | 'OUT'
        method?: string
    }) {
        return this.repo.list(filters)
    }
}
