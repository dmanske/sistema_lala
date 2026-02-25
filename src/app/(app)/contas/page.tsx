'use client'

import { useState } from 'react'
import { BankAccountCard } from '@/components/bank-accounts/BankAccountCard'
import { BankAccountsList } from '@/components/bank-accounts/BankAccountsList'
import { BankAccountDialog } from '@/components/bank-accounts/BankAccountDialog'
import { TransferDialog } from '@/components/bank-accounts/TransferDialog'
import { StatsCards } from '@/components/bank-accounts/StatsCards'
import { AccountsFilter } from '@/components/bank-accounts/AccountsFilter'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Wallet, ArrowRightLeft } from 'lucide-react'
import { BankAccountWithBalance, BankAccount } from '@/core/domain/BankAccount'
import { useBankAccounts } from '@/hooks/useBankAccounts'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

export default function ContasPage() {
    const { accounts, loading, createAccount, updateAccount, toggleAccountStatus, refresh } = useBankAccounts()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [transferDialogOpen, setTransferDialogOpen] = useState(false)
    const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null)
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('active')
    const [searchTerm, setSearchTerm] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    async function handleSave(data: any) {
        let success = false
        if (selectedAccount) {
            success = await updateAccount(selectedAccount.id, data)
        } else {
            success = await createAccount(data)
        }

        if (success) {
            setDialogOpen(false)
            setSelectedAccount(null)
            refresh()
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

    const filteredAccounts = accounts.filter(account => {
        const matchesFilter = filter === 'all' ||
            (filter === 'active' && account.isActive) ||
            (filter === 'inactive' && !account.isActive)

        const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            account.bankName?.toLowerCase().includes(searchTerm.toLowerCase())

        return matchesFilter && matchesSearch
    })

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

    if (loading) {
        return (
            <div className="p-4 space-y-4 animate-in fade-in duration-500">
                <div className="flex justify-between items-center">
                    <div className="h-10 bg-muted/40 rounded w-48 animate-pulse"></div>
                    <div className="h-10 bg-muted/40 rounded w-32 animate-pulse"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 bg-muted/30 rounded-xl animate-pulse"></div>
                    ))}
                </div>
                <div className="h-12 bg-muted/20 rounded-xl animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-64 bg-muted/30 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 space-y-4 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Contas Bancárias
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Gerencie seu patrimônio e fluxo de caixa
                    </p>
                </div>
                <Button
                    onClick={() => setTransferDialogOpen(true)}
                    disabled={accounts.filter(a => a.isActive).length < 2}
                    className="shadow-lg hover:shadow-primary/20 transition-all"
                >
                    <ArrowRightLeft className="h-4 w-4 mr-2" />
                    Nova Transferência
                </Button>
            </div>

            <StatsCards accounts={accounts} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <AccountsFilter
                        filter={filter}
                        onFilterChange={setFilter}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        onNewAccount={handleNew}
                    />

                    {filteredAccounts.length === 0 ? (
                        <Card className="bg-card/50 backdrop-blur-sm border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="p-4 rounded-full bg-muted mb-4">
                                    <Wallet className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Nenhuma conta encontrada</h3>
                                <p className="text-muted-foreground mb-6 max-w-sm">
                                    {searchTerm ? 'Tente buscar com outros termos.' : 'Cadastre suas contas bancárias, cartões ou carteiras para começar.'}
                                </p>
                                {!searchTerm && (
                                    <Button onClick={handleNew} size="lg" className="shadow-lg hover:shadow-primary/20 transition-all">
                                        <Plus className="h-5 w-5 mr-2" />
                                        Nova Conta
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredAccounts.map((account) => (
                                    <BankAccountCard
                                        key={account.id}
                                        account={account}
                                        onEdit={handleEdit}
                                        onToggleActive={toggleAccountStatus}
                                    />
                                ))}
                            </div>
                        ) : (
                            <BankAccountsList
                                accounts={filteredAccounts}
                                onEdit={handleEdit}
                                onToggleActive={toggleAccountStatus}
                            />
                        )
                    )}
                </div>

                <div className="space-y-6">
                    {/* Gráfico de Distribuição - Coluna Lateral */}
                    {chartData.length > 0 && (
                        <Card className="bg-card/50 backdrop-blur-sm border-primary/10 lg:sticky lg:top-8">
                            <CardHeader>
                                <CardTitle className="text-lg">Distribuição de Saldo</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] w-full flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                                labelLine={false}
                                            >
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value) => formatCurrency(Number(value || 0))}
                                                contentStyle={{
                                                    backgroundColor: 'hsl(var(--card))',
                                                    borderColor: 'hsl(var(--border))',
                                                    borderRadius: 'var(--radius)',
                                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                                }}
                                                itemStyle={{ color: 'hsl(var(--foreground))' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-4 space-y-2">
                                    {chartData.map((entry, index) => (
                                        <div key={index} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: entry.color }}
                                                />
                                                <span className="text-muted-foreground">{entry.name}</span>
                                            </div>
                                            <span className="font-medium">{formatCurrency(entry.value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            <BankAccountDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                account={selectedAccount}
                onSave={handleSave}
            />

            <TransferDialog
                open={transferDialogOpen}
                onOpenChange={setTransferDialogOpen}
                accounts={accounts.filter(a => a.isActive)}
            />
        </div>
    )
}
