'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { InstallmentStatusBadge } from '@/components/receivables/InstallmentStatusBadge';
import { ReceivePaymentDialog } from '@/components/receivables/ReceivePaymentDialog';
import { CreateInstallmentSaleDialog } from '@/components/receivables/CreateInstallmentSaleDialog';
import { EditInstallmentDialog } from '@/components/receivables/EditInstallmentDialog';
import { useSaleInstallments } from '@/hooks/useSaleInstallments';
import { formatBrazilDate } from '@/lib/utils/dateUtils';
import {
  DollarSign, AlertCircle, Clock, TrendingUp, Pencil, Trash2,
  Plus, Search, CheckCircle2, MessageCircle, Banknote,
} from 'lucide-react';
import type { SaleInstallmentWithDetails } from '@/core/domain/entities/SaleInstallment';
import { createClient } from '@/lib/supabase/client';

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

const paymentMethodLabel: Record<string, string> = {
  CASH: 'Dinheiro', PIX: 'PIX', CREDIT_CARD: 'Cartão Créd.',
  DEBIT_CARD: 'Cartão Déb.', BANK_TRANSFER: 'Transferência', CHECK: 'Cheque',
};

export default function ReceivablesPage() {
  const [pendingList, setPendingList] = useState<SaleInstallmentWithDetails[]>([]);
  const [overdueList, setOverdueList] = useState<SaleInstallmentWithDetails[]>([]);
  const [receivedList, setReceivedList] = useState<SaleInstallmentWithDetails[]>([]);
  const [summary, setSummary] = useState({
    totalPending: 0, totalOverdue: 0,
    totalDueIn7Days: 0, totalDueIn30Days: 0,
    countPending: 0, countOverdue: 0,
  });
  const [bankAccounts, setBankAccounts] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedInstallment, setSelectedInstallment] = useState<SaleInstallmentWithDetails | null>(null);
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);
  const [createSaleDialogOpen, setCreateSaleDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const { listReceivables, getSummary, registerReceipt, createInstallmentSale } = useSaleInstallments();

  const loadData = async () => {
    setLoading(true);
    try {
      const [summaryData, pending, overdue, received] = await Promise.all([
        getSummary(),
        listReceivables({ status: 'PENDING' }),
        listReceivables({ status: 'OVERDUE' }),
        listReceivables({ status: 'RECEIVED' }),
      ]);
      setSummary(summaryData);
      setPendingList(pending);
      setOverdueList(overdue);
      setReceivedList(received);
    } catch (error) {
      console.error('Failed to load receivables:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBankAccounts = async () => {
    const supabase = createClient();
    const { data } = await supabase.from('bank_accounts').select('id, name').eq('is_active', true).order('name');
    if (data) setBankAccounts(data);
  };

  useEffect(() => { loadData(); loadBankAccounts(); }, []);

  // Filtered lists by search
  const filterBySearch = (list: SaleInstallmentWithDetails[]) =>
    search.trim()
      ? list.filter(i => i.clientName.toLowerCase().includes(search.toLowerCase()))
      : list;

  const filteredPending = useMemo(() => filterBySearch(pendingList), [pendingList, search]);
  const filteredOverdue = useMemo(() => filterBySearch(overdueList), [overdueList, search]);
  const filteredReceived = useMemo(() => filterBySearch(receivedList), [receivedList, search]);

  const handleReceivePayment = (i: SaleInstallmentWithDetails) => { setSelectedInstallment(i); setReceiveDialogOpen(true); };
  const handleEditClick = (i: SaleInstallmentWithDetails) => { setSelectedInstallment(i); setEditDialogOpen(true); };
  const handleDeleteClick = (i: SaleInstallmentWithDetails) => { setSelectedInstallment(i); setDeleteDialogOpen(true); };

  const handleConfirmDelete = async () => {
    if (!selectedInstallment) return;
    try {
      const supabase = createClient();
      const { error } = await supabase.from('sale_installments').delete().eq('id', selectedInstallment.id);
      if (error) throw error;
      await loadData();
      setDeleteDialogOpen(false);
      setSelectedInstallment(null);
    } catch (error) {
      console.error('Failed to delete installment:', error);
    }
  };

  const handleUpdateInstallment = async (data: { amount: number; dueDate: Date }) => {
    if (!selectedInstallment) return;
    const supabase = createClient();
    const { error } = await supabase
      .from('sale_installments')
      .update({ amount: data.amount, due_date: data.dueDate.toISOString().split('T')[0] })
      .eq('id', selectedInstallment.id);
    if (error) throw error;
    await loadData();
    setEditDialogOpen(false);
    setSelectedInstallment(null);
  };

  const handleSubmitReceipt = async (data: {
    receivedAmount: number; receivedAt: Date;
    bankAccountId: string; paymentMethod: string; notes?: string;
  }) => {
    if (!selectedInstallment) return;
    await registerReceipt({
      installmentId: selectedInstallment.id,
      receivedAmount: data.receivedAmount,
      receivedAt: data.receivedAt,
      bankAccountId: data.bankAccountId,
      paymentMethod: data.paymentMethod as any,
      notes: data.notes,
    });
    await loadData();
  };

  const handleCreateNewSale = async (data: {
    clientId: string; totalAmount: number; description: string;
    installments: Array<{ installmentNumber: number; amount: number; dueDate: Date }>;
  }) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const { data: profile, error: profileError } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
    if (profileError || !profile) throw new Error('Failed to get user profile');
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert({ tenant_id: profile.tenant_id, customer_id: data.clientId, subtotal: data.totalAmount, discount: 0, total: data.totalAmount, status: 'paid', notes: data.description, created_by: user.id })
      .select('id').single();
    if (saleError || !sale) throw new Error('Failed to create sale: ' + (saleError?.message || 'Unknown error'));
    await createInstallmentSale({ saleId: sale.id, installments: data.installments });
    await loadData();
  };

  const openWhatsApp = (installment: SaleInstallmentWithDetails) => {
    const phone = (installment.clientWhatsapp || installment.clientPhone || '').replace(/\D/g, '');
    if (!phone) return;
    const msg = encodeURIComponent(
      `Olá ${installment.clientName}! Passando para lembrar que a parcela ${installment.installmentNumber} no valor de ${brl(installment.amount)} venceu em ${formatBrazilDate(installment.dueDate, 'dd/MM/yyyy')}. Podemos acertar?`
    );
    window.open(`https://wa.me/55${phone}?text=${msg}`, '_blank');
  };

  // ── Shared list row component ─────────────────────────────────────────────
  const InstallmentRow = ({ installment, showActions = true, showReceived = false }: {
    installment: SaleInstallmentWithDetails;
    showActions?: boolean;
    showReceived?: boolean;
  }) => {
    const hasWhatsapp = !!(installment.clientWhatsapp || installment.clientPhone);
    return (
      <div className={`flex items-center gap-4 px-5 py-4 hover:bg-slate-50/60 transition-colors ${installment.isOverdue ? 'border-l-2 border-l-red-400' : ''}`}>
        {/* Avatar */}
        <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0 text-sm font-bold text-teal-600">
          {getInitials(installment.clientName)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-700 truncate">{installment.clientName}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <p className="text-xs text-slate-400">
              Parcela {installment.installmentNumber} · {formatBrazilDate(installment.dueDate, 'dd/MM/yyyy')}
            </p>
            {installment.saleNotes && (
              <>
                <span className="text-slate-200">·</span>
                <p className="text-xs text-slate-400 truncate max-w-[180px]">{installment.saleNotes}</p>
              </>
            )}
            {installment.isOverdue && installment.daysOverdue > 0 && (
              <>
                <span className="text-slate-200">·</span>
                <p className="text-xs text-red-500 font-medium">{installment.daysOverdue}d atrasado</p>
              </>
            )}
          </div>
        </div>

        {/* Received info */}
        {showReceived && installment.receivedAt && (
          <div className="hidden sm:block text-right shrink-0">
            <p className="text-xs text-slate-400">{formatBrazilDate(installment.receivedAt, 'dd/MM/yyyy')}</p>
            {installment.notes && (
              <p className="text-xs text-slate-400">{paymentMethodLabel[installment.notes] ?? installment.notes}</p>
            )}
          </div>
        )}

        {/* Amount */}
        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-slate-700">{brl(installment.amount)}</p>
          {showReceived && installment.receivedAmount && installment.receivedAmount !== installment.amount && (
            <p className="text-xs text-emerald-600">recebido: {brl(installment.receivedAmount)}</p>
          )}
        </div>

        {/* Status */}
        <div className="hidden sm:block shrink-0">
          <InstallmentStatusBadge
            status={installment.status}
            isOverdue={installment.isOverdue}
            daysOverdue={installment.daysOverdue}
          />
        </div>

        {/* Actions */}
        {showActions && installment.status === 'PENDING' && (
          <div className="flex items-center gap-1 shrink-0">
            {hasWhatsapp && installment.isOverdue && (
              <button
                onClick={() => openWhatsApp(installment)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-green-500 hover:bg-green-50 transition-colors"
                title="Enviar WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => handleEditClick(installment)}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
              title="Editar"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => handleReceivePayment(installment)}
              className="h-8 px-3 rounded-lg text-xs font-semibold bg-teal-50 text-teal-600 hover:bg-teal-100 border border-teal-200 transition-colors"
            >
              Receber
            </button>
            <button
              onClick={() => handleDeleteClick(installment)}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors"
              title="Excluir"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const ListSection = ({ items, emptyText, showReceived = false }: {
    items: SaleInstallmentWithDetails[];
    emptyText: string;
    showReceived?: boolean;
  }) => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {loading ? (
        <div className="divide-y divide-slate-50">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <div className="h-10 w-10 rounded-xl bg-slate-100 animate-pulse shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-36 bg-slate-100 rounded animate-pulse" />
                <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
              </div>
              <div className="h-3.5 w-20 bg-slate-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-14 w-14 rounded-3xl bg-slate-100 flex items-center justify-center mb-3">
            <CheckCircle2 className="h-7 w-7 text-slate-300" />
          </div>
          <p className="text-sm font-semibold text-slate-600">{emptyText}</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {items.map(i => (
            <InstallmentRow
              key={i.id}
              installment={i}
              showActions={!showReceived}
              showReceived={showReceived}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 pb-10">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-200">
            <Banknote className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">Contas a Receber</h1>
            <p className="text-sm text-slate-500">Controle de parcelas e recebimentos</p>
          </div>
        </div>
        <Button
          onClick={() => setCreateSaleDialogOpen(true)}
          className="rounded-xl h-10 px-5 bg-gradient-to-r from-teal-500 to-emerald-600 shadow-lg shadow-teal-200 hover:shadow-teal-300 transition-shadow"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Venda Parcelada
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Pendente</span>
            <div className="h-8 w-8 rounded-xl bg-teal-50 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-teal-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800">{brl(summary.totalPending)}</p>
          <p className="text-xs text-slate-400 mt-1">{summary.countPending} {summary.countPending === 1 ? 'parcela' : 'parcelas'}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Vencidas</span>
            <div className="h-8 w-8 rounded-xl bg-red-50 flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-red-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-500">{brl(summary.totalOverdue)}</p>
          <p className="text-xs text-slate-400 mt-1">{summary.countOverdue} {summary.countOverdue === 1 ? 'parcela' : 'parcelas'}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Vence em 7 dias</span>
            <div className="h-8 w-8 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock className="h-4 w-4 text-amber-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-600">{brl(summary.totalDueIn7Days)}</p>
          <p className="text-xs text-slate-400 mt-1">Próximos 7 dias</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Vence em 30 dias</span>
            <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-600">{brl(summary.totalDueIn30Days)}</p>
          <p className="text-xs text-slate-400 mt-1">Próximos 30 dias</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por cliente..."
            className="pl-9 rounded-xl border-slate-200 bg-slate-50 focus:bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border border-slate-200 shadow-sm rounded-xl p-1 h-auto w-fit gap-1">
          <TabsTrigger
            value="pending"
            className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
          >
            <Clock className="h-4 w-4" />
            Pendentes
            {summary.countPending > 0 && (
              <span className="ml-1 bg-teal-100 text-teal-700 data-[state=active]:bg-white/20 data-[state=active]:text-white rounded-full px-1.5 py-0.5 text-xs font-bold">
                {summary.countPending}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="overdue"
            className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
          >
            <AlertCircle className="h-4 w-4" />
            Vencidas
            {summary.countOverdue > 0 && (
              <span className="ml-1 bg-red-100 text-red-700 rounded-full px-1.5 py-0.5 text-xs font-bold">
                {summary.countOverdue}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="received"
            className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
          >
            <CheckCircle2 className="h-4 w-4" />
            Recebidas
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="pending" className="mt-0 space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {filteredPending.length} {filteredPending.length === 1 ? 'parcela' : 'parcelas'}
            </p>
            <ListSection items={filteredPending} emptyText="Nenhuma parcela pendente" />
          </TabsContent>

          <TabsContent value="overdue" className="mt-0 space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {filteredOverdue.length} {filteredOverdue.length === 1 ? 'parcela vencida' : 'parcelas vencidas'}
            </p>
            <ListSection items={filteredOverdue} emptyText="Nenhuma parcela vencida" />
          </TabsContent>

          <TabsContent value="received" className="mt-0 space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {filteredReceived.length} {filteredReceived.length === 1 ? 'recebimento' : 'recebimentos'}
            </p>
            <ListSection items={filteredReceived} emptyText="Nenhum recebimento registrado" showReceived />
          </TabsContent>
        </div>
      </Tabs>

      {/* Dialogs */}
      <CreateInstallmentSaleDialog
        open={createSaleDialogOpen}
        onOpenChange={setCreateSaleDialogOpen}
        onSubmit={handleCreateNewSale}
      />

      <EditInstallmentDialog
        open={editDialogOpen}
        onOpenChange={(open) => { setEditDialogOpen(open); if (!open) setSelectedInstallment(null); }}
        installment={selectedInstallment}
        onSubmit={handleUpdateInstallment}
      />

      <ReceivePaymentDialog
        open={receiveDialogOpen}
        onOpenChange={setReceiveDialogOpen}
        installment={selectedInstallment}
        bankAccounts={bankAccounts}
        onSubmit={handleSubmitReceipt}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a parcela {selectedInstallment?.installmentNumber} de{' '}
              <span className="font-medium text-slate-700">{selectedInstallment?.clientName}</span>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
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
