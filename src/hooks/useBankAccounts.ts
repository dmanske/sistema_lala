
import { useState, useEffect, useCallback } from 'react'
import { BankAccountWithBalance, BankAccount } from '@/core/domain/BankAccount'
import { CreateBankAccountInput, UpdateBankAccountInput } from '@/core/repositories/BankAccountRepository'
import { getBankAccountRepository } from '@/infrastructure/repositories/factory'
import { toast } from 'sonner'

export function useBankAccounts() {
    const [accounts, setAccounts] = useState<BankAccountWithBalance[]>([])
    const [loading, setLoading] = useState(true)

    const loadAccounts = useCallback(async () => {
        try {
            setLoading(true)
            const repo = getBankAccountRepository()
            // We want to list all, active and inactive, and filter later or let the UI decide
            // Actually, repo.listWithBalances accepts an isActive boolean. If undefined, it returns all.
            const data = await repo.listWithBalances()
            setAccounts(data)
        } catch (error) {
            console.error(error)
            toast.error('Não foi possível carregar as contas')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadAccounts()
    }, [loadAccounts])

    const createAccount = async (input: CreateBankAccountInput) => {
        try {
            const repo = getBankAccountRepository()
            await repo.create(input)
            toast.success('Conta criada com sucesso')
            await loadAccounts()
            return true
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Erro ao criar conta')
            return false
        }
    }

    const updateAccount = async (id: string, input: UpdateBankAccountInput) => {
        try {
            const repo = getBankAccountRepository()
            await repo.update(id, input)
            toast.success('Conta atualizada com sucesso')
            await loadAccounts()
            return true
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Erro ao atualizar conta')
            return false
        }
    }

    const toggleAccountStatus = async (id: string, isActive: boolean) => {
        try {
            const repo = getBankAccountRepository()
            if (isActive) {
                await repo.deactivate(id)
                toast.success('Conta desativada com sucesso')
            } else {
                await repo.activate(id)
                toast.success('Conta ativada com sucesso')
            }
            await loadAccounts()
        } catch (error) {
            toast.error('Erro ao alterar status da conta')
        }
    }

    const refresh = loadAccounts

    return {
        accounts,
        loading,
        createAccount,
        updateAccount,
        toggleAccountStatus,
        refresh
    }
}
