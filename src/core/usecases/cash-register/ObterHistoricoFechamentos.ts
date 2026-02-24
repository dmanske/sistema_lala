import { CashRegisterWithUser } from '@/core/domain/entities/CashRegister'
import { CashRegisterRepository, GetHistoryFilters } from '@/core/repositories/CashRegisterRepository'
import { SupabaseCashRegisterRepository } from '@/infrastructure/repositories/supabase/SupabaseCashRegisterRepository'
import { SupabaseClient } from '@supabase/supabase-js'

export interface ObterHistoricoFechamentosInput {
    startDate?: Date
    endDate?: Date
    openedBy?: string
    status?: 'OPEN' | 'CLOSED'
}

export interface ObterHistoricoFechamentosResult {
    cashRegisters: CashRegisterWithUser[]
    statistics: {
        totalCashRegisters: number
        totalInitialBalance: number
        totalExpectedBalance: number
        totalActualBalance: number
        totalDifference: number
        totalSobra: number
        totalFalta: number
    }
}

export class ObterHistoricoFechamentos {
    private repository: CashRegisterRepository

    constructor(client?: SupabaseClient) {
        this.repository = new SupabaseCashRegisterRepository(client)
    }

    async execute(input: ObterHistoricoFechamentosInput = {}): Promise<ObterHistoricoFechamentosResult> {
        this.validateInput(input)

        // Build filters for repository
        const filters: GetHistoryFilters = {
            startDate: input.startDate,
            endDate: input.endDate,
            openedBy: input.openedBy,
            status: input.status
        }

        // Get history from repository
        const cashRegisters = await this.repository.getHistory(filters)

        // Calculate statistics
        const statistics = this.calculateStatistics(cashRegisters)

        return {
            cashRegisters,
            statistics
        }
    }

    private validateInput(input: ObterHistoricoFechamentosInput): void {
        // Validate date range
        if (input.startDate && input.endDate) {
            if (input.startDate > input.endDate) {
                throw new Error('Start date cannot be after end date')
            }
        }

        // Validate status if provided
        if (input.status && !['OPEN', 'CLOSED'].includes(input.status)) {
            throw new Error('Invalid status. Must be OPEN or CLOSED')
        }
    }

    private calculateStatistics(cashRegisters: CashRegisterWithUser[]): ObterHistoricoFechamentosResult['statistics'] {
        const totalCashRegisters = cashRegisters.length

        let totalInitialBalance = 0
        let totalExpectedBalance = 0
        let totalActualBalance = 0
        let totalDifference = 0
        let totalSobra = 0
        let totalFalta = 0

        cashRegisters.forEach(cashRegister => {
            totalInitialBalance += cashRegister.initialBalance

            // Only include closed cash registers in balance calculations
            if (cashRegister.status === 'CLOSED') {
                totalExpectedBalance += cashRegister.expectedBalance || 0
                totalActualBalance += cashRegister.actualBalance || 0
                
                const difference = cashRegister.difference || 0
                totalDifference += difference

                // Sobra (surplus) is positive difference
                if (difference > 0) {
                    totalSobra += difference
                }
                // Falta (shortage) is negative difference
                else if (difference < 0) {
                    totalFalta += Math.abs(difference)
                }
            }
        })

        return {
            totalCashRegisters,
            totalInitialBalance,
            totalExpectedBalance,
            totalActualBalance,
            totalDifference,
            totalSobra,
            totalFalta
        }
    }
}
