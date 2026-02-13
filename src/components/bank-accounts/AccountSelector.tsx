'use client'

import { useEffect, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SupabaseBankAccountRepository } from '@/infrastructure/repositories/supabase/SupabaseBankAccountRepository'
import { createClient } from '@/lib/supabase/client'
import { ListBankAccounts } from '@/core/usecases/bank-accounts/ListBankAccounts'
import { BankAccountWithBalance } from '@/core/domain/BankAccount'

interface AccountSelectorProps {
    value?: string
    onChange?: (value: string) => void
    onValueChange?: (value: string) => void
    placeholder?: string
    allowAll?: boolean
    className?: string
}

export function AccountSelector({ value, onChange, onValueChange, placeholder = 'Selecione uma conta', allowAll = false, className }: AccountSelectorProps) {
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
            setError(null)
            console.log('🏦 AccountSelector: Iniciando carregamento de contas...')
            
            const supabase = createClient()
            
            // Verificar autenticação
            const { data: { user }, error: authError } = await supabase.auth.getUser()
            console.log('🏦 AccountSelector: User:', user?.id, 'Auth Error:', authError)
            
            if (authError || !user) {
                throw new Error('Usuário não autenticado')
            }
            
            const repo = new SupabaseBankAccountRepository(supabase)
            const useCase = new ListBankAccounts(repo)
            
            console.log('🏦 AccountSelector: Chamando useCase.execute(true)...')
            const data = await useCase.execute(true) // Only active accounts
            console.log('🏦 AccountSelector: Contas carregadas:', data.length, data)
            
            setAccounts(data)
        } catch (err) {
            console.error('❌ AccountSelector: Erro ao carregar contas:', err)
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

    if (accounts.length === 0) {
        return (
            <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-3">
                ⚠️ Nenhuma conta bancária encontrada. Crie uma conta em "Contas" primeiro.
            </div>
        )
    }

    return (
        <Select value={value} onValueChange={handleValueChange}>
            <SelectTrigger className={className}>
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
