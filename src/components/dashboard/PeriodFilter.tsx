'use client'

import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, isSameDay } from 'date-fns'

type PeriodType = 'TODAY' | 'YESTERDAY' | 'LAST_7' | 'LAST_30' | 'MONTH' | 'CUSTOM'

interface PeriodFilterProps {
    currentStart: Date
    currentEnd: Date
    onChange: (start: Date, end: Date) => void
}

export function PeriodFilter({ currentStart, currentEnd, onChange }: PeriodFilterProps) {
    // Detectar período ativo
    const activePeriod = useMemo((): PeriodType => {
        const now = new Date()
        const today = startOfDay(now)
        const todayEnd = endOfDay(now)
        const yesterday = startOfDay(subDays(now, 1))
        const yesterdayEnd = endOfDay(subDays(now, 1))
        const last7Start = startOfDay(subDays(now, 6))
        const last30Start = startOfDay(subDays(now, 29))
        const monthStart = startOfMonth(now)
        const monthEnd = endOfMonth(now)

        if (isSameDay(currentStart, today) && isSameDay(currentEnd, todayEnd)) {
            return 'TODAY'
        }
        if (isSameDay(currentStart, yesterday) && isSameDay(currentEnd, yesterdayEnd)) {
            return 'YESTERDAY'
        }
        if (isSameDay(currentStart, last7Start) && isSameDay(currentEnd, todayEnd)) {
            return 'LAST_7'
        }
        if (isSameDay(currentStart, last30Start) && isSameDay(currentEnd, todayEnd)) {
            return 'LAST_30'
        }
        if (isSameDay(currentStart, monthStart) && isSameDay(currentEnd, monthEnd)) {
            return 'MONTH'
        }
        return 'CUSTOM'
    }, [currentStart, currentEnd])

    const handlePeriodChange = (period: PeriodType) => {
        const now = new Date()
        let start: Date
        let end: Date

        switch (period) {
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
            case 'MONTH':
                start = startOfMonth(now)
                end = endOfMonth(now)
                break
            default:
                return
        }

        onChange(start, end)
    }

    return (
        <Select
            value={activePeriod}
            onValueChange={(val: any) => handlePeriodChange(val)}
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
    )
}
