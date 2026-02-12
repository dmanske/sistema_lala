'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, ShoppingCart, Package } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { MovementGroup } from '@/lib/cash/groupMovements'
import { cn } from '@/lib/utils'

interface CashMovementGroupProps {
    group: MovementGroup
    customerName?: string
    supplierName?: string
}

const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const getMethodLabel = (method: string): string => {
    const labels: Record<string, string> = {
        CASH: 'Dinheiro',
        PIX: 'Pix',
        CARD: 'Cartão',
        TRANSFER: 'Transferência',
        WALLET: 'Carteira'
    }
    return labels[method] || method
}

export function CashMovementGroup({ group, customerName, supplierName }: CashMovementGroupProps) {
    const [expanded, setExpanded] = useState(false)

    const isSale = group.sourceType === 'SALE'
    const displayName = isSale 
        ? (customerName || 'Cliente não encontrado')
        : (supplierName || 'Fornecedor não encontrado')

    const Icon = isSale ? ShoppingCart : Package
    const bgColor = isSale ? 'bg-green-50' : 'bg-blue-50'
    const borderColor = isSale ? 'border-green-200' : 'border-blue-200'
    const textColor = isSale ? 'text-green-700' : 'text-blue-700'

    return (
        <div className={cn('border-2 rounded-lg overflow-hidden', borderColor, bgColor)}>
            {/* Group Header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/50 transition-colors"
            >
                <div className="flex-shrink-0">
                    {expanded ? (
                        <ChevronDown className="h-5 w-5 text-slate-500" />
                    ) : (
                        <ChevronRight className="h-5 w-5 text-slate-500" />
                    )}
                </div>

                <div className={cn('flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center', textColor, 'bg-white')}>
                    <Icon className="h-4 w-4" />
                </div>

                <div className="flex-1 text-left">
                    <div className="font-medium text-slate-900">
                        {isSale ? 'Venda' : 'Compra'} - {displayName}
                    </div>
                    <div className="text-sm text-slate-500">
                        {group.movements.length} pagamento{group.movements.length > 1 ? 's' : ''} • {format(group.date, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                    </div>
                </div>

                <div className="flex-shrink-0 text-right">
                    <div className={cn('text-lg font-bold', textColor)}>
                        {formatCurrency(group.total)}
                    </div>
                    {group.change > 0 && (
                        <div className="text-sm text-amber-600">
                            Troco: {formatCurrency(group.change)}
                        </div>
                    )}
                </div>
            </button>

            {/* Child Rows */}
            {expanded && (
                <div className="border-t border-slate-200 bg-white/50">
                    {group.movements.map((movement, index) => (
                        <div
                            key={movement.id}
                            className={cn(
                                'px-4 py-2 flex items-center gap-3 text-sm',
                                index !== group.movements.length - 1 && 'border-b border-slate-100'
                            )}
                        >
                            <div className="w-8" /> {/* Spacer for indentation */}
                            
                            <div className="flex-1">
                                <span className="font-medium text-slate-700">
                                    {getMethodLabel(movement.method)}
                                </span>
                            </div>

                            <div className="text-slate-600">
                                {format(movement.occurredAt, 'HH:mm', { locale: ptBR })}
                            </div>

                            <div className="font-semibold text-slate-900 min-w-[100px] text-right">
                                {formatCurrency(movement.amount)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
