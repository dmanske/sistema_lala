import { CashMovement } from '@/core/domain/CashMovement'

export interface AccountAggregate {
    accountId: string
    accountName: string
    totalIn: number
    totalOut: number
    balance: number
    movementCount: number
}

/**
 * Aggregates cash movements by bank account
 * Calculates total IN, total OUT, and balance for each account
 * Returns sorted by balance (highest first)
 */
export function aggregateByAccount(
    movements: CashMovement[],
    accountNames: Record<string, string>
): AccountAggregate[] {
    const accountMap = new Map<string, { totalIn: number; totalOut: number; count: number }>()

    movements.forEach(m => {
        const existing = accountMap.get(m.bankAccountId) || { totalIn: 0, totalOut: 0, count: 0 }
        
        if (m.type === 'IN') {
            existing.totalIn += m.amount
        } else {
            existing.totalOut += m.amount
        }
        existing.count += 1
        
        accountMap.set(m.bankAccountId, existing)
    })

    // Convert to array
    const result: AccountAggregate[] = Array.from(accountMap.entries()).map(([accountId, data]) => ({
        accountId,
        accountName: accountNames[accountId] || 'Conta Desconhecida',
        totalIn: data.totalIn,
        totalOut: data.totalOut,
        balance: data.totalIn - data.totalOut,
        movementCount: data.count
    }))

    // Sort by balance (highest first)
    result.sort((a, b) => b.balance - a.balance)

    return result
}
