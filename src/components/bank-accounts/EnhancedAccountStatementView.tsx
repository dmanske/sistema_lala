'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { AccountStatement, MovementWithBalance } from '@/core/domain/BankAccount'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AccountStatementTabs } from './AccountStatementTabs'
import { ArrowDownCircle, ArrowUpCircle, Download, RefreshCw, TrendingUp, TrendingDown, DollarSign, Hash, ChevronDown, ChevronRight } from 'lucide-react'
import { format, isSameDay, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatBrazilDate, toBrazilTime } from '@/lib/utils/dateUtils'
import { parseLocalDate } from '@/lib/utils/dateFormatters'

interface EnhancedAccountStatementViewProps {
    statement: AccountStatement
    onRefresh?: () => void
    loading?: boolean
}

interface SaleAppointmentMap {
    [saleId: string]: string // Maps sale ID to appointment ID
}

export function EnhancedAccountStatementView({ statement, onRefresh, loading }: EnhancedAccountStatementViewProps) {
    const [searchText, setSearchText] = useState('')
    const [filterType, setFilterType] = useState<'ALL' | 'IN' | 'OUT'>('ALL')
    const [filterMethod, setFilterMethod] = useState('ALL')
    
    // Inicializar período com base nos dados do statement ou mês atual
    const [currentPeriod, setCurrentPeriod] = useState(() => {
        if (statement.movements.length > 0) {
            // Pegar a data mais recente dos movimentos
            const latestDate = new Date(Math.max(...statement.movements.map(m => new Date(m.occurredAt).getTime())))
            return {
                start: startOfMonth(latestDate),
                end: endOfMonth(latestDate)
            }
        }
        return {
            start: startOfMonth(new Date()),
            end: endOfMonth(new Date())
        }
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
            
            try {
                // Limitar a 50 IDs por vez para evitar URLs muito longas
                const batchSize = 50
                const map: SaleAppointmentMap = {}

                for (let i = 0; i < saleIds.length; i += batchSize) {
                    const batch = saleIds.slice(i, i + batchSize)
                    const { data, error } = await supabase
                        .from('sales')
                        .select('id, appointment_id')
                        .in('id', batch)

                    if (error) {
                        console.error('Erro ao buscar vendas:', error)
                        // Se der erro de autenticação, tenta refresh
                        if (error.message.includes('JWT') || error.message.includes('auth')) {
                            const { error: refreshError } = await supabase.auth.refreshSession()
                            if (refreshError) {
                                console.error('Erro ao fazer refresh da sessão:', refreshError)
                            }
                        }
                        continue
                    }

                    if (data) {
                        data.forEach(sale => {
                            if (sale.appointment_id) {
                                map[sale.id] = sale.appointment_id
                            }
                        })
                    }
                }
                
                setSaleAppointments(map)
            } catch (error) {
                console.error('Erro ao carregar appointments de vendas:', error)
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
        if (currentPeriod.start && currentPeriod.end) {
            result = result.filter(m => {
                const movementDate = new Date(m.occurredAt)
                return movementDate >= currentPeriod.start && movementDate <= currentPeriod.end
            })
        }

        // Type filter
        if (filterType !== 'ALL') {
            result = result.filter(m => m.type === filterType)
        }

        // Method filter
        if (filterMethod !== 'ALL') {
            result = result.filter(m => m.method === filterMethod)
        }

        // Search filter
        if (searchText) {
            const search = searchText.toLowerCase()
            result = result.filter(m =>
                m.description?.toLowerCase().includes(search) ||
                m.customerName?.toLowerCase().includes(search) ||
                m.supplierName?.toLowerCase().includes(search)
            )
        }

        return result
    }, [statement.movements, currentPeriod, filterType, filterMethod, searchText])

    // State for expanded days
    const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({})

    const toggleDay = (dateKey: string) => {
        setExpandedDays(prev => ({
            ...prev,
            [dateKey]: !prev[dateKey]
        }))
    }

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
            const date = parseLocalDate(dateStr)!
            const totalIn = movements.filter(m => m.type === 'IN').reduce((sum, m) => sum + m.amount, 0)
            const totalOut = movements.filter(m => m.type === 'OUT').reduce((sum, m) => sum + m.amount, 0)
            const dailyTotal = totalIn - totalOut
            return { dateKey: dateStr, date, movements, totalIn, totalOut, dailyTotal }
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
            <AccountStatementTabs
                currentStart={currentPeriod.start}
                currentEnd={currentPeriod.end}
                searchText={searchText}
                onSearchChange={setSearchText}
                filterType={filterType}
                onFilterTypeChange={setFilterType}
                filterMethod={filterMethod}
                onFilterMethodChange={setFilterMethod}
                onPeriodChange={(start, end) => setCurrentPeriod({ start, end })}
                resultCount={filteredMovements.length}
                totalCount={statement.movements.length}
            />

            {/* Movements by Date */}
            <div className="space-y-3">
                {groupedMovements.length === 0 ? (
                    <div className="rounded-lg border bg-card p-12 text-center">
                        <div className="text-muted-foreground">
                            <p className="text-lg font-medium">Nenhuma movimentação encontrada</p>
                            <p className="text-sm mt-2">Ajuste os filtros ou registre uma nova transação</p>
                        </div>
                    </div>
                ) : (
                    groupedMovements.map(({ dateKey, date, movements, totalIn, totalOut, dailyTotal }) => {
                        const isExpanded = expandedDays[dateKey] || false
                        
                        return (
                            <div key={dateKey} className="rounded-lg border bg-card overflow-hidden">
                                {/* Header do Dia */}
                                <div
                                    className="flex items-center justify-between p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => toggleDay(dateKey)}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">📅</span>
                                        <div>
                                            <p className="font-semibold capitalize">{formatDateHeader(date)}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {movements.length} {movements.length === 1 ? 'transação' : 'transações'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className={`font-bold ${dailyTotal >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {formatCurrency(dailyTotal)}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                <span className="text-emerald-600">+{formatCurrency(totalIn)}</span>
                                                {' / '}
                                                <span className="text-rose-600">-{formatCurrency(totalOut)}</span>
                                            </div>
                                        </div>
                                        {isExpanded ? (
                                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                        ) : (
                                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                        )}
                                    </div>
                                </div>

                                {/* Movimentos do Dia */}
                                {isExpanded && (
                                    <div className="divide-y">
                                        {movements.map((movement) => {
                                            const Icon = movement.type === 'IN' ? ArrowUpCircle : ArrowDownCircle
                                            const colorClass = movement.type === 'IN' ? "text-emerald-600" : "text-rose-600"
                                            const link = getSourceLink(movement)
                                            
                                            // Formatar descrição para transferências
                                            let displayDescription = movement.description
                                            if (movement.sourceType === 'TRANSFER' && movement.fromAccountName && movement.toAccountName) {
                                                displayDescription = `${movement.fromAccountName} → ${movement.toAccountName}`
                                                if (movement.description) {
                                                    displayDescription += ` (${movement.description})`
                                                }
                                            }
                                            
                                            return (
                                                <div 
                                                    key={movement.id}
                                                    className="flex items-center justify-between py-3 px-4 hover:bg-muted/30 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <div className="text-xs text-muted-foreground w-16 shrink-0">
                                                            {formatBrazilDate(movement.occurredAt, 'HH:mm')}
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                                            <div className={`p-1.5 rounded-full shrink-0 ${
                                                                movement.type === 'IN' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                                            }`}>
                                                                <Icon className="h-3.5 w-3.5" />
                                                            </div>
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="text-sm font-medium truncate">{displayDescription}</span>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <Badge variant="outline" className="text-xs h-5">
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
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 ml-4">
                                                        <div className={`font-bold text-sm flex items-center gap-1 w-28 justify-end ${colorClass}`}>
                                                            <Icon className="h-3 w-3" />
                                                            {formatCurrency(movement.amount)}
                                                        </div>
                                                        <div className="text-sm font-mono font-semibold text-muted-foreground w-32 text-right">
                                                            {formatCurrency(movement.balanceAfter)}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
