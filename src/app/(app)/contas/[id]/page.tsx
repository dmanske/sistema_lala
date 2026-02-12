'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AccountStatementView } from '@/components/bank-accounts/AccountStatementView'
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
    const [filters, setFilters] = useState<{ startDate?: Date; endDate?: Date }>({})

    useEffect(() => {
        if (params.id) {
            loadStatement(params.id as string, filters)
        }
    }, [params.id])

    async function loadStatement(accountId: string, dateFilters: { startDate?: Date; endDate?: Date }) {
        try {
            setLoading(true)
            const repo = new SupabaseBankAccountRepository()
            const useCase = new GetAccountStatement(repo)
            const data = await useCase.execute(accountId, dateFilters)
            setStatement(data)
        } catch (error) {
            toast.error('Não foi possível carregar o extrato')
        } finally {
            setLoading(false)
        }
    }

    function handleFilterChange(startDate?: Date, endDate?: Date) {
        const newFilters = { startDate, endDate }
        setFilters(newFilters)
        if (params.id) {
            loadStatement(params.id as string, newFilters)
        }
    }

    if (loading) {
        return <div className="p-8">Carregando extrato...</div>
    }

    if (!statement) {
        return <div className="p-8">Conta não encontrada</div>
    }

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.push('/contas')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Extrato da Conta</h1>
                    <p className="text-muted-foreground">
                        Visualize todas as movimentações desta conta
                    </p>
                </div>
            </div>

            <AccountStatementView
                statement={statement}
                onFilterChange={handleFilterChange}
            />
        </div>
    )
}
