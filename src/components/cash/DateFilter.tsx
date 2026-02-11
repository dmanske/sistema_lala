'use client'

import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

export function DateFilter() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const setPeriod = (start: Date, end: Date) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('start', start.toISOString())
        params.set('end', end.toISOString())
        router.replace(`?${params.toString()}`)
    }

    return (
        <div className="flex gap-2 items-center">
            <Button variant="outline" size="sm" onClick={() => setPeriod(startOfDay(new Date()), endOfDay(new Date()))}>
                Hoje
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPeriod(subDays(startOfDay(new Date()), 7), endOfDay(new Date()))}>
                7 Dias
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPeriod(startOfMonth(new Date()), endOfMonth(new Date()))}>
                Mês Atual
            </Button>
            <div className="ml-auto flex items-center text-sm text-muted-foreground">
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>Período Selecionado</span>
            </div>
        </div>
    )
}
