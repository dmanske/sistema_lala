'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
    startOfDay, 
    endOfDay, 
    subDays, 
    startOfMonth, 
    endOfMonth,
    startOfYear,
    endOfYear,
    addMonths,
    subMonths,
    format,
    isSameDay
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DateRange } from 'react-day-picker'

interface DateNavigatorProps {
    startDate: Date
    endDate: Date
}

type QuickFilter = 'today' | 'yesterday' | '7days' | '30days' | 'month' | 'year' | 'custom'

export function DateNavigator({ startDate, endDate }: DateNavigatorProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: startDate,
        to: endDate
    })
    const [open, setOpen] = useState(false)

    // Determine active filter
    const getActiveFilter = (): QuickFilter => {
        const now = new Date()
        const todayStart = startOfDay(now)
        const todayEnd = endOfDay(now)
        
        if (isSameDay(startDate, todayStart) && isSameDay(endDate, todayEnd)) {
            return 'today'
        }
        
        const yesterday = subDays(now, 1)
        if (isSameDay(startDate, startOfDay(yesterday)) && isSameDay(endDate, endOfDay(yesterday))) {
            return 'yesterday'
        }
        
        const sevenDaysAgo = subDays(todayStart, 7)
        if (isSameDay(startDate, sevenDaysAgo) && isSameDay(endDate, todayEnd)) {
            return '7days'
        }
        
        const thirtyDaysAgo = subDays(todayStart, 30)
        if (isSameDay(startDate, thirtyDaysAgo) && isSameDay(endDate, todayEnd)) {
            return '30days'
        }
        
        const monthStart = startOfMonth(now)
        const monthEnd = endOfMonth(now)
        if (isSameDay(startDate, monthStart) && isSameDay(endDate, monthEnd)) {
            return 'month'
        }
        
        const yearStart = startOfYear(now)
        const yearEnd = endOfYear(now)
        if (isSameDay(startDate, yearStart) && isSameDay(endDate, yearEnd)) {
            return 'year'
        }
        
        return 'custom'
    }

    const activeFilter = getActiveFilter()

    const setPeriod = (start: Date, end: Date) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('start', start.toISOString())
        params.set('end', end.toISOString())
        router.replace(`?${params.toString()}`)
    }

    const handleQuickFilter = (filter: QuickFilter) => {
        const now = new Date()
        let start: Date
        let end: Date

        switch (filter) {
            case 'today':
                start = startOfDay(now)
                end = endOfDay(now)
                break
            case 'yesterday':
                const yesterday = subDays(now, 1)
                start = startOfDay(yesterday)
                end = endOfDay(yesterday)
                break
            case '7days':
                start = subDays(startOfDay(now), 7)
                end = endOfDay(now)
                break
            case '30days':
                start = subDays(startOfDay(now), 30)
                end = endOfDay(now)
                break
            case 'month':
                start = startOfMonth(now)
                end = endOfMonth(now)
                break
            case 'year':
                start = startOfYear(now)
                end = endOfYear(now)
                break
            default:
                return
        }

        setPeriod(start, end)
    }

    const handleMonthNavigation = (direction: 'prev' | 'next') => {
        const currentMonth = direction === 'prev' 
            ? subMonths(startDate, 1) 
            : addMonths(startDate, 1)
        
        const start = startOfMonth(currentMonth)
        const end = endOfMonth(currentMonth)
        setPeriod(start, end)
    }

    const handleCustomRange = () => {
        if (dateRange?.from && dateRange?.to) {
            setPeriod(startOfDay(dateRange.from), endOfDay(dateRange.to))
            setOpen(false)
        }
    }

    const monthYearDisplay = format(startDate, 'MMMM yyyy', { locale: ptBR })
    const customRangeDisplay = activeFilter === 'custom' 
        ? `${format(startDate, 'dd/MM')} - ${format(endDate, 'dd/MM/yyyy')}`
        : null

    return (
        <div className="space-y-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMonthNavigation('prev')}
                        className="h-9 w-9 p-0"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="min-w-[180px] text-center">
                        <span className="text-lg font-semibold capitalize">
                            {monthYearDisplay}
                        </span>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMonthNavigation('next')}
                        className="h-9 w-9 p-0"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                {/* Custom Range Display */}
                {customRangeDisplay && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{customRangeDisplay}</span>
                    </div>
                )}
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
                <Button
                    variant={activeFilter === 'today' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleQuickFilter('today')}
                    className={cn(
                        activeFilter === 'today' && 'bg-purple-600 hover:bg-purple-700'
                    )}
                >
                    Hoje
                </Button>
                <Button
                    variant={activeFilter === 'yesterday' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleQuickFilter('yesterday')}
                    className={cn(
                        activeFilter === 'yesterday' && 'bg-purple-600 hover:bg-purple-700'
                    )}
                >
                    Ontem
                </Button>
                <Button
                    variant={activeFilter === '7days' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleQuickFilter('7days')}
                    className={cn(
                        activeFilter === '7days' && 'bg-purple-600 hover:bg-purple-700'
                    )}
                >
                    7 Dias
                </Button>
                <Button
                    variant={activeFilter === '30days' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleQuickFilter('30days')}
                    className={cn(
                        activeFilter === '30days' && 'bg-purple-600 hover:bg-purple-700'
                    )}
                >
                    30 Dias
                </Button>
                <Button
                    variant={activeFilter === 'month' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleQuickFilter('month')}
                    className={cn(
                        activeFilter === 'month' && 'bg-purple-600 hover:bg-purple-700'
                    )}
                >
                    Mês Atual
                </Button>
                <Button
                    variant={activeFilter === 'year' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleQuickFilter('year')}
                    className={cn(
                        activeFilter === 'year' && 'bg-purple-600 hover:bg-purple-700'
                    )}
                >
                    Ano Atual
                </Button>

                {/* Custom Date Range Picker */}
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant={activeFilter === 'custom' ? 'default' : 'outline'}
                            size="sm"
                            className={cn(
                                'ml-auto',
                                activeFilter === 'custom' && 'bg-purple-600 hover:bg-purple-700'
                            )}
                        >
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            Selecionar Período
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <div className="p-3 space-y-3">
                            <Calendar
                                mode="range"
                                selected={dateRange}
                                onSelect={setDateRange}
                                numberOfMonths={2}
                                locale={ptBR}
                            />
                            <div className="flex justify-end gap-2 pt-2 border-t">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleCustomRange}
                                    disabled={!dateRange?.from || !dateRange?.to}
                                >
                                    Aplicar
                                </Button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}
