'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { AccountStatement, MovementWithBalance } from '@/core/domain/BankAccount'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatementFilters, FilterValues } from './StatementFilters'
import { ArrowDownCircle, ArrowUpCircle, Download, RefreshCw, TrendingUp, TrendingDown, DollarSign, Hash } from 'lucide-react'
import { format, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatBrazilDate, toBrazilTime } from '@/lib/utils/dateUtils'

interface EnhancedAccountStatementViewProps {
    statement: AccountStatement
    onRefresh?: () => void
    loading?: boolean
}

interface SaleAppointmentMap {
    [saleId: string]: string // Maps sale ID to appointment ID
}

export function EnhancedAccountStatementView({ statement, onRefresh, loading }: EnhancedAccountStatementViewProps) {
    const [filters, setFilters] = useState<FilterValues>({
        type: 'all',
        method: 'all',
        source: 'all',
        searchText: ''
    })
    const [saleAppointments, setSaleAppointments] = useState<SaleAppointmentMap>({})

    // Fetch appointment IDs for all sales
    useEffect(() => {
        const fetchSaleAppointments = async () => {
            const saleIds = statement.movements
                .filter(m => m.sourceType === 'SALE' && m.sourceId)
                .map(m => m.sourceId!)
            
            if (saleIds.length === 0) return

            const supabase = createClient()
            const { data } = await supabase
                .from('sales')
                .select('id, appointment_id')
                .in('id', saleIds)

            if (data) {
                const map: SaleAppointmentMap = {}
                data.forEach(sale => {
                    if (sale.appointment_id) {
                        map[sale.id] = sale.appointment_id
                    }
                })
                setSaleAppointments(map)
            }
        }

        fetchSaleAppointments()
    }, [statement.movements])

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value)
    }

    const formatDate = (date: Date) => {
        return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    }

    const formatDateHeader = (date: Date) => {
        return format(date, "dd/MM/yyyy (EEEE)", { locale: ptBR })
    }

    // Apply filters
    const filteredMovements = useMemo(() => {
        let result = statement.movements

        // Period filter
        if (filters.startDate) {
            result = result.filter(m => m.occurredAt >= filters.startDate!)
        }
        if (filters.endDate) {
            result = result.filter(m => m.occurredAt <= filters.endDate!)
        }

        // Type filter
        if (filters.type !== 'all') {
            result = result.filter(m => 
                filters.type === 'in' ? m.type === 'IN' : m.type === 'OUT'
            )
        }

        // Method filter
        if (filters.method !== 'all') {
            result = result.filter(m => m.method === filters.method)
        }

        // Source filter
        if (filters.source !== 'all') {
            result = result.filter(m => m.sourceType === filters.source)
        }

        // Search filter
        if (filters.searchText) {
            const search = filters.searchText.toLowerCase()
            result = result.filter(m =>
                m.description?.toLowerCase().includes(search) ||
                m.customerName?.toLowerCase().includes(search) ||
                m.supplierName?.toLowerCase().includes(search)
            )
        }

        return result
    }, [statement.movements, filters])

    // Group by date
    const groupedMovements = useMemo(() => {
        const groups = new Map<string, MovementWithBalance[]>()
        
        // Sort by date descending (newest first)
        const sorted = [...filteredMovements].sort((a, b) => 
            b.occurredAt.getTime() - a.occurredAt.getTime()
        )

        sorted.forEach(movement => {
            // Convert to Brazil time before grouping by date
            const brazilDate = toBrazilTime(movement.occurredAt)
            const dateKey = format(brazilDate, 'yyyy-MM-dd')
            if (!groups.has(dateKey)) {
                groups.set(dateKey, [])
            }
            groups.get(dateKey)!.push(movement)
        })

        return Array.from(groups.entries()).map(([dateStr, movements]) => {
            const date = new Date(dateStr)
            const dailyTotal = movements.reduce((sum, m) => 
                sum + (m.type === 'IN' ? m.amount : -m.amount), 0
            )
            return { date, movements, dailyTotal }
        })
    }, [filteredMovements])

    // Calculate extended stats
    const extendedStats = useMemo(() => {
        const entries = filteredMovements.filter(m => m.type === 'IN')
        const exits = filteredMovements.filter(m => m.type === 'OUT')

        return {
            highestEntry: entries.length > 0 ? Math.max(...entries.map(m => m.amount)) : 0,
            highestExit: exits.length > 0 ? Math.max(...exits.map(m => m.amount)) : 0,
            averageTicket: filteredMovements.length > 0 
                ? filteredMovements.reduce((sum, m) => sum + m.amount, 0) / filteredMovements.length 
                : 0,
            transactionCount: filteredMovements.length
        }
    }, [filteredMovements])

    // Calculate filtered summary
    const filteredSummary = useMemo(() => {
        const totalIn = filteredMovements
            .filter(m => m.type === 'IN')
            .reduce((sum, m) => sum + m.amount, 0)
        
        const totalOut = filteredMovements
            .filter(m => m.type === 'OUT')
            .reduce((sum, m) => sum + m.amount, 0)

        return {
            totalIn,
            totalOut,
            net: totalIn - totalOut
        }
    }, [filteredMovements])

    const getMethodLabel = (method: string) => {
        const labels: Record<string, string> = {
            'PIX': 'PIX',
            'CARD': 'Cartão',
            'CASH': 'Dinheiro',
            'TRANSFER': 'Transferência',
            'WALLET': 'Carteira'
        }
        return labels[method] || method
    }

    const getSourceLink = (movement: MovementWithBalance) => {
        if (!movement.sourceId) return null
        
        switch (movement.sourceType) {
            case 'SALE':
                // Use the sale_id directly from the movement to find the correct appointment
                // This ensures we get the paid sale, not a draft one
                const appointmentId = saleAppointments[movement.sourceId]
                return appointmentId ? `/appointments/${appointmentId}/checkout` : null
            case 'PURCHASE':
                return `/purchases/${movement.sourceId}`
            default:
                return null
        }
    }

    return (
        <div className="space-y-6">
            {/* Account Header */}
            <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <span className="text-4xl">{statement.account.icon}</span>
                                <div>
                                    <CardTitle className="text-2xl">{statement.account.name}</CardTitle>
                                    <p className="text-purple-100 text-sm">{statement.account.type === 'BANK' ? 'Banco' : statement.account.type === 'CARD' ? 'Cartão' : 'Carteira Digital'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {onRefresh && (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={onRefresh}
                                    disabled={loading}
                                >
                                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                    Atualizar
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-card/50 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Saldo Inicial</div>
                        <div className="text-2xl font-bold">{formatCurrency(statement.summary.initialBalance)}</div>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            Total Entradas
                        </div>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(filteredSummary.totalIn)}</div>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <TrendingDown className="h-4 w-4" />
                            Total Saídas
                        </div>
                        <div className="text-2xl font-bold text-red-600">{formatCurrency(filteredSummary.totalOut)}</div>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Saldo Atual</div>
                        <div className="text-2xl font-bold">{formatCurrency(statement.summary.currentBalance)}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Extended Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-card/50 backdrop-blur-sm border-green-200">
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Maior Entrada</div>
                        <div className="text-xl font-bold text-green-600">{formatCurrency(extendedStats.highestEntry)}</div>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-red-200">
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Maior Saída</div>
                        <div className="text-xl font-bold text-red-600">{formatCurrency(extendedStats.highestExit)}</div>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-blue-200">
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            Ticket Médio
                        </div>
                        <div className="text-xl font-bold text-blue-600">{formatCurrency(extendedStats.averageTicket)}</div>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-purple-200">
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Hash className="h-4 w-4" />
                            Transações
                        </div>
                        <div className="text-xl font-bold text-purple-600">{extendedStats.transactionCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <StatementFilters 
                onFilterChange={setFilters}
                resultCount={filteredMovements.length}
            />

            {/* Movements by Date */}
            <div className="space-y-4">
                {groupedMovements.length === 0 ? (
                    <Card className="bg-card/50 backdrop-blur-sm">
                        <CardContent className="py-12 text-center">
                            <div className="text-muted-foreground">
                                <p className="text-lg font-medium">Nenhuma movimentação encontrada</p>
                                <p className="text-sm mt-2">Ajuste os filtros ou registre uma nova transação</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    groupedMovements.map(({ date, movements, dailyTotal }) => (
                        <Card key={date.toISOString()} className="bg-card/50 backdrop-blur-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">
                                        📅 {formatDateHeader(date)}
                                    </CardTitle>
                                    <Badge variant={dailyTotal >= 0 ? 'default' : 'destructive'} className="text-sm">
                                        Total: {dailyTotal >= 0 ? '+' : ''}{formatCurrency(dailyTotal)}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {movements.map((movement) => {
                                        const link = getSourceLink(movement)
                                        return (
                                            <div
                                                key={movement.id}
                                                className="flex items-center gap-3 p-3 rounded-lg border bg-background/50 hover:bg-background/80 transition-colors"
                                            >
                                                <span className="text-2xl">{movement.icon}</span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-muted-foreground">
                                                            {formatBrazilDate(movement.occurredAt, 'HH:mm')}
                                                        </span>
                                                        <span className="font-medium truncate">
                                                            {movement.description}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="outline" className="text-xs">
                                                            {getMethodLabel(movement.method)}
                                                        </Badge>
                                                        {link && (
                                                            <Link 
                                                                href={link}
                                                                className="text-xs text-blue-600 hover:underline"
                                                            >
                                                                Ver detalhes →
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`text-lg font-bold ${
                                                        movement.type === 'IN' ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                        {movement.type === 'IN' ? '+' : '-'}{formatCurrency(movement.amount)}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Saldo: {formatCurrency(movement.balanceAfter)}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
