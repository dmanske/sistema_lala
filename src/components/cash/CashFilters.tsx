'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Search } from 'lucide-react'

export interface FilterState {
    type: 'IN' | 'OUT' | 'ALL'
    method: string | 'ALL'
    source: string | 'ALL'
    bankAccountId?: string
    searchText?: string
}

interface CashFiltersProps {
    searchText: string
    onSearchChange: (value: string) => void
    resultCount: number
    totalCount: number
}

export function CashFilters({ searchText, onSearchChange, resultCount, totalCount }: CashFiltersProps) {
    const handleClearSearch = () => {
        onSearchChange('')
    }

    const hasSearch = searchText.length > 0

    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                type="text"
                placeholder="Buscar transações..."
                value={searchText}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-10 h-11 text-base"
            />
            {hasSearch && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClearSearch}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
            {hasSearch && (
                <div className="absolute -bottom-5 left-1 text-xs text-muted-foreground">
                    {resultCount === totalCount ? (
                        `${totalCount} ${totalCount === 1 ? 'transação' : 'transações'}`
                    ) : (
                        <>
                            Encontrado <strong className="text-foreground">{resultCount}</strong> de {totalCount} transações
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
