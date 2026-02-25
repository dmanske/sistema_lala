"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, CreditCard, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";

interface BankAccountSummary {
  id: string;
  name: string;
  type: 'BANK' | 'CARD' | 'WALLET';
  balance: number;
  icon?: string;
  color?: string;
}

interface BankAccountsListProps {
  accounts?: BankAccountSummary[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const getAccountIcon = (type: string) => {
  switch (type) {
    case 'BANK':
      return Banknote;
    case 'CARD':
      return CreditCard;
    case 'WALLET':
      return Wallet;
    default:
      return Wallet;
  }
};

export function BankAccountsList({ accounts }: BankAccountsListProps) {
  if (!accounts || accounts.length === 0) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Wallet className="h-4 w-4 text-purple-600" />
            </div>
            Contas Bancárias
          </CardTitle>
          <CardDescription>Saldo de cada conta bancária</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            <p>Carregando contas...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Wallet className="h-4 w-4 text-purple-600" />
          </div>
          Contas Bancárias
        </CardTitle>
        <CardDescription>Saldo de cada conta bancária</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Total */}
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-purple-50/50 rounded-xl border border-purple-100">
            <span className="font-bold text-slate-800">Saldo Total</span>
            <span className="font-bold text-purple-600 text-xl">{formatCurrency(totalBalance)}</span>
          </div>

          {/* Lista de contas */}
          <div className="space-y-2">
            {accounts.map((account) => {
              const Icon = getAccountIcon(account.type);
              return (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-3.5 bg-white border border-slate-100 rounded-xl hover:border-purple-200 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-purple-50 transition-colors">
                      <Icon className="h-4 w-4 text-slate-600 group-hover:text-purple-600 transition-colors" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{account.name}</div>
                      <div className="text-xs text-slate-500 capitalize">{account.type.toLowerCase()}</div>
                    </div>
                  </div>
                  <div className={cn(
                    "font-bold text-lg",
                    account.balance >= 0 ? "text-emerald-600" : "text-rose-600"
                  )}>
                    {formatCurrency(account.balance)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
