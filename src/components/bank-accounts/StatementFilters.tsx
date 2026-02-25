'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { QuickPeriodFilters } from './QuickPeriodFilters'
import { Search, X, ArrowUpCircle, ArrowDownCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { PaymentMethod, SourceType } from '@/core/domain/BankAccount'
import { cn } from '@/lib/utils'

interface StatementFiltersProps {
    onFilterChange: (filters: FilterValues) => void
    resultCount?: number
}

export interface FilterValues {
    quickPeriod?: string
    startDate?: Date
    endDate?: Date
    type: 'all' | 'in' | 'out'
    method: PaymentMethod | 'all'
    source: SourceType | 'all'
    searchText: string
}

export function StatementFilters({ onFilterChange, resultCount }: StatementFiltersProps) {
    const [filters, setFilters] = useState<FilterValues>({
        type: 'all',
        method: 'all',
        source: 'all',
        searchText: ''
    })

    const [searchInput, setSearchInput] = useState('')
    const [isExpanded, setIsExpanded] = useState(true)

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, searchText: searchInput }))
        }, 300)
        return () => clearTimeout(timer)
    }, [searchInput])

    // Emit filter changes
    useEffect(() => {
        onFilterChange(filters)
    }, [filters, onFilterChange])

    const handlePeriodChange = (period: string, startDate?: Date, endDate?: Date) => {
        setFilters(prev => ({ ...prev, quickPeriod: period, startDate, endDate }))
    }

    const handleTypeChange = (type: 'all' | 'in' | 'out') => {
        setFilters(prev => ({ ...prev, type }))
    }

    const handleClearFilters = () => {
        setFilters({
            type: 'all',
            method: 'all',
            source: 'all',
            searchText: ''
        })
        setSearchInput('')
    }

    const hasActiveFilters = filters.type !== 'all' || 
                            filters.method !== 'all' || 
                            filters.source !== 'all' || 
                            filters.searchText !== '' ||
                            filters.quickPeriod

    return (
        <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
            <CardContent className="pt-6 space-y-6">
                {/* Header com contador, botão expandir e botão limpar */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="h-8 px-2"
                        >
                            {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </Button>
                        <h3 className="font-semibold text-lg">Filtros</h3>
                        {resultCount !== undefined && (
                            <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-md">
                                {resultCount} {resultCount === 1 ? 'resultado' : 'resultados'}
                            </span>
                        )}
                    </div>
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearFilters}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4 mr-1" />
                            Limpar Filtros
                        </Button>
                    )}
                </div>

                {/* Conteúdo dos filtros - colapsável */}
                <div className={cn(
                    "space-y-6 overflow-hidden transition-all duration-300",
                    isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                )}>
                    {/* Quick Period Filters */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Período</Label>
                        <QuickPeriodFilters
                            activePeriod={filters.quickPeriod}
                            onPeriodChange={handlePeriodChange}
                        />
                    </div>

                    {/* Type Filter - Destaque visual */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Tipo de Movimentação</Label>
                        <div className="grid grid-cols-3 gap-2">
                            <Button
                                variant={filters.type === 'all' ? 'default' : 'outline'}
                                size="lg"
                                onClick={() => handleTypeChange('all')}
                                className="h-12"
                            >
                                Todas
                            </Button>
                            <Button
                                variant={filters.type === 'in' ? 'default' : 'outline'}
                                size="lg"
                                onClick={() => handleTypeChange('in')}
                                className={`h-12 ${filters.type === 'in' ? 'bg-green-600 hover:bg-green-700' : 'border-green-200 text-green-700 hover:bg-green-50'}`}
                            >
                                <ArrowUpCircle className="h-4 w-4 mr-2" />
                                Entradas
                            </Button>
                            <Button
                                variant={filters.type === 'out' ? 'default' : 'outline'}
                                size="lg"
                                onClick={() => handleTypeChange('out')}
                                className={`h-12 ${filters.type === 'out' ? 'bg-red-600 hover:bg-red-700' : 'border-red-200 text-red-700 hover:bg-red-50'}`}
                            >
                                <ArrowDownCircle className="h-4 w-4 mr-2" />
                                Saídas
                            </Button>
                        </div>
                    </div>

                    {/* Method and Source Filters - Lado a lado */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Method Filter */}
                        <div className="space-y-2">
                            <Label htmlFor="method" className="text-sm font-medium">Método de Pagamento</Label>
                            <Select
                                value={filters.method}
                                onValueChange={(value) => setFilters(prev => ({ ...prev, method: value as any }))}
                            >
                                <SelectTrigger id="method" className="h-11">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os métodos</SelectItem>
                                    <SelectItem value="PIX">💳 PIX</SelectItem>
                                    <SelectItem value="CARD">💳 Cartão</SelectItem>
                                    <SelectItem value="CASH">💵 Dinheiro</SelectItem>
                                    <SelectItem value="TRANSFER">🔄 Transferência</SelectItem>
                                    <SelectItem value="WALLET">👛 Carteira Digital</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Source Filter */}
                        <div className="space-y-2">
                            <Label htmlFor="source" className="text-sm font-medium">Origem da Movimentação</Label>
                            <Select
                                value={filters.source}
                                onValueChange={(value) => setFilters(prev => ({ ...prev, source: value as any }))}
                            >
                                <SelectTrigger id="source" className="h-11">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas as origens</SelectItem>
                                    <SelectItem value="SALE">🛍️ Vendas</SelectItem>
                                    <SelectItem value="PURCHASE">📦 Compras</SelectItem>
                                    <SelectItem value="REFUND">↩️ Estornos</SelectItem>
                                    <SelectItem value="MANUAL">✏️ Manual</SelectItem>
                                    <SelectItem value="CREDIT">💰 Crédito</SelectItem>
                                    <SelectItem value="TRANSFER">🔄 Transferência</SelectItem>
                                    <SelectItem value="RECEIVABLE">📥 Recebível</SelectItem>
                                    <SelectItem value="PAYMENT">📤 Pagamento</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="space-y-2">
                        <Label htmlFor="search" className="text-sm font-medium">Buscar</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="search"
                                placeholder="Buscar por descrição, cliente, fornecedor..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="pl-10 h-11"
                            />
                            {searchInput && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSearchInput('')}
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
