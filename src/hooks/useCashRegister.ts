import { useState, useEffect, useCallback } from "react"
import { CashRegisterSummary, CashRegisterSummaryWithUser, CashRegisterWithUser } from "@/core/domain/entities/CashRegister"
import { ObterCaixaAtual } from "@/core/usecases/cash-register/ObterCaixaAtual"
import { ObterHistoricoFechamentos } from "@/core/usecases/cash-register/ObterHistoricoFechamentos"
import { createClient } from "@/lib/supabase/client"

export function useCashRegister() {
    const [currentCashRegister, setCurrentCashRegister] = useState<CashRegisterSummaryWithUser | null>(null)
    const [history, setHistory] = useState<CashRegisterWithUser[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchCurrentCashRegister = useCallback(async () => {
        console.log('📡 [useCashRegister] Buscando caixa atual...')
        try {
            const supabase = createClient()
            const useCase = new ObterCaixaAtual(supabase)
            const summary = await useCase.execute()
            console.log('📦 [useCashRegister] Caixa recebido:', summary ? `ID: ${summary.cashRegister.id}, Status: ${summary.cashRegister.status}` : 'null')
            setCurrentCashRegister(summary)
            setError(null)
        } catch (err) {
            console.error("❌ [useCashRegister] Error fetching current cash register:", err)
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
        console.log('🔄 [useCashRegister] Iniciando refresh...')
        setIsLoading(true)
        await Promise.all([
            fetchCurrentCashRegister(),
            fetchHistory({ status: 'CLOSED' })
        ])
        setIsLoading(false)
        console.log('✅ [useCashRegister] Refresh concluído')
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
