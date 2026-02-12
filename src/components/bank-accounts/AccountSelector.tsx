'use client'

import { useEffect, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SupabaseBankAccountRepository } from '@/infrastructure/repositories/supabase/SupabaseBankAccountRepository'
import { ListBankAccounts } from '@/core/usecases/bank-accounts/ListBankAccounts'
import { BankAccountWithBalance } from '@/core/domain/BankAccount'

interface AccountSelectorProps {
    value?: string
    onChange?: (value: string) => void
    onValueChange?: (value: string) => void
    placeholder?: string
    allowAll?: boolean
}

export function AccountSelector({ value, onChange, onValueChange, placeholder = 'Selecione uma conta', allowAll = false }: AccountSelectorProps) {
    const [accounts, setAccounts] = useState<BankAccountWithBalance[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const handleValueChange = (newValue: string) => {
        if (onChange) onChange(newValue)
        if (onValueChange) onValueChange(newValue)
    }

    useEffect(() => {
        loadAccounts()
    }, [])

    async function loadAccounts() {
        try {
            setLoading(true)
            const repo = new SupabaseBankAccountRepository()
            const useCase = new ListBankAccounts(repo)
            const data = await useCase.execute(true) // Only active accounts
            setAccounts(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar contas')
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value)
    }

    if (loading) {
        return <div className="text-sm text-muted-foreground">Carregando contas...</div>
    }

    if (error) {
        return <div className="text-sm text-destructive">{error}</div>
    }

    return (
        <Select value={value} onValueChange={handleValueChange}>
            <SelectTrigger>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {allowAll && (
                    <SelectItem value="__ALL__">Todas as contas</SelectItem>
                )}
                {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                        {account.name} - {formatCurrency(account.currentBalance)}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
