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
import { InstallmentStatusBadge } from '@/components/receivables/InstallmentStatusBadge';
import { ReceivePaymentDialog } from '@/components/receivables/ReceivePaymentDialog';
import { InstallmentSaleDialog } from '@/components/receivables/InstallmentSaleDialog';
import { SelectSaleDialog } from '@/components/receivables/SelectSaleDialog';
import { useSaleInstallments } from '@/hooks/useSaleInstallments';
import { formatCurrency } from '@/lib/utils';
import { formatBrazilDate } from '@/lib/utils/dateUtils';
import { DollarSign, AlertCircle, Clock, TrendingUp } from 'lucide-react';
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
  const [sales, setSales] = useState<Array<{ id: string; total: number; customer_name: string; created_at: string }>>([]);
  const [selectedInstallment, setSelectedInstallment] = useState<SaleInstallmentWithDetails | null>(null);
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);
  const [selectSaleDialogOpen, setSelectSaleDialogOpen] = useState(false);
  const [installmentDialogOpen, setInstallmentDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<{ id: string; total: number } | null>(null);
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

  const loadSales = async () => {
    const supabase = createClient();
    
    // Buscar vendas que ainda não têm parcelas criadas
    const { data: allSales } = await supabase
      .from('sales')
      .select(`
        id,
        total,
        created_at,
        customer_id,
        clients!sales_customer_id_fkey (
          name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (allSales) {
      // Buscar quais vendas já têm parcelas
      const saleIds = allSales.map(s => s.id);
      const { data: existingInstallments } = await supabase
        .from('sale_installments')
        .select('sale_id')
        .in('sale_id', saleIds);

      const salesWithInstallments = new Set(existingInstallments?.map(i => i.sale_id) || []);

      // Filtrar apenas vendas sem parcelas
      const salesWithoutInstallments = allSales
        .filter(sale => !salesWithInstallments.has(sale.id))
        .map(sale => ({
          id: sale.id,
          total: parseFloat(sale.total),
          customer_name: (sale.clients as any)?.name || 'Cliente não identificado',
          created_at: sale.created_at,
        }));

      setSales(salesWithoutInstallments);
    }
  };

  useEffect(() => {
    loadData();
    loadBankAccounts();
    loadSales();
  }, []);

  const handleReceivePayment = (installment: SaleInstallmentWithDetails) => {
    setSelectedInstallment(installment);
    setReceiveDialogOpen(true);
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

  const handleCreateInstallmentSale = async (installments: Array<{
    installmentNumber: number;
    amount: number;
    dueDate: Date;
  }>) => {
    if (!selectedSale) return;

    await createInstallmentSale({
      saleId: selectedSale.id,
      installments,
    });

    await loadData();
    await loadSales(); // Recarregar lista de vendas disponíveis
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
        <Button onClick={() => setSelectSaleDialogOpen(true)}>
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
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receivables.map((installment) => (
                      <TableRow key={installment.id}>
                        <TableCell>{installment.clientName}</TableCell>
                        <TableCell>Parcela {installment.installmentNumber}</TableCell>
                        <TableCell>{formatBrazilDate(installment.dueDate, 'dd/MM/yyyy')}</TableCell>
                        <TableCell>{formatCurrency(installment.amount)}</TableCell>
                        <TableCell>
                          <InstallmentStatusBadge
                            status={installment.status}
                            isOverdue={installment.isOverdue}
                            daysOverdue={installment.daysOverdue}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleReceivePayment(installment)}
                          >
                            Receber
                          </Button>
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
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receivables.map((installment) => (
                      <TableRow key={installment.id}>
                        <TableCell>{installment.clientName}</TableCell>
                        <TableCell>Parcela {installment.installmentNumber}</TableCell>
                        <TableCell>{formatBrazilDate(installment.dueDate, 'dd/MM/yyyy')}</TableCell>
                        <TableCell>{formatCurrency(installment.amount)}</TableCell>
                        <TableCell>
                          <InstallmentStatusBadge
                            status={installment.status}
                            isOverdue={installment.isOverdue}
                            daysOverdue={installment.daysOverdue}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleReceivePayment(installment)}
                          >
                            Receber
                          </Button>
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

      <SelectSaleDialog
        open={selectSaleDialogOpen}
        onOpenChange={setSelectSaleDialogOpen}
        sales={sales}
        onSelect={(sale) => {
          setSelectedSale(sale);
          setInstallmentDialogOpen(true);
        }}
      />

      <ReceivePaymentDialog
        open={receiveDialogOpen}
        onOpenChange={setReceiveDialogOpen}
        installment={selectedInstallment}
        bankAccounts={bankAccounts}
        onSubmit={handleSubmitReceipt}
      />

      {selectedSale && (
        <InstallmentSaleDialog
          open={installmentDialogOpen}
          onOpenChange={setInstallmentDialogOpen}
          saleId={selectedSale.id}
          saleTotal={selectedSale.total}
          onSubmit={handleCreateInstallmentSale}
        />
      )}
    </div>
  );
}
