'use client'

import { useMemo } from 'react'
import { CashMovement } from '@/core/domain/CashMovement'
import { aggregateByAccount } from '@/lib/cash/aggregateByAccount'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts'
import { Building2, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface AccountSummaryProps {
    movements: CashMovement[]
    accountNames: Record<string, string>
}

const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6']

export function AccountSummary({ movements, accountNames }: AccountSummaryProps) {
    const accountData = useMemo(() => aggregateByAccount(movements, accountNames), [movements, accountNames])

    if (accountData.length === 0) {
        return null
    }

    // Prepare chart data
    const chartData = accountData.map(acc => ({
        name: acc.accountName.length > 15 ? acc.accountName.substring(0, 15) + '...' : acc.accountName,
        fullName: acc.accountName,
        Entradas: acc.totalIn,
        Saídas: acc.totalOut,
        Saldo: acc.balance
    }))

    return (
        <div className="rounded-xl border border-white/20 bg-white/40 backdrop-blur-sm p-6 space-y-6">
            <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold">Resumo por Conta Bancária</h3>
            </div>

            {/* Chart */}
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis 
                            dataKey="name" 
                            tick={{ fontSize: 11 }}
                            stroke="#64748b"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                        />
                        <YAxis 
                            tick={{ fontSize: 12 }}
                            stroke="#64748b"
                            tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                            formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : ''}
                            labelFormatter={(label) => {
                                const item = chartData.find(d => d.name === label)
                                return item?.fullName || label
                            }}
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                        />
                        <Legend 
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="circle"
                        />
                        <Bar dataKey="Entradas" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Saídas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Saldo" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* List */}
            <div className="space-y-2">
                {accountData.map((account, index) => (
                    <div
                        key={account.accountId}
                        className="flex items-center justify-between p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-colors"
                    >
                        <div className="flex items-center gap-3 flex-1">
                            <div
                                className="h-3 w-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-slate-900 truncate">{account.accountName}</div>
                                <div className="text-xs text-slate-500">
                                    {account.movementCount} movimentaç{account.movementCount === 1 ? 'ão' : 'ões'}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-xs text-slate-500">Entradas</div>
                                <div className="font-semibold text-green-600">{formatCurrency(account.totalIn)}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-slate-500">Saídas</div>
                                <div className="font-semibold text-rose-600">{formatCurrency(account.totalOut)}</div>
                            </div>
                            <div className="text-right min-w-[100px]">
                                <div className="text-xs text-slate-500">Saldo</div>
                                <div className={`font-bold ${account.balance >= 0 ? 'text-purple-600' : 'text-rose-600'}`}>
                                    {formatCurrency(account.balance)}
                                </div>
                            </div>
                            <Link href={`/contas/${account.accountId}`}>
                                <Button variant="ghost" size="sm" className="h-8">
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
