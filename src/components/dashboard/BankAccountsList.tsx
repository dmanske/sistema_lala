"use client";

import { Wallet, CreditCard, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";

interface BankAccountSummary {
  id: string;
  name: string;
  type: 'BANK' | 'CARD' | 'WALLET';
  balance: number;
}

interface BankAccountsListProps {
  accounts?: BankAccountSummary[];
}

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const typeIcon = { BANK: Banknote, CARD: CreditCard, WALLET: Wallet };
const typeLabel = { BANK: 'Banco', CARD: 'Cartão', WALLET: 'Carteira' };

export function BankAccountsList({ accounts }: BankAccountsListProps) {
  if (!accounts || accounts.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border shadow-sm p-8 flex flex-col items-center justify-center min-h-48 text-center">
        <div className="h-12 w-12 rounded-2xl bg-violet-50 flex items-center justify-center mb-3">
          <Wallet className="h-6 w-6 text-violet-400" />
        </div>
        <p className="text-sm font-semibold text-slate-600">Nenhuma conta encontrada</p>
        <p className="text-xs text-slate-400 mt-1">Carregando contas bancárias...</p>
      </div>
    );
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-violet-50 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-violet-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Contas Bancárias</p>
              <p className="text-xs text-slate-400">Saldo de cada conta</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Saldo Total</p>
            <p className={cn('text-xl font-bold', totalBalance >= 0 ? 'text-violet-600' : 'text-rose-500')}>
              {brl(totalBalance)}
            </p>
          </div>
        </div>
      </div>

      {/* Accounts */}
      <div className="divide-y divide-border">
        {accounts.map((account) => {
          const Icon = typeIcon[account.type] ?? Wallet;
          return (
            <div key={account.id} className="flex items-center gap-4 px-6 py-4 hover:bg-accent/30 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-700 truncate">{account.name}</p>
                <p className="text-xs text-slate-400">{typeLabel[account.type]}</p>
              </div>
              <p className={cn('text-base font-bold shrink-0', account.balance >= 0 ? 'text-emerald-600' : 'text-rose-500')}>
                {brl(account.balance)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
