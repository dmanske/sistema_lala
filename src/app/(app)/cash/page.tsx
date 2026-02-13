import { getCashMovementRepository } from '@/infrastructure/repositories/factory'
import { GetCashSummary } from '@/core/usecases/cash/GetCashSummary'
import { ListCashMovements } from '@/core/usecases/cash/ListCashMovements'
import { DateNavigator } from '@/components/cash/DateNavigator'
import { CashPageClient } from '@/components/cash/CashPageClient'
import { startOfMonth, endOfMonth } from 'date-fns'
import { parseLocalDate } from '@/lib/utils/dateFormatters'

interface CashPageProps {
    searchParams: Promise<{ start?: string; end?: string }>
}

import { createClient } from '@/lib/supabase/server'
// ...

export default async function CashPage({ searchParams }: CashPageProps) {
    const params = await searchParams
    const supabase = await createClient()
    const repo = getCashMovementRepository(supabase)
    const summaryUseCase = new GetCashSummary(repo)
    const listUseCase = new ListCashMovements(repo)

    const start = params.start ? parseLocalDate(params.start) || startOfMonth(new Date()) : startOfMonth(new Date())
    const end = params.end ? parseLocalDate(params.end) || endOfMonth(new Date()) : endOfMonth(new Date())

    const summary = await summaryUseCase.execute({ startDate: start, endDate: end })
    const list = await listUseCase.execute({ startDate: start, endDate: end })

    return (
        <div className="container mx-auto p-4 space-y-4">
            <DateNavigator startDate={start} endDate={end} />
            <CashPageClient
                movements={list}
                summary={summary}
                period={{ start, end }}
            />
        </div>
    )
}
