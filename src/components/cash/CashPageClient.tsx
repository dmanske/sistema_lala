'use client'

import { useState, useMemo, useEffect } from 'react'
import { CashMovement } from '@/core/domain/CashMovement'
import { CashFilters, FilterState } from './CashFilters'
import { CashList } from './CashList'
import { CashSummaryCards } from './CashSummaryCards'
import { CashHeader } from './CashHeader'
import { ExportButton } from './ExportButton'
import { filterMovements } from '@/lib/cash/filterMovements'
import { createClient } from '@/lib/supabase/client'

interface CashSummary {
    totalIn: number
    totalOut: number
    balance: number
}

interface CashPageClientProps {
    movements: CashMovement[]
    summary: CashSummary
    period: {
        start: Date
        end: Date
    }
}

export function CashPageClient({ movements, summary, period }: CashPageClientProps) {
    const [filters, setFilters] = useState<FilterState>({
        type: 'ALL',
        method: 'ALL',
        source: 'ALL',
        bankAccountId: '__ALL__',
        searchText: ''
    })
    const [accountNames, setAccountNames] = useState<Record<string, string>>({})

    // Load account names for export
    useEffect(() => {
        async function loadAccountNames() {
            const supabase = createClient()
            const { data: accounts } = await supabase
                .from('bank_accounts')
                .select('id, name')
            
            if (accounts) {
                const names: Record<string, string> = {}
                accounts.forEach(acc => {
                    names[acc.id] = acc.name
                })
                setAccountNames(names)
            }
        }
        loadAccountNames()
    }, [])

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

    // Calculate account summary for export
    const accountSummary = useMemo(() => {
        const accountMap = new Map<string, { totalIn: number; totalOut: number }>()
        
        filteredMovements.forEach(m => {
            const existing = accountMap.get(m.bankAccountId) || { totalIn: 0, totalOut: 0 }
            if (m.type === 'IN') {
                existing.totalIn += m.amount
            } else {
                existing.totalOut += m.amount
            }
            accountMap.set(m.bankAccountId, existing)
        })

        return Array.from(accountMap.entries()).map(([accountId, totals]) => ({
            accountName: accountNames[accountId] || 'Desconhecida',
            totalIn: totals.totalIn,
            totalOut: totals.totalOut,
            balance: totals.totalIn - totals.totalOut
        }))
    }, [filteredMovements, accountNames])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <CashHeader />
                <ExportButton
                    movements={filteredMovements}
                    summary={filteredSummary}
                    accountSummary={accountSummary}
                    accountNames={accountNames}
                    period={period}
                />
            </div>
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
