'use client'

import { useState, useMemo } from 'react'
import { CashMovement } from '@/core/domain/CashMovement'
import { CashFilters, FilterState } from './CashFilters'
import { CashList } from './CashList'
import { CashSummaryCards } from './CashSummaryCards'
import { filterMovements } from '@/lib/cash/filterMovements'

interface CashSummary {
    totalIn: number
    totalOut: number
    balance: number
}

interface CashPageClientProps {
    movements: CashMovement[]
    summary: CashSummary
}

export function CashPageClient({ movements, summary }: CashPageClientProps) {
    const [filters, setFilters] = useState<FilterState>({
        type: 'ALL',
        method: 'ALL',
        source: 'ALL',
        bankAccountId: '__ALL__',
        searchText: ''
    })

    // Filter movements
    const filteredMovements = useMemo(() => {
        return filterMovements(movements, filters)
    }, [movements, filters])

    // Calculate filtered summary
    const filteredSummary = useMemo(() => {
        const totalIn = filteredMovements
            .filter(m => m.type === 'IN')
            .reduce((sum, m) => sum + m.amount, 0)
        
        const totalOut = filteredMovements
            .filter(m => m.type === 'OUT')
            .reduce((sum, m) => sum + m.amount, 0)
        
        return {
            totalIn,
            totalOut,
            balance: totalIn - totalOut
        }
    }, [filteredMovements])

    return (
        <div className="space-y-6">
            <CashFilters
                filters={filters}
                onFiltersChange={setFilters}
                resultCount={filteredMovements.length}
                totalCount={movements.length}
            />
            <CashSummaryCards summary={filteredSummary} />
            <CashList movements={filteredMovements} />
        </div>
    )
}
