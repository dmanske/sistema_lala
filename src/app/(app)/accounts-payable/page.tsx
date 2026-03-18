'use client';

import { useEffect, useState } from 'react';
import {
  Plus, AlertCircle, TrendingDown, CheckCircle2,
  Filter, Pencil, Trash2, CreditCard, Loader2,
  Clock, Building2, CalendarX, Banknote, History,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { AccountPayableDialog, InstallmentData } from '@/components/accounts-payable/AccountPayableDialog';
import { PaymentDialog } from '@/components/accounts-payable/PaymentDialog';
import { PaymentHistorySheet } from '@/components/accounts-payable/PaymentHistorySheet';
import { useAccountsPayable } from '@/hooks/useAccountsPayable';
import { AccountPayableWithDetails } from '@/core/domain/entities/AccountPayable';
import { formatCurrency, formatDate } from '@/lib/utils';

const categoryLabels: Record<string, string> = {
  COMPRA: 'Compra',
  ALUGUEL: 'Aluguel',
  ENERGIA: 'Energia',
  AGUA: 'Água',
  INTERNET: 'Internet',
  TELEFONE: 'Telefone',
  IMPOSTOS: 'Impostos',
  SALARIOS: 'Salários',
  OUTROS: 'Outros',
};

function StatusBadge({ status, isOverdue }: { status: string; isOverdue?: boolean }) {
  if (isOverdue && status !== 'PAID' && status !== 'CANCELLED') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 border border-red-200">
        <CalendarX className="h-3 w-3" /> Vencida
      </span>
    );
  }
  switch (status) {
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600 border border-amber-200">
          <Clock className="h-3 w-3" /> Pendente
        </span>
      );
    case 'PARTIAL':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 border border-blue-200">
          <Banknote className="h-3 w-3" /> Parcial
        </span>
      );
    case 'PAID':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 border border-emerald-200">
          <CheckCircle2 className="h-3 w-3" /> Pago
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500 border border-slate-200">
          {status}
        </span>
      );
  }
}

