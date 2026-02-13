'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AccountSelector } from '@/components/bank-accounts/AccountSelector'
import { X, Search, Filter } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

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
    }, [searchInput, filters.searchText]) // Removed filters from dependency to avoid loop, added specific prop

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
        <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between bg-card border rounded-lg p-3 shadow-sm">

                {/* Search Bar - Takes priority */}
                <div className="relative w-full md:w-[300px]">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Buscar transações..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="pl-9 h-9 bg-muted/30 border-muted"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    {/* Filter Group */}
                    <Select
                        value={filters.type}
                        onValueChange={(val: any) => onFiltersChange({ ...filters, type: val })}
                    >
                        <SelectTrigger className="h-9 w-[110px] text-xs">
                            <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todos os Tipos</SelectItem>
                            <SelectItem value="IN">Entradas</SelectItem>
                            <SelectItem value="OUT">Saídas</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.method}
                        onValueChange={(val: any) => onFiltersChange({ ...filters, method: val })}
                    >
                        <SelectTrigger className="h-9 w-[120px] text-xs">
                            <SelectValue placeholder="Método" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todos Métodos</SelectItem>
                            <SelectItem value="CASH">Dinheiro</SelectItem>
                            <SelectItem value="PIX">Pix</SelectItem>
                            <SelectItem value="CARD">Cartão</SelectItem>
                            <SelectItem value="TRANSFER">Transferência</SelectItem>
                            <SelectItem value="WALLET">Carteira</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.source}
                        onValueChange={(val: any) => onFiltersChange({ ...filters, source: val })}
                    >
                        <SelectTrigger className="h-9 w-[110px] text-xs">
                            <SelectValue placeholder="Origem" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todas Origens</SelectItem>
                            <SelectItem value="SALE">Venda</SelectItem>
                            <SelectItem value="PURCHASE">Compra</SelectItem>
                            <SelectItem value="REFUND">Estorno</SelectItem>
                            <SelectItem value="MANUAL">Manual</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Account Selector Wrappper because component style might differ */}
                    <div className="w-[140px]">
                        <AccountSelector
                            value={filters.bankAccountId}
                            onValueChange={(value) => onFiltersChange({ ...filters, bankAccountId: value })}
                            placeholder="Conta"
                            allowAll
                            className="h-9 text-xs"
                        />
                    </div>

                    {hasActiveFilters && (
                        <>
                            <Separator orientation="vertical" className="h-6 hidden md:block" />
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearFilters}
                                className="h-9 px-2 text-muted-foreground hover:text-foreground"
                                title="Limpar filtros"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Results Count Label */}
            <div className="flex items-center justify-between px-1">
                <p className="text-xs text-muted-foreground pl-1">
                    Exibindo <strong>{resultCount}</strong> de {totalCount} registros
                </p>
            </div>
        </div>
    )
}
