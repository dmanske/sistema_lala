'use client'

import { useState } from 'react'
import { BankAccountCard } from '@/components/bank-accounts/BankAccountCard'
import { BankAccountsList } from '@/components/bank-accounts/BankAccountsList'
import { BankAccountDialog } from '@/components/bank-accounts/BankAccountDialog'
import { TransferDialog } from '@/components/bank-accounts/TransferDialog'
import { AccountsFilter } from '@/components/bank-accounts/AccountsFilter'
import { Button } from '@/components/ui/button'
import { Plus, Wallet, ArrowRightLeft, TrendingUp, TrendingDown } from 'lucide-react'
import { BankAccountWithBalance, BankAccount } from '@/core/domain/BankAccount'
import { useBankAccounts } from '@/hooks/useBankAccounts'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function ContasPage() {
  const { accounts, loading, createAccount, updateAccount, toggleAccountStatus, deleteAccount, refresh } = useBankAccounts()
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
    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && account.isActive) ||
      (filter === 'inactive' && !account.isActive)
    const matchesSearch =
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.bankName?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const activeAccounts = accounts.filter(a => a.isActive)
  const totalBalance = activeAccounts.reduce((sum, a) => sum + a.currentBalance, 0)
  const positiveBalance = activeAccounts.filter(a => a.currentBalance > 0).reduce((sum, a) => sum + a.currentBalance, 0)
  const negativeBalance = activeAccounts.filter(a => a.currentBalance < 0).reduce((sum, a) => sum + Math.abs(a.currentBalance), 0)

  const chartData = accounts
    .filter(a => a.isActive && a.currentBalance !== 0)
    .map(a => ({ name: a.name, value: Math.abs(a.currentBalance), color: a.color }))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800">Contas Bancárias</h1>
              <p className="text-sm text-slate-500">Gerencie seu patrimônio e fluxo de caixa</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setTransferDialogOpen(true)}
              disabled={activeAccounts.length < 2}
              variant="outline"
              className="rounded-xl h-10 px-5 border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Transferir
            </Button>
            <Button
              onClick={handleNew}
              className="rounded-xl h-10 px-5 bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-shadow"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Saldo Total</span>
              <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center">
                <Wallet className="h-4 w-4 text-blue-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800">{brl(totalBalance)}</p>
            <p className="text-xs text-slate-400 mt-1">{activeAccounts.length} {activeAccounts.length === 1 ? 'conta ativa' : 'contas ativas'}</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Saldos Positivos</span>
              <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-600">{brl(positiveBalance)}</p>
            <p className="text-xs text-slate-400 mt-1">{activeAccounts.filter(a => a.currentBalance > 0).length} contas</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Saldos Negativos</span>
              <div className="h-8 w-8 rounded-xl bg-red-50 flex items-center justify-center">
                <TrendingDown className="h-4 w-4 text-red-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-red-500">{brl(-negativeBalance)}</p>
            <p className="text-xs text-slate-400 mt-1">{activeAccounts.filter(a => a.currentBalance < 0).length} contas</p>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Accounts */}
          <div className="lg:col-span-2 space-y-5">
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
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center py-20 text-center">
                <div className="h-16 w-16 rounded-3xl bg-slate-100 flex items-center justify-center mb-4">
                  <Wallet className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-1">
                  {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhuma conta cadastrada'}
                </h3>
                <p className="text-sm text-slate-400 mb-6 max-w-xs">
                  {searchTerm
                    ? 'Tente buscar com outros termos.'
                    : 'Cadastre suas contas bancárias, cartões ou carteiras para começar.'}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={handleNew}
                    className="rounded-xl h-10 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Conta
                  </Button>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAccounts.map((account) => (
                  <BankAccountCard
                    key={account.id}
                    account={account}
                    onEdit={handleEdit}
                    onToggleActive={toggleAccountStatus}
                    onDelete={deleteAccount}
                  />
                ))}
              </div>
            ) : (
              <BankAccountsList
                accounts={filteredAccounts}
                onEdit={handleEdit}
                onToggleActive={toggleAccountStatus}
                onDelete={deleteAccount}
              />
            )}
          </div>

          {/* Sidebar — pie chart */}
          <div>
            {chartData.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 lg:sticky lg:top-8">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                  Distribuição de Saldo
                </h2>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => brl(Number(value || 0))}
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2.5">
                  {chartData.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                        <span className="text-sm text-slate-600 truncate max-w-[120px]">{entry.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{brl(entry.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
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
        accounts={activeAccounts}
      />
    </div>
  )
}
