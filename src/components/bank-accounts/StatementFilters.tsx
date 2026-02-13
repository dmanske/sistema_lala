'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { QuickPeriodFilters } from './QuickPeriodFilters'
import { Search, Filter, X } from 'lucide-react'
import { PaymentMethod, SourceType } from '@/core/domain/BankAccount'

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
        <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filtros
                        {resultCount !== undefined && (
                            <span className="text-sm font-normal text-muted-foreground">
                                ({resultCount} {resultCount === 1 ? 'resultado' : 'resultados'})
                            </span>
                        )}
                    </CardTitle>
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearFilters}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4 mr-1" />
                            Limpar
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Quick Period Filters */}
                <div className="space-y-2">
                    <Label>Período</Label>
                    <QuickPeriodFilters
                        activePeriod={filters.quickPeriod}
                        onPeriodChange={handlePeriodChange}
                    />
                </div>

                {/* Type, Method, Source Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Type Filter */}
                    <div className="space-y-2">
                        <Label>Tipo</Label>
                        <div className="flex gap-2">
                            <Button
                                variant={filters.type === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleTypeChange('all')}
                                className="flex-1"
                            >
                                Todas
                            </Button>
                            <Button
                                variant={filters.type === 'in' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleTypeChange('in')}
                                className="flex-1 text-green-600 hover:text-green-700"
                            >
                                Entradas
                            </Button>
                            <Button
                                variant={filters.type === 'out' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleTypeChange('out')}
                                className="flex-1 text-red-600 hover:text-red-700"
                            >
                                Saídas
                            </Button>
                        </div>
                    </div>

                    {/* Method Filter */}
                    <div className="space-y-2">
                        <Label htmlFor="method">Método</Label>
                        <Select
                            value={filters.method}
                            onValueChange={(value) => setFilters(prev => ({ ...prev, method: value as any }))}
                        >
                            <SelectTrigger id="method">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="PIX">PIX</SelectItem>
                                <SelectItem value="CARD">Cartão</SelectItem>
                                <SelectItem value="CASH">Dinheiro</SelectItem>
                                <SelectItem value="TRANSFER">Transferência</SelectItem>
                                <SelectItem value="WALLET">Carteira</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Source Filter */}
                    <div className="space-y-2">
                        <Label htmlFor="source">Origem</Label>
                        <Select
                            value={filters.source}
                            onValueChange={(value) => setFilters(prev => ({ ...prev, source: value as any }))}
                        >
                            <SelectTrigger id="source">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas</SelectItem>
                                <SelectItem value="SALE">Vendas</SelectItem>
                                <SelectItem value="PURCHASE">Compras</SelectItem>
                                <SelectItem value="REFUND">Estornos</SelectItem>
                                <SelectItem value="MANUAL">Manual</SelectItem>
                                <SelectItem value="CREDIT">Crédito</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Search */}
                <div className="space-y-2">
                    <Label htmlFor="search">Buscar</Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="search"
                            placeholder="Buscar por descrição, cliente, fornecedor..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="pl-9"
                        />
                        {searchInput && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSearchInput('')}
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
