'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { EnhancedAccountStatementView } from '@/components/bank-accounts/EnhancedAccountStatementView'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { AccountStatement } from '@/core/domain/BankAccount'
import { SupabaseBankAccountRepository } from '@/infrastructure/repositories/supabase/SupabaseBankAccountRepository'
import { GetAccountStatement } from '@/core/usecases/bank-accounts/GetAccountStatement'
import { toast } from 'sonner'

export default function AccountStatementPage() {
    const params = useParams()
    const router = useRouter()
    const [statement, setStatement] = useState<AccountStatement | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (params.id) {
            loadStatement(params.id as string)
        }
    }, [params.id])

    async function loadStatement(accountId: string) {
        try {
            setLoading(true)
            const repo = new SupabaseBankAccountRepository()
            const useCase = new GetAccountStatement(repo)
            const data = await useCase.execute(accountId)
            setStatement(data)
        } catch (error) {
            toast.error('Não foi possível carregar o extrato')
        } finally {
            setLoading(false)
        }
    }

    function handleRefresh() {
        if (params.id) {
            loadStatement(params.id as string)
        }
    }

    if (loading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-32 bg-muted rounded-lg"></div>
                    <div className="grid grid-cols-4 gap-4">
                        <div className="h-24 bg-muted rounded-lg"></div>
                        <div className="h-24 bg-muted rounded-lg"></div>
                        <div className="h-24 bg-muted rounded-lg"></div>
                        <div className="h-24 bg-muted rounded-lg"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (!statement) {
        return <div className="p-8">Conta não encontrada</div>
    }

    return (
        <div className="p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.push('/contas')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Extrato da Conta</h1>
                    <p className="text-muted-foreground">
                        Visualize e filtre todas as movimentações desta conta
                    </p>
                </div>
            </div>

            <EnhancedAccountStatementView
                statement={statement}
                onRefresh={handleRefresh}
                loading={loading}
            />
        </div>
    )
}
