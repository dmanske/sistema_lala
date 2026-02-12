'use client'

import { useMemo } from 'react'
import { CashMovement } from '@/core/domain/CashMovement'
import { aggregateByMethod } from '@/lib/cash/aggregateByMethod'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { TrendingUp } from 'lucide-react'

interface PaymentMethodSummaryProps {
    movements: CashMovement[]
}

const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const METHOD_COLORS: Record<string, string> = {
    PIX: '#10b981',
    CARD: '#3b82f6',
    CASH: '#f59e0b',
    TRANSFER: '#8b5cf6',
    WALLET: '#ec4899'
}

export function PaymentMethodSummary({ movements }: PaymentMethodSummaryProps) {
    const methodData = useMemo(() => aggregateByMethod(movements), [movements])

    if (methodData.length === 0) {
        return null
    }

    const total = methodData.reduce((sum, m) => sum + m.total, 0)

    return (
        <div className="rounded-xl border border-white/20 bg-white/40 backdrop-blur-sm p-6 space-y-6">
            <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold">Entradas por Método de Pagamento</h3>
            </div>

            {/* Chart */}
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={methodData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis 
                            dataKey="label" 
                            tick={{ fontSize: 12 }}
                            stroke="#64748b"
                        />
                        <YAxis 
                            tick={{ fontSize: 12 }}
                            stroke="#64748b"
                            tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                            formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : ''}
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                        />
                        <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                            {methodData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={METHOD_COLORS[entry.method] || '#94a3b8'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* List */}
            <div className="space-y-2">
                {methodData.map((method) => (
                    <div
                        key={method.method}
                        className="flex items-center justify-between p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: METHOD_COLORS[method.method] || '#94a3b8' }}
                            />
                            <div>
                                <div className="font-medium text-slate-900">{method.label}</div>
                                <div className="text-xs text-slate-500">
                                    {method.count} transaç{method.count === 1 ? 'ão' : 'ões'}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="font-bold text-slate-900">{formatCurrency(method.total)}</div>
                            <div className="text-xs text-slate-500">
                                {((method.total / total) * 100).toFixed(1)}%
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Total de Entradas</span>
                    <span className="text-xl font-bold text-green-600">{formatCurrency(total)}</span>
                </div>
            </div>
        </div>
    )
}
