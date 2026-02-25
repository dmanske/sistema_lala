'use client'

import { useState, useMemo, Fragment } from 'react'
import { AccountStatement } from '@/core/domain/BankAccount'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
    ArrowDownCircle, 
    ArrowUpCircle, 
    Calendar,
    ChevronDown,
    ChevronRight,
    Search,
    X
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface AccountStatementViewProps {
    statement: AccountStatement
    onFilterChange: (startDate?: Date, endDate?: Date) => void
}

interface Movement {
    id: string
    type: 'IN' | 'OUT'
    amount: number
    description?: string
    occurredAt: Date | string
    balanceAfter: number
}

interface DayGroup {
    dateKey: string
    displayDate: string
    date: Date
    movements: Movement[]
    totalIn: number
    totalOut: number
    netAmount: number
}

export function AccountStatementView({ statement, onFilterChange }: AccountStatementViewProps) {
    const [searchText, setSearchText] = useState('')
    const [filterType, setFilterType] = useState<'ALL' | 'IN' | 'OUT'>('ALL')
    const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({})

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value)
    }

    const toggleDay = (dateKey: string) => {
        setExpandedDays(prev => ({
            ...prev,
            [dateKey]: !prev[dateKey]
        }))
    }

    // Filter movements
    const filteredMovements = useMemo(() => {
        let result = statement.movements
        
        // Filter by type
        if (filterType !== 'ALL') {
            result = result.filter(m => m.type === filterType)
        }
        
        // Filter by search
        if (searchText.trim()) {
            const search = searchText.toLowerCase()
            result = result.filter(m => 
                m.description?.toLowerCase().includes(search)
            )
        }
        
        return result
    }, [statement.movements, searchText, filterType])

    // Group by day
    const dayGroups = useMemo((): DayGroup[] => {
        const groups = new Map<string, typeof statement.movements>()

        // Sort by date descending (newest first)
        const sorted = [...filteredMovements].sort((a, b) =>
            new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
        )

        sorted.forEach(movement => {
            const date = new Date(movement.occurredAt)
            const dateKey = format(date, 'yyyy-MM-dd')
            if (!groups.has(dateKey)) {
                groups.set(dateKey, [])
            }
            groups.get(dateKey)!.push(movement)
        })

        return Array.from(groups.entries()).map(([dateKey, movements]) => {
            const date = new Date(dateKey + 'T00:00:00')
            const totalIn = movements.filter(m => m.type === 'IN').reduce((sum, m) => sum + m.amount, 0)
            const totalOut = movements.filter(m => m.type === 'OUT').reduce((sum, m) => sum + m.amount, 0)
            
            return {
                dateKey,
                displayDate: format(date, "EEEE, dd 'de' MMMM", { locale: ptBR }),
                date,
                movements,
                totalIn,
                totalOut,
                netAmount: totalIn - totalOut
            }
        })
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
            balance: totalIn - totalOut
        }
    }, [filteredMovements])

    return (
        <div className="space-y-4">
            {/* Account Details */}
            <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>{statement.account.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Saldo Inicial</p>
                            <p className="text-lg font-semibold">
                                {formatCurrency(statement.summary.initialBalance)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Entradas</p>
                            <p className="text-lg font-semibold text-green-600">
                                {formatCurrency(filteredSummary.totalIn)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Saídas</p>
                            <p className="text-lg font-semibold text-red-600">
                                {formatCurrency(filteredSummary.totalOut)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Saldo Atual</p>
                            <p className="text-lg font-semibold">
                                {formatCurrency(statement.summary.currentBalance)}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Filters */}
            <Card className="bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por descrição..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="pl-9 pr-9"
                            />
                            {searchText && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                    onClick={() => setSearchText('')}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        {/* Type Filter */}
                        <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Todos</SelectItem>
                                <SelectItem value="IN">Entradas</SelectItem>
                                <SelectItem value="OUT">Saídas</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Result Count */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
                            <Badge variant="secondary">
                                {filteredMovements.length} de {statement.movements.length}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Movements List */}
            <div className="space-y-3">
                {dayGroups.length === 0 ? (
                    <div className="rounded-lg border bg-card p-12 text-center">
                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Nenhuma movimentação no período selecionado.</p>
                    </div>
                ) : (
                    dayGroups.map((dayGroup) => {
                        const isExpanded = expandedDays[dayGroup.dateKey] || false

                        return (
                            <div key={dayGroup.dateKey} className="rounded-lg border bg-card overflow-hidden">
                                {/* Header do Dia */}
                                <div
                                    className="flex items-center justify-between p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => toggleDay(dayGroup.dateKey)}
                                >
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="font-semibold capitalize">{dayGroup.displayDate}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {dayGroup.movements.length} {dayGroup.movements.length === 1 ? 'transação' : 'transações'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className={cn("font-bold", dayGroup.netAmount >= 0 ? "text-emerald-600" : "text-rose-600")}>
                                                {formatCurrency(dayGroup.netAmount)}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                <span className="text-emerald-600">+{formatCurrency(dayGroup.totalIn)}</span>
                                                {' / '}
                                                <span className="text-rose-600">-{formatCurrency(dayGroup.totalOut)}</span>
                                            </div>
                                        </div>
                                        {isExpanded ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
                                    </div>
                                </div>

                                {/* Movimentos do Dia */}
                                {isExpanded && (
                                    <div className="divide-y">
                                        {dayGroup.movements.map((movement: Movement) => {
                                            const Icon = movement.type === 'IN' ? ArrowUpCircle : ArrowDownCircle
                                            const colorClass = movement.type === 'IN' ? "text-emerald-600" : "text-rose-600"
                                            
                                            return (
                                                <div 
                                                    key={movement.id}
                                                    className="flex items-center justify-between py-3 px-4 hover:bg-muted/30 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <div className="text-xs text-muted-foreground w-16 shrink-0">
                                                            {format(new Date(movement.occurredAt), "HH:mm", { locale: ptBR })}
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                                            <div className={cn(
                                                                "p-1.5 rounded-full shrink-0",
                                                                movement.type === 'IN' ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                                                            )}>
                                                                <Icon className="h-3.5 w-3.5" />
                                                            </div>
                                                            <span className="text-sm font-medium truncate">{movement.description || "-"}</span>
                                                        </div>

                                                        <Badge variant="secondary" className="font-normal capitalize text-xs shrink-0">
                                                            {movement.type === 'IN' ? 'Entrada' : 'Saída'}
                                                        </Badge>
                                                    </div>

                                                    <div className="flex items-center gap-3 ml-4">
                                                        <div className={cn("font-bold text-sm flex items-center gap-1 w-28 justify-end", colorClass)}>
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
