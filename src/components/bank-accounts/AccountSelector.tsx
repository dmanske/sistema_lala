'use client'

import { useEffect, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SupabaseBankAccountRepository } from '@/infrastructure/repositories/supabase/SupabaseBankAccountRepository'
import { ListBankAccounts } from '@/core/usecases/bank-accounts/ListBankAccounts'
import { BankAccountWithBalance } from '@/core/domain/BankAccount'

interface AccountSelectorProps {
    value?: string
    onValueChange: (value: string) => void
    placeholder?: string
}

export function AccountSelector({ value, onValueChange, placeholder = 'Selecione uma conta' }: AccountSelectorProps) {
    const [accounts, setAccounts] = useState<BankAccountWithBalance[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

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
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                        {account.name} - {formatCurrency(account.currentBalance)}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
