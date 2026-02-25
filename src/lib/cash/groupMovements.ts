import { CashMovement } from '@/core/domain/CashMovement'

export interface MovementGroup {
    _type: 'group'
    sourceId: string
    sourceType: 'SALE' | 'PURCHASE'
    movements: CashMovement[]
    total: number
    change: number
    date: Date
}

export interface SingleMovement extends CashMovement {
    _type: 'single'
}

export type GroupedMovement = MovementGroup | SingleMovement

/**
 * Groups cash movements by sourceId for SALE and PURCHASE types with multiple payments
 * Returns a mixed array of MovementGroup and single CashMovement objects
 * Sorted by date (most recent first)
 */
export function groupMovements(movements: CashMovement[]): GroupedMovement[] {
    // Group by sourceId
    const grouped = new Map<string, CashMovement[]>()
    const singles: CashMovement[] = []

    for (const movement of movements) {
        // Only group SALE and PURCHASE with sourceId
        if (
            movement.sourceId && 
            (movement.sourceType === 'SALE' || movement.sourceType === 'PURCHASE')
        ) {
            const key = `${movement.sourceType}-${movement.sourceId}`
            const existing = grouped.get(key) || []
            existing.push(movement)
            grouped.set(key, existing)
        } else {
            singles.push(movement)
        }
    }

    // Convert groups to MovementGroup objects (only if multiple payments)
    const result: GroupedMovement[] = []

    for (const [, groupMovements] of grouped) {
        if (groupMovements.length > 1) {
            // Multiple payments - create group
            const total = groupMovements.reduce((sum, m) => sum + m.amount, 0)
            const change = groupMovements.reduce((sum, m) => {
                // Change is stored as negative OUT movement in some cases
                // or we need to calculate from the payment details
                return sum
            }, 0)

            result.push({
                _type: 'group',
                sourceId: groupMovements[0].sourceId!,
                sourceType: groupMovements[0].sourceType as 'SALE' | 'PURCHASE',
                movements: groupMovements,
                total,
                change,
                date: groupMovements[0].occurredAt
            })
        } else {
            // Single payment - add as single
            singles.push({ ...groupMovements[0], _type: 'single' } as SingleMovement)
        }
    }

    // Add all singles
    for (const single of singles) {
        result.push({ ...single, _type: 'single' } as SingleMovement)
    }

    // Sort by date (most recent first)
    result.sort((a, b) => {
        const dateA = a._type === 'group' ? a.date : a.occurredAt
        const dateB = b._type === 'group' ? b.date : b.occurredAt
        
        // Handle null dates
        if (!dateA && !dateB) return 0
        if (!dateA) return 1
        if (!dateB) return -1
        
        return dateB.getTime() - dateA.getTime()
    })

    return result
}
