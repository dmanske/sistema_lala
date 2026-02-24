import { CashClosingInput, CashClosingResult } from '@/core/domain/types/CashClosing'
import { createClient } from '@/lib/supabase/client'
import { SupabaseClient } from '@supabase/supabase-js'

export class FecharCaixa {
    private supabase: SupabaseClient

    constructor(client?: SupabaseClient) {
        this.supabase = client || createClient()
    }

    async execute(input: CashClosingInput): Promise<CashClosingResult> {
        this.validateInput(input)

        // Calculate total actual balance from breakdown
        const actualBalance = this.calculateTotalFromBreakdown(input.breakdown)

        // Call the RPC to close the cash register
        const { data, error } = await this.supabase.rpc('fechar_caixa_rpc', {
            p_cash_register_id: input.cashRegisterId,
            p_actual_balance: actualBalance,
            p_closed_by: input.closedBy,
            p_notes: input.notes || null
        })

        if (error) {
            throw new Error(`Failed to close cash register: ${error.message}`)
        }

        if (!data) {
            throw new Error('Failed to close cash register: No data returned from RPC')
        }

        // Transform RPC result to CashClosingResult
        return this.transformRpcResult(data, input.breakdown)
    }

    private validateInput(input: CashClosingInput): void {
        if (!input.cashRegisterId || input.cashRegisterId.trim() === '') {
            throw new Error('Cash register ID is required')
        }

        if (!input.closedBy || input.closedBy.trim() === '') {
            throw new Error('Closed by user ID is required')
        }

        // Validate that at least one breakdown value is provided
        const hasBreakdown = Object.values(input.breakdown).some(value => value !== undefined && value > 0)
        if (!hasBreakdown) {
            throw new Error('At least one payment method breakdown value must be provided')
        }

        // Validate that all breakdown values are non-negative
        Object.entries(input.breakdown).forEach(([method, value]) => {
            if (value !== undefined && value < 0) {
                throw new Error(`Breakdown value for ${method} cannot be negative`)
            }
        })
    }

    private calculateTotalFromBreakdown(breakdown: CashClosingInput['breakdown']): number {
        return (
            (breakdown.cash || 0) +
            (breakdown.pix || 0) +
            (breakdown.card || 0) +
            (breakdown.transfer || 0) +
            (breakdown.wallet || 0)
        )
    }

    private transformRpcResult(
        rpcData: any,
        breakdown: CashClosingInput['breakdown']
    ): CashClosingResult {
        // The RPC returns a simplified result with only cash totals
        // We need to build the breakdown by method based on the input
        // Note: The current RPC only tracks CASH sales, so we'll only have accurate data for cash
        const totalDifference = rpcData.difference || 0

        return {
            cashRegisterId: rpcData.cash_register_id,
            closedAt: new Date(rpcData.closed_at),
            closedBy: rpcData.closed_by,
            initialBalance: rpcData.initial_balance || 0,
            expectedBalance: rpcData.expected_balance || 0,
            actualBalance: rpcData.actual_balance || 0,
            totalDifference,
            breakdownByMethod: this.buildBreakdownByMethod(rpcData, breakdown),
            totalSangria: Math.abs(Math.min(rpcData.movements_total || 0, 0)),
            totalSuprimento: Math.max(rpcData.movements_total || 0, 0),
            salesCount: 0, // Not provided by current RPC
            totalSales: rpcData.sales_cash_total || 0,
            hasDiscrepancy: Math.abs(totalDifference) > 0.01, // Allow for small rounding errors
            notes: rpcData.notes
        }
    }

    private buildBreakdownByMethod(
        rpcData: any,
        breakdown: CashClosingInput['breakdown']
    ): CashClosingResult['breakdownByMethod'] {
        // The RPC currently only tracks cash sales
        // For a complete implementation, we would need to query sales by payment method
        // For now, we'll create a breakdown based on the input and assume cash is the primary method
        
        const expectedCash = rpcData.expected_balance || 0
        const actualCash = breakdown.cash || 0
        const differenceCash = actualCash - expectedCash

        const result: CashClosingResult['breakdownByMethod'] = []

        // Add cash breakdown (the only one we have accurate data for)
        if (breakdown.cash !== undefined) {
            result.push({
                method: 'CASH',
                expected: expectedCash,
                actual: actualCash,
                difference: differenceCash
            })
        }

        // For other methods, we don't have expected values from the RPC
        // So we'll just show actual values with 0 expected (this is a limitation of the current RPC)
        if (breakdown.pix !== undefined && breakdown.pix > 0) {
            result.push({
                method: 'PIX',
                expected: 0,
                actual: breakdown.pix,
                difference: breakdown.pix
            })
        }

        if (breakdown.card !== undefined && breakdown.card > 0) {
            result.push({
                method: 'CARD',
                expected: 0,
                actual: breakdown.card,
                difference: breakdown.card
            })
        }

        if (breakdown.transfer !== undefined && breakdown.transfer > 0) {
            result.push({
                method: 'TRANSFER',
                expected: 0,
                actual: breakdown.transfer,
                difference: breakdown.transfer
            })
        }

        if (breakdown.wallet !== undefined && breakdown.wallet > 0) {
            result.push({
                method: 'WALLET',
                expected: 0,
                actual: breakdown.wallet,
                difference: breakdown.wallet
            })
        }

        return result
    }
}
