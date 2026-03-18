'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, ArrowRightLeft, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BankAccountCard } from './BankAccountCard';
import { TransferDialog } from './TransferDialog';
import { TransferHistory } from './TransferHistory';
import { getBankAccountsDashboard } from '@/app/(app)/bank-accounts/dashboard/actions';

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export function BankAccountsDashboard() {
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['bank-accounts-dashboard'],
    queryFn: getBankAccountsDashboard,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  const { accounts = [], totalBalance = 0 } = data || {};
  const isPositive = totalBalance >= 0;

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
            <p className="text-sm text-slate-500">
              {accounts.length} {accounts.length === 1 ? 'conta' : 'contas'} · saldo consolidado
            </p>
          </div>
        </div>
        {accounts.length >= 2 && (
          <Button
            onClick={() => setIsTransferDialogOpen(true)}
            variant="outline"
            className="rounded-xl h-10 px-5 border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Transferir
          </Button>
        )}
      </div>

      {/* Hero — saldo total */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 p-8 shadow-2xl shadow-blue-200">
        {/* Decoração */}
        <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute top-1/2 right-1/4 h-32 w-32 rounded-full bg-indigo-500/30 blur-2xl" />

        <div className="relative">
          <p className="text-blue-200 text-sm font-medium mb-1">Saldo Total Consolidado</p>
          <div className="flex items-baseline gap-3 mb-4">
            <h2 className="text-5xl font-bold text-white tracking-tight">{brl(totalBalance)}</h2>
            {isPositive
              ? <TrendingUp className="h-7 w-7 text-emerald-300" />
              : <TrendingDown className="h-7 w-7 text-red-300" />
            }
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            isPositive
              ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30'
              : 'bg-red-400/20 text-red-200 border border-red-400/30'
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${isPositive ? 'bg-emerald-300' : 'bg-red-300'}`} />
            {isPositive ? 'Saldo positivo' : 'Saldo negativo'}
          </span>
        </div>
      </div>

      {/* Contas */}
      {accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-5">
            <Wallet className="h-10 w-10 text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-1">Nenhuma conta cadastrada</h3>
          <p className="text-sm text-slate-400 mb-6 max-w-xs">
            Adicione sua primeira conta bancária para gerenciar saldos e transferências
          </p>
          <Button asChild className="rounded-xl h-11 px-8 bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-200">
            <a href="/contas">
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Primeira Conta
            </a>
          </Button>
        </div>
      ) : (
        <>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Suas Contas</h2>
              <Button asChild variant="ghost" size="sm" className="text-xs text-blue-500 hover:text-blue-700 h-7">
                <a href="/contas">
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Nova conta
                </a>
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {accounts.map((account: any) => (
                <BankAccountCard
                  key={account.id}
                  account={account}
                  onEdit={() => {}}
                  onToggleActive={() => {}}
                />
              ))}
            </div>
          </div>

          {/* Histórico de Transferências */}
          <TransferHistory />
        </>
      )}

      <TransferDialog
        open={isTransferDialogOpen}
        onOpenChange={setIsTransferDialogOpen}
        accounts={accounts}
      />
    </div>
  );
}