export default function AccountsPayablePage() {
  const {
    accounts,
    summary,
    loading,
    fetchAccounts,
    fetchSummary,
    createAccount,
    createInstallments,
    updateAccount,
    deleteAccount,
    registerPayment,
  } = useAccountsPayable();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [historySheetOpen, setHistorySheetOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountPayableWithDetails | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [supplierFilter, setSupplierFilter] = useState<string>('');
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetchAccounts();
    fetchSummary();
    // Busca fornecedores para o filtro
    import('@/lib/supabase/client').then(({ createClient }) => {
      createClient()
        .from('suppliers')
        .select('id, name')
        .order('name')
        .then(({ data }) => { if (data) setSuppliers(data); });
    });
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

  const handleCreateInstallments = async (installments: InstallmentData[]) => {
    await createInstallments(installments);
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

  const filteredAccounts = accounts.filter((account) => {
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'OVERDUE' && !account.isOverdue) return false;
      if (statusFilter !== 'OVERDUE' && account.paymentStatus !== statusFilter) return false;
    }
    if (supplierFilter && account.supplierId !== supplierFilter) return false;
    if (startDateFilter) {
      const start = new Date(startDateFilter);
      if (new Date(account.dueDate) < start) return false;
    }
    if (endDateFilter) {
      const end = new Date(endDateFilter);
      if (new Date(account.dueDate) > end) return false;
    }
    return true;
  });

  const hasActiveFilters = statusFilter !== 'ALL' || supplierFilter || startDateFilter || endDateFilter;

  const clearFilters = () => {
    setStatusFilter('ALL');
    setSupplierFilter('');
    setStartDateFilter('');
    setEndDateFilter('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-rose-200">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800">Contas a Pagar</h1>
              <p className="text-sm text-slate-500">Gerencie todas as despesas do seu negócio</p>
            </div>
          </div>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-lg shadow-rose-200 rounded-xl h-11 px-6"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Conta
          </Button>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-card rounded-2xl border border-border shadow-sm p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Total Pendente</p>
                <p className="text-2xl font-bold text-slate-800 mt-0.5">{formatCurrency(summary.totalPending)}</p>
                <p className="text-xs text-slate-400 mt-0.5">{summary.countPending} conta(s) pendente(s)</p>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-red-100 shadow-sm p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-red-400 font-medium uppercase tracking-wide">Vencidas</p>
                <p className="text-2xl font-bold text-red-600 mt-0.5">{formatCurrency(summary.totalOverdue)}</p>
                <p className="text-xs text-slate-400 mt-0.5">{summary.countOverdue} conta(s) vencida(s)</p>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-emerald-100 shadow-sm p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <TrendingDown className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-emerald-500 font-medium uppercase tracking-wide">Pago Este Mês</p>
                <p className="text-2xl font-bold text-slate-800 mt-0.5">{formatCurrency(summary.totalPaidThisMonth)}</p>
                <p className="text-xs text-slate-400 mt-0.5">Pagamentos realizados</p>
              </div>
            </div>
          </div>
        )}

        {/* Lista */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">

          {/* Barra de filtros */}
          <div className="px-6 py-4 border-b border-slate-100 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-semibold text-slate-700">Filtros</span>
                <Badge variant="secondary" className="rounded-full text-xs bg-slate-100 text-slate-500 border-0">
                  {filteredAccounts.length} resultado{filteredAccounts.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs text-slate-400 hover:text-slate-600 px-2">
                  Limpar filtros
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 h-8 rounded-lg border-slate-200 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="ALL">Todos os status</SelectItem>
                  <SelectItem value="PENDING">Pendente</SelectItem>
                  <SelectItem value="PARTIAL">Parcial</SelectItem>
                  <SelectItem value="PAID">Pago</SelectItem>
                  <SelectItem value="OVERDUE">Vencidas</SelectItem>
                </SelectContent>
              </Select>

              <Select value={supplierFilter || 'ALL'} onValueChange={(v) => setSupplierFilter(v === 'ALL' ? '' : v)}>
                <SelectTrigger className="w-44 h-8 rounded-lg border-slate-200 text-xs">
                  <SelectValue placeholder="Fornecedor" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="ALL">Todos os fornecedores</SelectItem>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400">Venc. de</span>
                <input
                  type="date"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                  className="h-8 rounded-lg border border-slate-200 px-2 text-xs text-slate-600 focus:outline-none focus:ring-1 focus:ring-rose-300"
                />
                <span className="text-xs text-slate-400">até</span>
                <input
                  type="date"
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                  className="h-8 rounded-lg border border-slate-200 px-2 text-xs text-slate-600 focus:outline-none focus:ring-1 focus:ring-rose-300"
                />
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-rose-400" />
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <CreditCard className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-500">Nenhuma conta encontrada</p>
              <p className="text-xs text-slate-400 mt-1">Tente mudar o filtro ou adicione uma nova conta</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filteredAccounts.map((account) => {
                const isOverdueRow = account.isOverdue && account.paymentStatus !== 'PAID';
                const isPaid = account.paymentStatus === 'PAID';
                const canAct = account.paymentStatus !== 'PAID' && account.paymentStatus !== 'CANCELLED';

                return (
                  <div
                    key={account.id}
                    className={`flex items-center gap-4 px-6 py-4 hover:bg-slate-50/70 transition-colors ${
                      isOverdueRow ? 'border-l-2 border-red-400' : isPaid ? 'border-l-2 border-emerald-300' : 'border-l-2 border-transparent'
                    }`}
                  >
                    {/* Ícone de status */}
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isOverdueRow ? 'bg-red-50' : isPaid ? 'bg-emerald-50' : 'bg-amber-50'
                    }`}>
                      {isOverdueRow ? (
                        <CalendarX className="h-4 w-4 text-red-400" />
                      ) : isPaid ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-amber-400" />
                      )}
                    </div>

                    {/* Descrição e fornecedor */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${isPaid ? 'text-slate-400' : 'text-slate-700'}`}>
                        {account.description}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-400">
                          {categoryLabels[account.category] ?? account.category}
                        </span>
                        {account.supplierName && (
                          <>
                            <span className="text-slate-200">·</span>
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                              <Building2 className="h-3 w-3" />
                              {account.supplierName}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Vencimento */}
                    <div className="text-right shrink-0 w-28 hidden sm:block">
                      <p className="text-xs text-slate-400">Vencimento</p>
                      <p className={`text-sm font-medium ${isOverdueRow ? 'text-red-500' : 'text-slate-600'}`}>
                        {formatDate(account.dueDate)}
                      </p>
                      {account.daysOverdue ? (
                        <p className="text-xs text-red-400">{account.daysOverdue}d atraso</p>
                      ) : null}
                    </div>

                    {/* Valores */}
                    <div className="text-right shrink-0 w-28 hidden md:block">
                      <p className="text-xs text-slate-400">Valor</p>
                      <p className="text-sm font-semibold text-slate-700">{formatCurrency(account.amount)}</p>
                    </div>

                    <div className="text-right shrink-0 w-28 hidden lg:block">
                      <p className="text-xs text-slate-400">Saldo</p>
                      <p className={`text-sm font-bold ${account.remainingAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {formatCurrency(account.remainingAmount)}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="shrink-0 hidden sm:block">
                      <StatusBadge status={account.paymentStatus} isOverdue={account.isOverdue} />
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-1 shrink-0">
                      {account.paidAmount > 0 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => { setSelectedAccount(account); setHistorySheetOpen(true); }}
                          className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100"
                          title="Ver pagamentos"
                        >
                          <History className="h-3.5 w-3.5 text-slate-400" />
                        </Button>
                      )}
                      {canAct && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { setSelectedAccount(account); setEditDialogOpen(true); }}
                            className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100"
                          >
                            <Pencil className="h-3.5 w-3.5 text-slate-400" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => { setSelectedAccount(account); setPaymentDialogOpen(true); }}
                            className="h-8 px-3 rounded-lg text-xs bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm"
                          >
                            Pagar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { setSelectedAccount(account); setDeleteDialogOpen(true); }}
                            className="h-8 w-8 p-0 rounded-lg hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-slate-400" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Dialogs */}
        <AccountPayableDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSubmit={handleCreateAccount}
          onSubmitInstallments={handleCreateInstallments}
        />

        <AccountPayableDialog
          open={editDialogOpen}
          onOpenChange={(open) => { setEditDialogOpen(open); if (!open) setSelectedAccount(null); }}
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

        <PaymentHistorySheet
          open={historySheetOpen}
          onOpenChange={setHistorySheetOpen}
          account={selectedAccount}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir <span className="font-medium text-slate-700">"{selectedAccount?.description}"</span>?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  if (!selectedAccount) return;
                  await deleteAccount(selectedAccount.id);
                  setDeleteDialogOpen(false);
                  setSelectedAccount(null);
                }}
                className="rounded-xl bg-red-500 hover:bg-red-600"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

    </div>
  );
}
