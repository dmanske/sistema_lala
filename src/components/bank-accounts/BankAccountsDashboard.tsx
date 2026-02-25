'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, ArrowRightLeft, Wallet, TrendingUp, TrendingDown, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BankAccountCard } from './BankAccountCard';
import { TransferDialog } from './TransferDialog';
import { TransferHistory } from './TransferHistory';
import { getBankAccountsDashboard } from '@/app/(app)/bank-accounts/dashboard/actions';
import { cn } from '@/lib/utils';

export function BankAccountsDashboard() {
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isHelpExpanded, setIsHelpExpanded] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['bank-accounts-dashboard'],
    queryFn: getBankAccountsDashboard,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const { accounts = [], totalBalance = 0 } = data || {};
  const isPositive = totalBalance >= 0;

  return (
    <div className="space-y-6">
      {/* Saldo Total - Redesenhado */}
      <Card className="relative overflow-hidden border-0 shadow-lg">
        {/* Gradiente de fundo */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700" />
        
        {/* Efeito de brilho */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent" />
        
        {/* Círculos decorativos */}
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        
        <CardContent className="relative z-10 p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/80">Saldo Total Consolidado</p>
                <p className="text-xs text-white/60 mt-0.5">
                  {accounts.length} {accounts.length === 1 ? 'conta' : 'contas'} ativas
                </p>
              </div>
            </div>
            
            <Button
              size="sm"
              onClick={() => setIsTransferDialogOpen(true)}
              disabled={accounts.length < 2}
              className="bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm"
              variant="outline"
            >
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Transferir
            </Button>
          </div>
          
          <div className="flex items-baseline gap-3">
            <h2 className="text-5xl font-bold text-white tracking-tight">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(totalBalance)}
            </h2>
            {isPositive ? (
              <TrendingUp className="h-6 w-6 text-green-300" />
            ) : (
              <TrendingDown className="h-6 w-6 text-red-300" />
            )}
          </div>
          
          <div className="mt-4 flex items-center gap-2 text-sm text-white/70">
            <div className={cn(
              "px-2 py-1 rounded-md text-xs font-medium",
              isPositive ? "bg-green-500/20 text-green-200" : "bg-red-500/20 text-red-200"
            )}>
              {isPositive ? 'Saldo Positivo' : 'Saldo Negativo'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Contas */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Suas Contas</h3>
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

      {accounts.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 rounded-full bg-muted mb-4">
              <Wallet className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhuma conta cadastrada</h3>
            <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
              Comece adicionando sua primeira conta bancária para gerenciar seus saldos e fazer transferências
            </p>
            <Button asChild size="lg">
              <a href="/contas">
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Primeira Conta
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Histórico de Transferências */}
      {accounts.length > 0 && <TransferHistory />}

      {/* Dialog de Transferência */}
      <TransferDialog
        open={isTransferDialogOpen}
        onOpenChange={setIsTransferDialogOpen}
        accounts={accounts}
      />
    </div>
  );
}
