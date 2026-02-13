'use client'

import { useEffect, useState } from 'react'
import { BankAccountCard } from '@/components/bank-accounts/BankAccountCard'
import { BankAccountDialog } from '@/components/bank-accounts/BankAccountDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Search, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { BankAccountWithBalance, BankAccount } from '@/core/domain/BankAccount'
import { SupabaseBankAccountRepository } from '@/infrastructure/repositories/supabase/SupabaseBankAccountRepository'
import { ListBankAccounts } from '@/core/usecases/bank-accounts/ListBankAccounts'
import { CreateBankAccount } from '@/core/usecases/bank-accounts/CreateBankAccount'
import { UpdateBankAccount } from '@/core/usecases/bank-accounts/UpdateBankAccount'
import { DeactivateBankAccount } from '@/core/usecases/bank-accounts/DeactivateBankAccount'
import { toast } from 'sonner'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

export default function ContasPage() {
    const [accounts, setAccounts] = useState<BankAccountWithBalance[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null)
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('active')
    const [searchTerm, setSearchTerm] = useState('')

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

    async function handleSave(data: { 
        name: string
        type: 'BANK' | 'CARD' | 'WALLET'
        initialBalance?: number
        color: string
        icon: string
        description?: string
        creditLimit?: number
        bankName?: string
        agency?: string
        accountNumber?: string
        isFavorite: boolean
    }) {
        try {
            const repo = new SupabaseBankAccountRepository()

            if (selectedAccount) {
                const useCase = new UpdateBankAccount(repo)
                await useCase.execute(selectedAccount.id, {
                    name: data.name,
                    type: data.type,
                    color: data.color,
                    icon: data.icon,
                    description: data.description,
                    creditLimit: data.creditLimit,
                    bankName: data.bankName,
                    agency: data.agency,
                    accountNumber: data.accountNumber,
                    isFavorite: data.isFavorite
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
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-muted rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-64 bg-muted rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    const filteredAccounts = accounts.filter(account => {
        const matchesFilter = filter === 'all' || 
            (filter === 'active' && account.isActive) ||
            (filter === 'inactive' && !account.isActive)
        
        const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            account.bankName?.toLowerCase().includes(searchTerm.toLowerCase())
        
        return matchesFilter && matchesSearch
    })

    const totalBalance = accounts
        .filter(a => a.isActive)
        .reduce((sum, a) => sum + a.currentBalance, 0)
    
    const positiveBalance = accounts
        .filter(a => a.isActive && a.currentBalance > 0)
        .reduce((sum, a) => sum + a.currentBalance, 0)
    
    const negativeBalance = accounts
        .filter(a => a.isActive && a.currentBalance < 0)
        .reduce((sum, a) => sum + Math.abs(a.currentBalance), 0)

    const chartData = accounts
        .filter(a => a.isActive && a.currentBalance !== 0)
        .map(a => ({
            name: a.name,
            value: Math.abs(a.currentBalance),
            color: a.color
        }))

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value)
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

            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
                        <p className="text-xs text-muted-foreground">
                            {accounts.filter(a => a.isActive).length} contas ativas
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Saldos Positivos</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(positiveBalance)}</div>
                        <p className="text-xs text-muted-foreground">
                            {accounts.filter(a => a.isActive && a.currentBalance > 0).length} contas
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Saldos Negativos</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{formatCurrency(-negativeBalance)}</div>
                        <p className="text-xs text-muted-foreground">
                            {accounts.filter(a => a.isActive && a.currentBalance < 0).length} contas
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Gráfico de Distribuição */}
            {chartData.length > 0 && (
                <Card className="bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Distribuição de Saldos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatCurrency(Number(value || 0))} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            {/* Filtros e Busca */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar contas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={filter === 'all' ? 'default' : 'outline'}
                        onClick={() => setFilter('all')}
                    >
                        Todas
                    </Button>
                    <Button
                        variant={filter === 'active' ? 'default' : 'outline'}
                        onClick={() => setFilter('active')}
                    >
                        Ativas
                    </Button>
                    <Button
                        variant={filter === 'inactive' ? 'default' : 'outline'}
                        onClick={() => setFilter('inactive')}
                    >
                        Inativas
                    </Button>
                </div>
            </div>

            {/* Grid de Contas */}
            {filteredAccounts.length === 0 ? (
                <Card className="bg-card/50 backdrop-blur-sm">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Nenhuma conta encontrada</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            {searchTerm ? 'Tente buscar com outros termos' : 'Comece criando sua primeira conta'}
                        </p>
                        {!searchTerm && (
                            <Button onClick={handleNew}>
                                <Plus className="h-4 w-4 mr-2" />
                                Nova Conta
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAccounts.map((account) => (
                        <BankAccountCard
                            key={account.id}
                            account={account}
                            onEdit={handleEdit}
                            onToggleActive={handleToggleActive}
                        />
                    ))}
                </div>
            )}

            <BankAccountDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                account={selectedAccount}
                onSave={handleSave}
            />
        </div>
    )
}
