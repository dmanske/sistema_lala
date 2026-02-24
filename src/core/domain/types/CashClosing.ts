import { PaymentMethod } from '../BankAccount'

/**
 * Breakdown de valores por método de pagamento
 */
export interface PaymentMethodBreakdown {
    method: PaymentMethod
    expected: number
    actual: number
    difference: number
}

/**
 * Input para fechamento de caixa - contagem física por método
 */
export interface CashClosingInput {
    cashRegisterId: string
    closedBy: string
    notes?: string
    // Contagem física por método de pagamento
    breakdown: {
        cash?: number
        pix?: number
        card?: number
        transfer?: number
        wallet?: number
    }
}

/**
 * Resultado do fechamento de caixa com diferenças calculadas
 */
export interface CashClosingResult {
    cashRegisterId: string
    closedAt: Date
    closedBy: string
    // Valores totais
    initialBalance: number
    expectedBalance: number
    actualBalance: number
    totalDifference: number
    // Breakdown detalhado por método
    breakdownByMethod: PaymentMethodBreakdown[]
    // Movimentações do turno
    totalSangria: number
    totalSuprimento: number
    salesCount: number
    totalSales: number
    // Status
    hasDiscrepancy: boolean
    notes?: string
}

/**
 * Resumo de fechamento para listagem
 */
export interface CashClosingSummary {
    id: string
    openedAt: Date
    closedAt: Date
    openedBy: string
    closedBy: string
    initialBalance: number
    finalBalance: number
    difference: number
    status: 'OK' | 'DISCREPANCY'
}
