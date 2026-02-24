import { CashRegisterSummary, CashRegisterSummaryWithUser } from '@/core/domain/entities/CashRegister'
import { CashRegisterRepository } from '@/core/repositories/CashRegisterRepository'
import { SupabaseCashRegisterRepository } from '@/infrastructure/repositories/supabase/SupabaseCashRegisterRepository'
import { SupabaseClient } from '@supabase/supabase-js'

export class ObterCaixaAtual {
    private repository: CashRegisterRepository

    constructor(client?: SupabaseClient) {
        this.repository = new SupabaseCashRegisterRepository(client)
    }

    async execute(): Promise<CashRegisterSummaryWithUser | null> {
        // Get the currently open cash register
        const currentCashRegister = await this.repository.getCurrentOpen()
        
        if (!currentCashRegister) {
            return null
        }

        // Get the summary which includes movements and sales
        const summary = await this.repository.getSummary(currentCashRegister.id)
        
        return summary
    }
}
