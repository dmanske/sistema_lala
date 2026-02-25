'use client'

import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react'
import { format, startOfMonth, endOfMonth, startOfYear, isSameMonth, addYears, subYears, startOfDay, endOfDay, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type DayFilter = 'TODAY' | 'YESTERDAY' | 'LAST_7' | 'LAST_30' | 'MONTH' | null

interface AccountStatementTabsProps {
    currentStart: Date
    currentEnd: Date
    searchText: string
    onSearchChange: (value: string) => void
    filterType: 'ALL' | 'IN' | 'OUT'
    onFilterTypeChange: (value: 'ALL' | 'IN' | 'OUT') => void
    filterMethod: string
    onFilterMethodChange: (value: string) => void
    onPeriodChange: (start: Date, end: Date) => void
    resultCount: number
    totalCount: number
}

export function AccountStatementTabs({ 
    currentStart, 
    currentEnd, 
    searchText, 
    onSearchChange,
    filterType,
    onFilterTypeChange,
    filterMethod,
    onFilterMethodChange,
    onPeriodChange,
    resultCount,
    totalCount 
}: AccountStatementTabsProps) {
    
    // Detectar qual filtro de dia está ativo
    const activeDayFilter = useMemo((): DayFilter => {
        const now = new Date()
        const today = startOfDay(now)
        const todayEnd = endOfDay(now)
        const yesterday = startOfDay(subDays(now, 1))
        const yesterdayEnd = endOfDay(subDays(now, 1))
        const last7Start = startOfDay(subDays(now, 6))
        const last30Start = startOfDay(subDays(now, 29))
        
        // Verificar se é hoje
        if (currentStart.getTime() === today.getTime() && currentEnd.getTime() === todayEnd.getTime()) {
            return 'TODAY'
        }
        
        // Verificar se é ontem
        if (currentStart.getTime() === yesterday.getTime() && currentEnd.getTime() === yesterdayEnd.getTime()) {
            return 'YESTERDAY'
        }
        
        // Verificar se é últimos 7 dias
        if (currentStart.getTime() === last7Start.getTime() && currentEnd.getTime() === todayEnd.getTime()) {
            return 'LAST_7'
        }
        
        // Verificar se é últimos 30 dias
        if (currentStart.getTime() === last30Start.getTime() && currentEnd.getTime() === todayEnd.getTime()) {
            return 'LAST_30'
        }
        
        // Verificar se é um mês completo
        const monthStart = startOfMonth(currentStart)
        const monthEnd = endOfMonth(currentStart)
        if (currentStart.getTime() === monthStart.getTime() && currentEnd.getTime() === monthEnd.getTime()) {
            return 'MONTH'
        }
        
        return null
    }, [currentStart, currentEnd])
    
    // Gerar todos os 12 meses do ano atual
    const { months, currentYear } = useMemo(() => {
        const result = []
        const yearStart = startOfYear(currentStart)
        const year = yearStart.getFullYear()
        
        for (let i = 0; i < 12; i++) {
            const date = new Date(year, i, 1)
            const start = startOfMonth(date)
            const end = endOfMonth(date)
            
            result.push({
                date,
                start,
                end,
                label: format(date, 'MMM', { locale: ptBR }),
                fullLabel: format(date, 'MMMM', { locale: ptBR }),
                isActive: isSameMonth(date, currentStart)
            })
        }
        
        return { months: result, currentYear: year }
    }, [currentStart])

    const handleMonthClick = (start: Date, end: Date) => {
        onPeriodChange(start, end)
    }

    const handlePrevYear = () => {
        const newDate = subYears(currentStart, 1)
        const newStart = startOfMonth(newDate)
        const newEnd = endOfMonth(newDate)
        handleMonthClick(newStart, newEnd)
    }

    const handleNextYear = () => {
        const newDate = addYears(currentStart, 1)
        const newStart = startOfMonth(newDate)
        const newEnd = endOfMonth(newDate)
        handleMonthClick(newStart, newEnd)
    }

    const handleDayFilter = (filter: DayFilter) => {
        const now = new Date()
        let start: Date
        let end: Date
        
        switch (filter) {
            case 'TODAY':
                start = startOfDay(now)
                end = endOfDay(now)
                break
            case 'YESTERDAY':
                start = startOfDay(subDays(now, 1))
                end = endOfDay(subDays(now, 1))
                break
            case 'LAST_7':
                start = startOfDay(subDays(now, 6))
                end = endOfDay(now)
                break
            case 'LAST_30':
                start = startOfDay(subDays(now, 29))
                end = endOfDay(now)
                break
            default:
                return
        }
        
        handleMonthClick(start, end)
    }

    const handleClearSearch = () => {
        onSearchChange('')
    }

    const hasSearch = searchText.length > 0
    const hasFilters = filterType !== 'ALL' || filterMethod !== 'ALL'

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3 bg-muted/30 rounded-lg p-2">
                {/* Filtro de Período */}
                <Select
                    value={activeDayFilter || 'MONTH'}
                    onValueChange={(val: any) => {
                        if (val === 'MONTH') {
                            // Voltar para o mês atual
                            const now = new Date()
                            const start = startOfMonth(now)
                            const end = endOfMonth(now)
                            handleMonthClick(start, end)
                        } else {
                            handleDayFilter(val)
                        }
                    }}
                >
                    <SelectTrigger className="h-8 w-[130px] text-xs">
                        <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="TODAY">Hoje</SelectItem>
                        <SelectItem value="YESTERDAY">Ontem</SelectItem>
                        <SelectItem value="LAST_7">Últimos 7 dias</SelectItem>
                        <SelectItem value="LAST_30">Últimos 30 dias</SelectItem>
                        <SelectItem value="MONTH">Mês completo</SelectItem>
                    </SelectContent>
                </Select>

                {/* Separador */}
                <div className="h-6 w-px bg-border shrink-0" />

                {/* Navegação de Ano */}
                <div className="flex items-center gap-1 shrink-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handlePrevYear}
                        className="h-8 w-8"
                        title="Ano anterior"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm font-semibold text-foreground min-w-[60px] text-center">
                        {currentYear}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleNextYear}
                        className="h-8 w-8"
                        title="Próximo ano"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                {/* Separador */}
                <div className="h-6 w-px bg-border shrink-0" />

                {/* Abas de Meses */}
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide flex-1">
                    {months.map((month) => (
                        <Button
                            key={month.date.toISOString()}
                            variant={month.isActive ? "default" : "ghost"}
                            size="sm"
                            onClick={() => handleMonthClick(month.start, month.end)}
                            className={cn(
                                "h-8 px-3 capitalize shrink-0 transition-all text-xs",
                                month.isActive && "shadow-sm font-semibold"
                            )}
                            title={month.fullLabel}
                        >
                            {month.label}
                        </Button>
                    ))}
                </div>

                {/* Separador */}
                <div className="h-6 w-px bg-border shrink-0" />

                {/* Filtro de Tipo */}
                <Select
                    value={filterType}
                    onValueChange={(val: any) => onFilterTypeChange(val)}
                >
                    <SelectTrigger className="h-8 w-[110px] text-xs">
                        <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Todos</SelectItem>
                        <SelectItem value="IN">Entradas</SelectItem>
                        <SelectItem value="OUT">Saídas</SelectItem>
                    </SelectContent>
                </Select>

                {/* Filtro de Método */}
                <Select
                    value={filterMethod}
                    onValueChange={onFilterMethodChange}
                >
                    <SelectTrigger className="h-8 w-[120px] text-xs">
                        <SelectValue placeholder="Método" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Todos</SelectItem>
                        <SelectItem value="PIX">PIX</SelectItem>
                        <SelectItem value="CARD">Cartão</SelectItem>
                        <SelectItem value="CASH">Dinheiro</SelectItem>
                        <SelectItem value="TRANSFER">Transferência</SelectItem>
                        <SelectItem value="WALLET">Carteira</SelectItem>
                    </SelectContent>
                </Select>

                {/* Separador */}
                <div className="h-6 w-px bg-border shrink-0" />

                {/* Busca Integrada */}
                <div className="relative w-[200px] shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Buscar..."
                        value={searchText}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9 pr-9 h-8 text-sm"
                    />
                    {hasSearch && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleClearSearch}
                            className="absolute right-0.5 top-1/2 -translate-y-1/2 h-7 w-7"
                        >
                            <X className="h-3.5 w-3.5" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Contador de Resultados */}
            {(hasSearch || hasFilters) && (
                <div className="text-xs text-muted-foreground px-1">
                    {resultCount === totalCount ? (
                        `${totalCount} ${totalCount === 1 ? 'transação' : 'transações'}`
                    ) : (
                        <>
                            Exibindo <strong className="text-foreground">{resultCount}</strong> de {totalCount} transações
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
