'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AccountSelector } from '@/components/bank-accounts/AccountSelector'
import { X, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FilterState {
    type: 'ALL' | 'IN' | 'OUT'
    method: 'ALL' | 'CASH' | 'PIX' | 'CARD' | 'TRANSFER' | 'WALLET'
    source: 'ALL' | 'SALE' | 'REFUND' | 'PURCHASE' | 'MANUAL'
    bankAccountId: string
    searchText: string
}

interface CashFiltersProps {
    filters: FilterState
    onFiltersChange: (filters: FilterState) => void
    resultCount: number
    totalCount: number
}

export function CashFilters({ filters, onFiltersChange, resultCount, totalCount }: CashFiltersProps) {
    const [searchInput, setSearchInput] = useState(filters.searchText)

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== filters.searchText) {
                onFiltersChange({ ...filters, searchText: searchInput })
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [searchInput])

    const handleClearFilters = () => {
        setSearchInput('')
        onFiltersChange({
            type: 'ALL',
            method: 'ALL',
            source: 'ALL',
            bankAccountId: '__ALL__',
            searchText: ''
        })
    }

    const hasActiveFilters = 
        filters.type !== 'ALL' ||
        filters.method !== 'ALL' ||
        filters.source !== 'ALL' ||
        (filters.bankAccountId !== '__ALL__' && filters.bankAccountId !== '') ||
        filters.searchText !== ''

    return (
        <div className="rounded-xl border border-white/20 bg-white/40 backdrop-blur-sm p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold">Filtros</h3>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-600">
                        {resultCount} de {totalCount} movimentações
                    </span>
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearFilters}
                            className="h-8"
                        >
                            <X className="h-4 w-4 mr-1" />
                            Limpar Filtros
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Type Filter */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Tipo</Label>
                    <div className="flex gap-2">
                        <Button
                            variant={filters.type === 'ALL' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onFiltersChange({ ...filters, type: 'ALL' })}
                            className={cn(
                                'flex-1',
                                filters.type === 'ALL' && 'bg-purple-600 hover:bg-purple-700'
                            )}
                        >
                            Todos
                        </Button>
                        <Button
                            variant={filters.type === 'IN' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onFiltersChange({ ...filters, type: 'IN' })}
                            className={cn(
                                'flex-1',
                                filters.type === 'IN' && 'bg-green-600 hover:bg-green-700'
                            )}
                        >
                            Entrada
                        </Button>
                        <Button
                            variant={filters.type === 'OUT' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onFiltersChange({ ...filters, type: 'OUT' })}
                            className={cn(
                                'flex-1',
                                filters.type === 'OUT' && 'bg-rose-600 hover:bg-rose-700'
                            )}
                        >
                            Saída
                        </Button>
                    </div>
                </div>

                {/* Method Filter */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Método</Label>
                    <div className="grid grid-cols-3 gap-1">
                        <Button
                            variant={filters.method === 'ALL' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onFiltersChange({ ...filters, method: 'ALL' })}
                            className={cn(
                                'col-span-3',
                                filters.method === 'ALL' && 'bg-purple-600 hover:bg-purple-700'
                            )}
                        >
                            Todos
                        </Button>
                        <Button
                            variant={filters.method === 'PIX' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onFiltersChange({ ...filters, method: 'PIX' })}
                            className={cn(
                                filters.method === 'PIX' && 'bg-purple-600 hover:bg-purple-700'
                            )}
                        >
                            Pix
                        </Button>
                        <Button
                            variant={filters.method === 'CARD' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onFiltersChange({ ...filters, method: 'CARD' })}
                            className={cn(
                                filters.method === 'CARD' && 'bg-purple-600 hover:bg-purple-700'
                            )}
                        >
                            Cartão
                        </Button>
                        <Button
                            variant={filters.method === 'CASH' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onFiltersChange({ ...filters, method: 'CASH' })}
                            className={cn(
                                filters.method === 'CASH' && 'bg-purple-600 hover:bg-purple-700'
                            )}
                        >
                            Dinheiro
                        </Button>
                        <Button
                            variant={filters.method === 'TRANSFER' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onFiltersChange({ ...filters, method: 'TRANSFER' })}
                            className={cn(
                                'col-span-2',
                                filters.method === 'TRANSFER' && 'bg-purple-600 hover:bg-purple-700'
                            )}
                        >
                            Transferência
                        </Button>
                        <Button
                            variant={filters.method === 'WALLET' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onFiltersChange({ ...filters, method: 'WALLET' })}
                            className={cn(
                                filters.method === 'WALLET' && 'bg-purple-600 hover:bg-purple-700'
                            )}
                        >
                            Carteira
                        </Button>
                    </div>
                </div>

                {/* Source Filter */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Origem</Label>
                    <div className="grid grid-cols-2 gap-1">
                        <Button
                            variant={filters.source === 'ALL' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onFiltersChange({ ...filters, source: 'ALL' })}
                            className={cn(
                                'col-span-2',
                                filters.source === 'ALL' && 'bg-purple-600 hover:bg-purple-700'
                            )}
                        >
                            Todas
                        </Button>
                        <Button
                            variant={filters.source === 'SALE' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onFiltersChange({ ...filters, source: 'SALE' })}
                            className={cn(
                                filters.source === 'SALE' && 'bg-purple-600 hover:bg-purple-700'
                            )}
                        >
                            Venda
                        </Button>
                        <Button
                            variant={filters.source === 'PURCHASE' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onFiltersChange({ ...filters, source: 'PURCHASE' })}
                            className={cn(
                                filters.source === 'PURCHASE' && 'bg-purple-600 hover:bg-purple-700'
                            )}
                        >
                            Compra
                        </Button>
                        <Button
                            variant={filters.source === 'REFUND' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onFiltersChange({ ...filters, source: 'REFUND' })}
                            className={cn(
                                filters.source === 'REFUND' && 'bg-purple-600 hover:bg-purple-700'
                            )}
                        >
                            Estorno
                        </Button>
                        <Button
                            variant={filters.source === 'MANUAL' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onFiltersChange({ ...filters, source: 'MANUAL' })}
                            className={cn(
                                filters.source === 'MANUAL' && 'bg-purple-600 hover:bg-purple-700'
                            )}
                        >
                            Manual
                        </Button>
                    </div>
                </div>

                {/* Account Filter */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Conta</Label>
                    <AccountSelector
                        value={filters.bankAccountId}
                        onChange={(value) => onFiltersChange({ ...filters, bankAccountId: value })}
                        placeholder="Todas as contas"
                        allowAll
                    />
                </div>
            </div>

            {/* Search */}
            <div className="space-y-2">
                <Label className="text-sm font-medium">Buscar</Label>
                <Input
                    type="text"
                    placeholder="Buscar por descrição..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="bg-white"
                />
            </div>
        </div>
    )
}
