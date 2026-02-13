import { CashMovement } from '@/core/domain/CashMovement'

export interface MethodAggregate {
    method: string
    label: string
    total: number
    count: number
}

const METHOD_LABELS: Record<string, string> = {
    CASH: 'Dinheiro',
    PIX: 'Pix',
    CARD: 'Cartão',
    TRANSFER: 'Transferência',
    WALLET: 'Carteira',
    CREDIT: 'Recarga de Crédito' // Fallback para recargas antigas
}

/**
 * Aggregates cash movements by payment method
 * Only considers IN movements (income)
 * Returns sorted by total (highest first)
 */
export function aggregateByMethod(movements: CashMovement[]): MethodAggregate[] {
    const methodMap = new Map<string, { total: number; count: number }>()

    // Aggregate IN movements only
    movements
        .filter(m => m.type === 'IN')
        .forEach(m => {
            const existing = methodMap.get(m.method) || { total: 0, count: 0 }
            existing.total += m.amount
            existing.count += 1
            methodMap.set(m.method, existing)
        })

    // Convert to array and sort
    const result: MethodAggregate[] = Array.from(methodMap.entries()).map(([method, data]) => ({
        method,
        label: METHOD_LABELS[method] || method,
        total: data.total,
        count: data.count
    }))

    // Sort by total (highest first)
    result.sort((a, b) => b.total - a.total)

    return result
}
