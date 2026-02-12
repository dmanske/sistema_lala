import { CashMovement } from '@/core/domain/CashMovement'
import { FilterState } from '@/components/cash/CashFilters'

/**
 * Filters cash movements based on the provided filter state
 * All filters are combined with AND logic
 */
export function filterMovements(
    movements: CashMovement[],
    filters: FilterState
): CashMovement[] {
    return movements.filter(movement => {
        // Type filter
        if (filters.type !== 'ALL' && movement.type !== filters.type) {
            return false
        }

        // Method filter
        if (filters.method !== 'ALL' && movement.method !== filters.method) {
            return false
        }

        // Source filter
        if (filters.source !== 'ALL' && movement.sourceType !== filters.source) {
            return false
        }

        // Account filter
        if (filters.bankAccountId && filters.bankAccountId !== '__ALL__' && movement.bankAccountId !== filters.bankAccountId) {
            return false
        }

        // Text search (case-insensitive, searches description)
        if (filters.searchText) {
            const searchLower = filters.searchText.toLowerCase()
            const description = (movement.description || '').toLowerCase()
            if (!description.includes(searchLower)) {
                return false
            }
        }

        return true
    })
}
