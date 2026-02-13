'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns'

interface QuickPeriodFiltersProps {
    activePeriod?: string
    onPeriodChange: (period: string, startDate?: Date, endDate?: Date) => void
}

const QUICK_PERIODS = [
    { id: 'today', label: 'Hoje' },
    { id: 'yesterday', label: 'Ontem' },
    { id: '7days', label: '7 Dias' },
    { id: '30days', label: '30 Dias' },
    { id: 'thisMonth', label: 'Este Mês' },
    { id: 'lastMonth', label: 'Mês Passado' },
]

export function QuickPeriodFilters({ activePeriod, onPeriodChange }: QuickPeriodFiltersProps) {
    const calculateDateRange = (periodId: string): { start: Date; end: Date } => {
        const now = new Date()
        
        switch (periodId) {
            case 'today':
                return { start: startOfDay(now), end: endOfDay(now) }
            case 'yesterday':
                const yesterday = subDays(now, 1)
                return { start: startOfDay(yesterday), end: endOfDay(yesterday) }
            case '7days':
                return { start: startOfDay(subDays(now, 6)), end: endOfDay(now) }
            case '30days':
                return { start: startOfDay(subDays(now, 29)), end: endOfDay(now) }
            case 'thisMonth':
                return { start: startOfMonth(now), end: endOfDay(now) }
            case 'lastMonth':
                const lastMonth = subMonths(now, 1)
                return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) }
            default:
                return { start: startOfDay(now), end: endOfDay(now) }
        }
    }

    const handlePeriodClick = (periodId: string) => {
        const { start, end } = calculateDateRange(periodId)
        onPeriodChange(periodId, start, end)
    }

    return (
        <div className="flex flex-wrap gap-2">
            {QUICK_PERIODS.map((period) => (
                <Button
                    key={period.id}
                    variant={activePeriod === period.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePeriodClick(period.id)}
                    className={cn(
                        'transition-all',
                        activePeriod === period.id && 'shadow-md'
                    )}
                >
                    {period.label}
                </Button>
            ))}
        </div>
    )
}
