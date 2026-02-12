'use client'

import { useEffect, useState } from 'react'
import { BankAccountsList } from '@/components/bank-accounts/BankAccountsList'
import { BankAccountDialog } from '@/components/bank-accounts/BankAccountDialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { BankAccountWithBalance, BankAccount } from '@/core/domain/BankAccount'
import { SupabaseBankAccountRepository } from '@/infrastructure/repositories/supabase/SupabaseBankAccountRepository'
import { ListBankAccounts } from '@/core/usecases/bank-accounts/ListBankAccounts'
import { CreateBankAccount } from '@/core/usecases/bank-accounts/CreateBankAccount'
import { UpdateBankAccount } from '@/core/usecases/bank-accounts/UpdateBankAccount'
import { DeactivateBankAccount } from '@/core/usecases/bank-accounts/DeactivateBankAccount'
import { toast } from 'sonner'

export default function ContasPage() {
    const [accounts, setAccounts] = useState<BankAccountWithBalance[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null)

    useEffect(() => {
        loadAccounts()
    }, [])

    async function loadAccounts() {
        try {
            setLoading(true)
            const repo = new SupabaseBankAccountRepository()
            const useCase = new ListBankAccounts(repo)
            const data = await useCase.execute()
            setAccounts(data)
        } catch (error) {
            toast.error('Não foi possível carregar as contas')
        } finally {
            setLoading(false)
        }
    }

    async function handleSave(data: { name: string; type: 'BANK' | 'CARD' | 'WALLET'; initialBalance?: number }) {
        try {
            const repo = new SupabaseBankAccountRepository()

            if (selectedAccount) {
                const useCase = new UpdateBankAccount(repo)
                await useCase.execute(selectedAccount.id, {
                    name: data.name,
                    type: data.type
                })
                toast.success('Conta atualizada com sucesso')
            } else {
                const useCase = new CreateBankAccount(repo)
                await useCase.execute(data)
                toast.success('Conta criada com sucesso')
            }

            await loadAccounts()
            setDialogOpen(false)
            setSelectedAccount(null)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Erro ao salvar conta')
            throw error
        }
    }

    async function handleToggleActive(id: string, isActive: boolean) {
        try {
            const repo = new SupabaseBankAccountRepository()
            
            if (isActive) {
                const useCase = new DeactivateBankAccount(repo)
                await useCase.execute(id)
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

    function handleEdit(account: BankAccountWithBalance) {
        setSelectedAccount(account)
        setDialogOpen(true)
    }

    function handleNew() {
        setSelectedAccount(null)
        setDialogOpen(true)
    }

    if (loading) {
        return <div className="p-8">Carregando...</div>
    }

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Contas Bancárias</h1>
                    <p className="text-muted-foreground">
                        Gerencie suas contas, cartões e carteiras digitais
                    </p>
                </div>
                <Button onClick={handleNew}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Conta
                </Button>
            </div>

            <BankAccountsList
                accounts={accounts}
                onEdit={handleEdit}
                onToggleActive={handleToggleActive}
            />

            <BankAccountDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                account={selectedAccount}
                onSave={handleSave}
            />
        </div>
    )
}
