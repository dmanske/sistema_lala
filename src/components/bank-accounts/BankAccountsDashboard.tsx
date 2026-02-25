'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BankAccountCard } from './BankAccountCard';
import { TransferDialog } from './TransferDialog';
import { TransferHistory } from './TransferHistory';
import { getBankAccountsDashboard } from '@/app/(app)/bank-accounts/dashboard/actions';

export function BankAccountsDashboard() {
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['bank-accounts-dashboard'],
    queryFn: getBankAccountsDashboard,
  });

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  const { accounts = [], totalBalance = 0 } = data || {};

  return (
    <div className="space-y-6">
      {/* Saldo Total */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
          <Button
            size="sm"
            onClick={() => setIsTransferDialogOpen(true)}
            disabled={accounts.length < 2}
          >
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Nova Transferência
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(totalBalance)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Soma de todas as contas ({accounts.length} {accounts.length === 1 ? 'conta' : 'contas'})
          </p>
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
        <div className="text-center py-12 text-muted-foreground">
          <p>Nenhuma conta bancária cadastrada</p>
          <Button variant="link" className="mt-2" asChild>
            <a href="/contas">Cadastrar primeira conta</a>
          </Button>
        </div>
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
