'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
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
import { InstallmentStatusBadge } from '@/components/receivables/InstallmentStatusBadge';
import { ReceivePaymentDialog } from '@/components/receivables/ReceivePaymentDialog';
import { CreateInstallmentSaleDialog } from '@/components/receivables/CreateInstallmentSaleDialog';
import { EditInstallmentDialog } from '@/components/receivables/EditInstallmentDialog';
import { useSaleInstallments } from '@/hooks/useSaleInstallments';
import { formatCurrency } from '@/lib/utils';
import { formatBrazilDate } from '@/lib/utils/dateUtils';
import { DollarSign, AlertCircle, Clock, TrendingUp, Pencil, Trash2 } from 'lucide-react';
import type { SaleInstallmentWithDetails } from '@/core/domain/entities/SaleInstallment';
import { createClient } from '@/lib/supabase/client';

export default function ReceivablesPage() {
  const [receivables, setReceivables] = useState<SaleInstallmentWithDetails[]>([]);
  const [summary, setSummary] = useState({
    totalPending: 0,
    totalOverdue: 0,
    totalDueIn7Days: 0,
    totalDueIn30Days: 0,
    countPending: 0,
    countOverdue: 0,
  });
  const [bankAccounts, setBankAccounts] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedInstallment, setSelectedInstallment] = useState<SaleInstallmentWithDetails | null>(null);
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);
  const [createSaleDialogOpen, setCreateSaleDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);

  const { listReceivables, getSummary, registerReceipt, createInstallmentSale } = useSaleInstallments();

  const loadData = async () => {
    setLoading(true);
    try {
      const [summaryData, pendingData] = await Promise.all([
        getSummary(),
        listReceivables({ status: 'PENDING' }),
      ]);

      setSummary(summaryData);
      setReceivables(pendingData);
    } catch (error) {
      console.error('Failed to load receivables:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBankAccounts = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('bank_accounts')
      .select('id, name')
      .eq('is_active', true)
      .order('name');

    if (data) {
      setBankAccounts(data);
    }
  };

  useEffect(() => {
    loadData();
    loadBankAccounts();
  }, []);

  const handleReceivePayment = (installment: SaleInstallmentWithDetails) => {
    setSelectedInstallment(installment);
    setReceiveDialogOpen(true);
  };

  const handleEditClick = (installment: SaleInstallmentWithDetails) => {
    setSelectedInstallment(installment);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (installment: SaleInstallmentWithDetails) => {
    setSelectedInstallment(installment);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedInstallment) return;
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('sale_installments')
        .delete()
        .eq('id', selectedInstallment.id);

      if (error) throw error;

      await loadData();
      setDeleteDialogOpen(false);
      setSelectedInstallment(null);
    } catch (error) {
      console.error('Failed to delete installment:', error);
      alert('Erro ao excluir parcela. Tente novamente.');
    }
  };

  const handleUpdateInstallment = async (data: {
    amount: number;
    dueDate: Date;
  }) => {
    if (!selectedInstallment) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('sale_installments')
        .update({
          amount: data.amount,
          due_date: data.dueDate.toISOString().split('T')[0],
        })
        .eq('id', selectedInstallment.id);

      if (error) throw error;

      await loadData();
      setEditDialogOpen(false);
      setSelectedInstallment(null);
    } catch (error) {
      console.error('Failed to update installment:', error);
      throw error;
    }
  };

  const handleSubmitReceipt = async (data: {
    receivedAmount: number;
    receivedAt: Date;
    bankAccountId: string;
    paymentMethod: string;
    notes?: string;
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
    clientId: string;
    totalAmount: number;
    description: string;
    installments: Array<{
      installmentNumber: number;
      amount: number;
      dueDate: Date;
    }>;
  }) => {
    const supabase = createClient();

    // Buscar o usuário logado e seu tenant_id
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Buscar o tenant_id do profile do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('Failed to get user profile');
    }

    // Criar a venda primeiro
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert({
        tenant_id: profile.tenant_id,
        customer_id: data.clientId,
        subtotal: data.totalAmount,
        discount: 0,
        total: data.totalAmount,
        status: 'paid',
        notes: data.description,
        created_by: user.id,
      })
      .select('id')
      .single();

    if (saleError || !sale) {
      throw new Error('Failed to create sale: ' + (saleError?.message || 'Unknown error'));
    }

    // Criar as parcelas
    await createInstallmentSale({
      saleId: sale.id,
      installments: data.installments,
    });

    await loadData();
  };

  const handleTabChange = async (value: string) => {
    setActiveTab(value);
    setLoading(true);
    try {
      let data: SaleInstallmentWithDetails[];
      
      if (value === 'overdue') {
        data = await listReceivables({ status: 'OVERDUE' });
      } else if (value === 'pending') {
        data = await listReceivables({ status: 'PENDING' });
      } else {
        data = [];
      }

      setReceivables(data);
    } catch (error) {
      console.error('Failed to load receivables:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Contas a Receber</h1>
          <p className="text-muted-foreground">Controle de parcelas e recebimentos</p>
        </div>
        <Button onClick={() => setCreateSaleDialogOpen(true)}>
          Nova Venda Parcelada
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendente</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalPending)}</div>
            <p className="text-xs text-muted-foreground">
              {summary.countPending} parcela{summary.countPending !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalOverdue)}</div>
            <p className="text-xs text-muted-foreground">
              {summary.countOverdue} parcela{summary.countOverdue !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vence em 7 dias</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalDueIn7Days)}</div>
            <p className="text-xs text-muted-foreground">Próximos 7 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vence em 30 dias</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalDueIn30Days)}</div>
            <p className="text-xs text-muted-foreground">Próximos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="overdue">Vencidas</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Parcelas Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Carregando...</div>
              ) : receivables.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma parcela pendente
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Parcela</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receivables.map((installment) => (
                      <TableRow key={installment.id}>
                        <TableCell>{installment.clientName}</TableCell>
                        <TableCell>Parcela {installment.installmentNumber}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{formatBrazilDate(installment.dueDate, 'dd/MM/yyyy')}</span>
                            {installment.daysOverdue && installment.daysOverdue > 0 && (
                              <span className="text-xs text-red-600">
                                {installment.daysOverdue} dia(s) atrasado
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(installment.amount)}</TableCell>
                        <TableCell>
                          <InstallmentStatusBadge
                            status={installment.status}
                            isOverdue={installment.isOverdue}
                            daysOverdue={installment.daysOverdue}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            {installment.status === 'PENDING' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditClick(installment)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReceivePayment(installment)}
                                >
                                  Receber
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteClick(installment)}
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
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Parcelas Vencidas</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Carregando...</div>
              ) : receivables.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma parcela vencida
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Parcela</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receivables.map((installment) => (
                      <TableRow key={installment.id}>
                        <TableCell>{installment.clientName}</TableCell>
                        <TableCell>Parcela {installment.installmentNumber}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{formatBrazilDate(installment.dueDate, 'dd/MM/yyyy')}</span>
                            {installment.daysOverdue && installment.daysOverdue > 0 && (
                              <span className="text-xs text-red-600">
                                {installment.daysOverdue} dia(s) atrasado
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(installment.amount)}</TableCell>
                        <TableCell>
                          <InstallmentStatusBadge
                            status={installment.status}
                            isOverdue={installment.isOverdue}
                            daysOverdue={installment.daysOverdue}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            {installment.status === 'PENDING' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditClick(installment)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReceivePayment(installment)}
                                >
                                  Receber
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteClick(installment)}
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
        </TabsContent>
      </Tabs>

      <CreateInstallmentSaleDialog
        open={createSaleDialogOpen}
        onOpenChange={setCreateSaleDialogOpen}
        onSubmit={handleCreateNewSale}
      />

      <EditInstallmentDialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setSelectedInstallment(null);
        }}
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a parcela {selectedInstallment?.installmentNumber} de {selectedInstallment?.clientName}?
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
