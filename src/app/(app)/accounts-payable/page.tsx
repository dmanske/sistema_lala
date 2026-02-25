'use client';

import { useEffect, useState } from 'react';
import { Plus, DollarSign, AlertCircle, TrendingUp, Filter, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AccountPayableDialog } from '@/components/accounts-payable/AccountPayableDialog';
import { PaymentDialog } from '@/components/accounts-payable/PaymentDialog';
import { AccountPayableStatusBadge } from '@/components/accounts-payable/AccountPayableStatusBadge';
import { useAccountsPayable } from '@/hooks/useAccountsPayable';
import { AccountPayableWithDetails, AccountPayableStatus } from '@/core/domain/entities/AccountPayable';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AccountsPayablePage() {
  const {
    accounts,
    summary,
    loading,
    fetchAccounts,
    fetchSummary,
    createAccount,
    updateAccount,
    deleteAccount,
    registerPayment,
  } = useAccountsPayable();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountPayableWithDetails | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchAccounts();
    fetchSummary();
  }, [fetchAccounts, fetchSummary]);

  const handleCreateAccount = async (data: any) => {
    await createAccount({
      description: data.description,
      amount: data.amount,
      dueDate: new Date(data.dueDate),
      category: data.category,
      supplierId: data.supplierId || undefined,
      notes: data.notes,
    });
  };

  const handleUpdateAccount = async (data: any) => {
    if (!selectedAccount) return;
    await updateAccount(selectedAccount.id, {
      description: data.description,
      amount: data.amount,
      dueDate: new Date(data.dueDate),
      category: data.category,
      supplierId: data.supplierId || undefined,
      notes: data.notes,
    });
  };

  const handleRegisterPayment = async (data: any) => {
    // Parse date as local date (YYYY-MM-DD format)
    const [year, month, day] = data.paidAt.split('-').map(Number);
    const paidAt = new Date(year, month - 1, day);

    await registerPayment({
      accountPayableId: data.accountPayableId,
      amount: data.amount,
      paidAt,
      paymentMethod: data.paymentMethod,
      bankAccountId: data.bankAccountId,
      notes: data.notes,
    });
  };

  const handleEditClick = (account: AccountPayableWithDetails) => {
    setSelectedAccount(account);
    setEditDialogOpen(true);
  };

  const handlePayClick = (account: AccountPayableWithDetails) => {
    setSelectedAccount(account);
    setPaymentDialogOpen(true);
  };

  const handleDeleteClick = (account: AccountPayableWithDetails) => {
    setSelectedAccount(account);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAccount) return;
    try {
      await deleteAccount(selectedAccount.id);
      setDeleteDialogOpen(false);
      setSelectedAccount(null);
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const filteredAccounts = accounts.filter((account) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'OVERDUE') return account.isOverdue;
    return account.paymentStatus === statusFilter;
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contas a Pagar</h1>
          <p className="text-muted-foreground">
            Gerencie todas as despesas do seu negócio
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Conta
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pendente</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.totalPending)}</div>
              <p className="text-xs text-muted-foreground">
                {summary.countPending} conta(s) pendente(s)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contas Vencidas</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {formatCurrency(summary.totalOverdue)}
              </div>
              <p className="text-xs text-muted-foreground">
                {summary.countOverdue} conta(s) vencida(s)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pago Este Mês</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.totalPaidThisMonth)}</div>
              <p className="text-xs text-muted-foreground">
                Pagamentos realizados
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Contas a Pagar</CardTitle>
              <CardDescription>
                {filteredAccounts.length} conta(s) encontrada(s)
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="PENDING">Pendente</SelectItem>
                  <SelectItem value="PARTIAL">Parcial</SelectItem>
                  <SelectItem value="PAID">Pago</SelectItem>
                  <SelectItem value="OVERDUE">Vencidas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando...
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma conta encontrada
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Pago</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">
                      {account.description}
                    </TableCell>
                    <TableCell>{account.category}</TableCell>
                    <TableCell>{account.supplierName || '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{formatDate(account.dueDate)}</span>
                        {account.daysOverdue && (
                          <span className="text-xs text-destructive">
                            {account.daysOverdue} dia(s) atrasado
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(account.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(account.paidAmount)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(account.remainingAmount)}
                    </TableCell>
                    <TableCell>
                      <AccountPayableStatusBadge
                        status={account.paymentStatus}
                        isOverdue={account.isOverdue}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {account.paymentStatus !== 'PAID' && account.paymentStatus !== 'CANCELLED' && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditClick(account)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePayClick(account)}
                            >
                              Pagar
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteClick(account)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AccountPayableDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateAccount}
      />

      <AccountPayableDialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setSelectedAccount(null);
        }}
        onSubmit={handleUpdateAccount}
        editData={selectedAccount ? {
          id: selectedAccount.id,
          description: selectedAccount.description,
          amount: selectedAccount.amount,
          dueDate: selectedAccount.dueDate,
          category: selectedAccount.category,
          supplierId: selectedAccount.supplierId,
          notes: selectedAccount.notes,
        } : undefined}
      />

      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        account={selectedAccount}
        onSubmit={handleRegisterPayment}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a conta "{selectedAccount?.description}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
