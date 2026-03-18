'use client'

import { useState, useMemo, useEffect } from 'react'
import { CashMovement } from '@/core/domain/CashMovement'
import { CashList } from './CashList'
import { CashSummaryCards } from './CashSummaryCards'
import { CashHeader } from './CashHeader'
import { ExportButton } from './ExportButton'
import { MonthTabs } from './MonthTabs'
import { CashComparison } from './CashComparison'
import { PaymentMethodSummary } from './PaymentMethodSummary'
import { AccountSummary } from './AccountSummary'
import { CashAnalytics } from './CashAnalytics'
import { Button } from '@/components/ui/button'
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
    const [searchText, setSearchText] = useState('')
    const [filterType, setFilterType] = useState<'ALL' | 'IN' | 'OUT'>('ALL')
    const [filterAccount, setFilterAccount] = useState<string>('__ALL__')
    const [accountNames, setAccountNames] = useState<Record<string, string>>({})
    const [activeTab, setActiveTab] = useState<'statement' | 'analytics'>('statement')

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

    // Filter movements by search, type and account
    const filteredMovements = useMemo(() => {
        let result = movements
        
        // Filter by type
        if (filterType !== 'ALL') {
            result = result.filter(m => m.type === filterType)
        }
        
        // Filter by account
        if (filterAccount !== '__ALL__' && filterAccount !== '') {
            result = result.filter(m => m.bankAccountId === filterAccount)
        }
        
        // Filter by search
        if (searchText.trim()) {
            const search = searchText.toLowerCase()
            result = result.filter(m => 
                m.description?.toLowerCase().includes(search) ||
                m.method?.toLowerCase().includes(search) ||
                m.sourceType?.toLowerCase().includes(search)
            )
        }
        
        return result
    }, [movements, searchText, filterType, filterAccount])

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
        <div className="space-y-4">
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

            {/* Abas de Meses com Filtros Integrados */}
            <MonthTabs 
                currentStart={period.start} 
                currentEnd={period.end}
                searchText={searchText}
                onSearchChange={setSearchText}
                filterType={filterType}
                onFilterTypeChange={setFilterType}
                filterAccount={filterAccount}
                onFilterAccountChange={setFilterAccount}
                resultCount={filteredMovements.length}
                totalCount={movements.length}
            />

            {/* Cards de Resumo */}
            <CashSummaryCards summary={filteredSummary} />

            {/* Tab switcher */}
            <div className="flex items-center gap-1 bg-card border border-border shadow-sm rounded-xl p-1 w-fit">
                <button
                    onClick={() => setActiveTab('statement')}
                    className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === 'statement'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Extrato
                </button>
                <button
                    onClick={() => setActiveTab('analytics')}
                    className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === 'analytics'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Análise Detalhada
                </button>
            </div>

            {/* Tab content */}
            {activeTab === 'statement' ? (
                <CashList movements={filteredMovements} />
            ) : (
                <div className="space-y-6 bg-card rounded-2xl border border-border shadow-sm p-6">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Comparação com Período Anterior</h3>
                        <CashComparison movements={filteredMovements} period={period} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Por Método de Pagamento</h3>
                            <PaymentMethodSummary movements={filteredMovements} />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Por Conta Bancária</h3>
                            <AccountSummary movements={filteredMovements} accountNames={accountNames} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Análise Detalhada</h3>
                        <CashAnalytics movements={filteredMovements} period={period} />
                    </div>
                </div>
            )}
        </div>
    )
}
