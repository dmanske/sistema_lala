export interface CashMovement {
    id: string
    tenantId: string
    type: 'IN' | 'OUT'
    amount: number
    method: 'CASH' | 'PIX' | 'CARD' | 'TRANSFER' | 'WALLET'
    sourceType: 'SALE' | 'REFUND' | 'PURCHASE' | 'MANUAL'
    sourceId?: string | null
    description?: string
    occurredAt: Date
    createdBy?: string
    createdAt: Date
}
