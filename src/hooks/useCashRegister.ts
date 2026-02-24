import { useState, useEffect, useCallback } from "react"
import { CashRegisterSummary, CashRegisterWithUser } from "@/core/domain/entities/CashRegister"
import { ObterCaixaAtual } from "@/core/usecases/cash-register/ObterCaixaAtual"
import { ObterHistoricoFechamentos } from "@/core/usecases/cash-register/ObterHistoricoFechamentos"
import { createClient } from "@/lib/supabase/client"

export function useCashRegister() {
    const [currentCashRegister, setCurrentCashRegister] = useState<CashRegisterSummary | null>(null)
    const [history, setHistory] = useState<CashRegisterWithUser[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchCurrentCashRegister = useCallback(async () => {
        try {
            const supabase = createClient()
            const useCase = new ObterCaixaAtual(supabase)
            const summary = await useCase.execute()
            setCurrentCashRegister(summary)
            setError(null)
        } catch (err) {
            console.error("Error fetching current cash register:", err)
            setError(err instanceof Error ? err.message : "Erro ao buscar caixa atual")
        }
    }, [])

    const fetchHistory = useCallback(async (filters?: {
        startDate?: Date
        endDate?: Date
        openedBy?: string
        status?: 'OPEN' | 'CLOSED'
    }) => {
        try {
            const supabase = createClient()
            const useCase = new ObterHistoricoFechamentos(supabase)
            const result = await useCase.execute(filters)
            setHistory(result.cashRegisters)
            setError(null)
        } catch (err) {
            console.error("Error fetching history:", err)
            setError(err instanceof Error ? err.message : "Erro ao buscar histórico")
        }
    }, [])

    const refresh = useCallback(async () => {
        setIsLoading(true)
        await Promise.all([
            fetchCurrentCashRegister(),
            fetchHistory({ status: 'CLOSED' })
        ])
        setIsLoading(false)
    }, [fetchCurrentCashRegister, fetchHistory])

    useEffect(() => {
        refresh()
    }, [refresh])

    return {
        currentCashRegister,
        history,
        isLoading,
        error,
        refresh,
        fetchHistory,
    }
}
