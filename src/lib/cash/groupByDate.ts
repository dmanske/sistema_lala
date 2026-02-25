import { CashMovement } from '@/core/domain/CashMovement'
import { format, isSameDay, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export interface DayGroup {
    date: Date
    dateKey: string
    displayDate: string
    movements: CashMovement[]
    totalIn: number
    totalOut: number
    netAmount: number
}

export function groupMovementsByDay(movements: CashMovement[]): DayGroup[] {
    // Agrupar por dia
    const groupMap = new Map<string, CashMovement[]>()

    movements.forEach(movement => {
        const date = new Date(movement.occurredAt)
        const dateKey = format(startOfDay(date), 'yyyy-MM-dd')
        
        if (!groupMap.has(dateKey)) {
            groupMap.set(dateKey, [])
        }
        groupMap.get(dateKey)!.push(movement)
    })

    // Converter para array e calcular totais
    const groups: DayGroup[] = Array.from(groupMap.entries()).map(([dateKey, movements]) => {
        const date = new Date(dateKey)
        
        const totalIn = movements
            .filter(m => m.type === 'IN')
            .reduce((sum, m) => sum + m.amount, 0)
        
        const totalOut = movements
            .filter(m => m.type === 'OUT')
            .reduce((sum, m) => sum + m.amount, 0)

        // Ordenar movimentos do dia por hora (mais recente primeiro)
        const sortedMovements = movements.sort((a, b) => 
            new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
        )

        return {
            date,
            dateKey,
            displayDate: format(date, "EEEE, dd 'de' MMMM", { locale: ptBR }),
            movements: sortedMovements,
            totalIn,
            totalOut,
            netAmount: totalIn - totalOut
        }
    })

    // Ordenar grupos por data (mais recente primeiro)
    return groups.sort((a, b) => b.date.getTime() - a.date.getTime())
}
