import { getCashMovementRepository } from '@/infrastructure/repositories/factory'
import { GetCashSummary } from '@/core/usecases/cash/GetCashSummary'
import { ListCashMovements } from '@/core/usecases/cash/ListCashMovements'
import { CashSummaryCards } from '@/components/cash/CashSummaryCards'
import { CashList } from '@/components/cash/CashList'
import { CashHeader } from '@/components/cash/CashHeader'
import { DateFilter } from '@/components/cash/DateFilter'
import { startOfMonth, endOfMonth, parseISO } from 'date-fns'

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

    const start = params.start ? parseISO(params.start) : startOfMonth(new Date())
    const end = params.end ? parseISO(params.end) : endOfMonth(new Date())

    const summary = await summaryUseCase.execute({ startDate: start, endDate: end })
    const list = await listUseCase.execute({ startDate: start, endDate: end })

    return (
        <div className="container mx-auto p-6 space-y-6">
            <CashHeader />
            <DateFilter />
            <CashSummaryCards summary={summary} />
            <CashList movements={list} />
        </div>
    )
}
