'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { ProjectSelector } from '@/components/projects/ProjectSelector';

interface Client {
  id: string;
  name: string;
}

interface InstallmentInput {
  installmentNumber: number;
  amount: number;
  dueDate: Date;
}

interface CreateInstallmentSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    clientId: string;
    totalAmount: number;
    description: string;
    installments: InstallmentInput[];
    projectId?: string;
  }) => Promise<void>;
}

export function CreateInstallmentSaleDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateInstallmentSaleDialogProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState('');
  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [numberOfInstallments, setNumberOfInstallments] = useState(2);
  const [firstDueDate, setFirstDueDate] = useState('');
  const [installments, setInstallments] = useState<InstallmentInput[]>([]);
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState('');

  useEffect(() => {
    if (open) {
      loadClients();
      
      // Data padrão: 30 dias a partir de hoje
      const today = new Date();
      today.setDate(today.getDate() + 30);
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      setFirstDueDate(`${year}-${month}-${day}`);
      
      setClientId('');
      setDescription('');
      setTotalAmount('');
      setNumberOfInstallments(2);
      setInstallments([]);
      setProjectId('');
    }
  }, [open]);

  const loadClients = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('clients')
      .select('id, name')
      .eq('status', 'ACTIVE')
      .order('name');

    if (data) {
      setClients(data);
    }
  };

  const generateInstallments = (count: number, firstDate: string, total: number) => {
    if (!total || total <= 0) return;
    
    const installmentAmount = total / count;
    const [year, month, day] = firstDate.split('-').map(Number);
    
    const newInstallments: InstallmentInput[] = [];
    
    for (let i = 0; i < count; i++) {
      const dueDate = new Date(year, month - 1, day);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      newInstallments.push({
        installmentNumber: i + 1,
        amount: installmentAmount,
        dueDate,
      });
    }
    
    setInstallments(newInstallments);
  };

  const handleTotalAmountChange = (value: string) => {
    setTotalAmount(value);
    const amount = parseFloat(value) || 0;
    if (amount > 0 && firstDueDate) {
      generateInstallments(numberOfInstallments, firstDueDate, amount);
    }
  };

  const handleNumberChange = (value: string) => {
    const num = parseInt(value) || 2;
    setNumberOfInstallments(num);
    const amount = parseFloat(totalAmount) || 0;
    if (amount > 0 && firstDueDate) {
      generateInstallments(num, firstDueDate, amount);
    }
  };

  const handleFirstDateChange = (value: string) => {
    setFirstDueDate(value);
    const amount = parseFloat(totalAmount) || 0;
    if (amount > 0) {
      generateInstallments(numberOfInstallments, value, amount);
    }
  };

  const handleInstallmentAmountChange = (index: number, value: string) => {
    const amount = parseFloat(value) || 0;
    const newInstallments = [...installments];
    newInstallments[index].amount = amount;
    setInstallments(newInstallments);
  };

  const handleInstallmentDateChange = (index: number, value: string) => {
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const newInstallments = [...installments];
    newInstallments[index].dueDate = date;
    setInstallments(newInstallments);
  };

  const totalInstallments = installments.reduce((sum, inst) => sum + inst.amount, 0);
  const totalAmountNum = parseFloat(totalAmount) || 0;
  const difference = totalInstallments - totalAmountNum;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientId) {
      alert('Selecione um cliente');
      return;
    }

    if (!description.trim()) {
      alert('Informe uma descrição');
      return;
    }

    if (totalAmountNum <= 0) {
      alert('Informe um valor total válido');
      return;
    }

    if (Math.abs(difference) > 0.01) {
      alert('A soma das parcelas deve ser igual ao total');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        clientId,
        totalAmount: totalAmountNum,
        description,
        installments,
        projectId: projectId || undefined,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create installment sale:', error);
      alert('Erro ao criar venda parcelada. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Venda Parcelada</DialogTitle>
          <DialogDescription>
            Crie uma venda parcelada selecionando o cliente, valor total e número de parcelas
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientId">Cliente *</Label>
            <Select value={clientId} onValueChange={setClientId} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Pacote de 10 sessões, Produto X, etc..."
              rows={2}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectId">Projeto (Opcional)</Label>
            <ProjectSelector
              value={projectId}
              onValueChange={setProjectId}
              placeholder="Selecione um projeto/campanha"
            />
            <p className="text-xs text-muted-foreground">
              Para rastrear vendas por campanha ou projeto específico
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalAmount">Valor Total *</Label>
            <Input
              id="totalAmount"
              type="number"
              step="0.01"
              value={totalAmount}
              onChange={(e) => handleTotalAmountChange(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numberOfInstallments">Número de Parcelas *</Label>
              <Input
                id="numberOfInstallments"
                type="number"
                min="2"
                max="12"
                value={numberOfInstallments}
                onChange={(e) => handleNumberChange(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstDueDate">Primeiro Vencimento *</Label>
              <Input
                id="firstDueDate"
                type="date"
                value={firstDueDate}
                onChange={(e) => handleFirstDateChange(e.target.value)}
                required
              />
            </div>
          </div>

          {installments.length > 0 && (
            <>
              <div className="space-y-2">
                <Label>Parcelas</Label>
                <div className="space-y-2 max-h-[250px] overflow-y-auto">
                  {installments.map((installment, index) => {
                    const year = installment.dueDate.getFullYear();
                    const month = String(installment.dueDate.getMonth() + 1).padStart(2, '0');
                    const day = String(installment.dueDate.getDate()).padStart(2, '0');
                    const dateStr = `${year}-${month}-${day}`;

                    return (
                      <div key={index} className="grid grid-cols-3 gap-2 items-center p-2 border rounded">
                        <div className="text-sm font-medium">
                          Parcela {installment.installmentNumber}
                        </div>
                        <Input
                          type="number"
                          step="0.01"
                          value={installment.amount.toFixed(2)}
                          onChange={(e) => handleInstallmentAmountChange(index, e.target.value)}
                          placeholder="Valor"
                        />
                        <Input
                          type="date"
                          value={dateStr}
                          onChange={(e) => handleInstallmentDateChange(index, e.target.value)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 p-3 bg-muted rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Total das Parcelas:</span>
                  <span className="font-medium">{formatCurrency(totalInstallments)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Valor Total:</span>
                  <span className="font-medium">{formatCurrency(totalAmountNum)}</span>
                </div>
                {Math.abs(difference) > 0.01 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Diferença:</span>
                    <span className="font-medium">{formatCurrency(Math.abs(difference))}</span>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !clientId || !totalAmount || installments.length === 0 || Math.abs(difference) > 0.01}
            >
              {loading ? 'Criando...' : 'Criar Venda Parcelada'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
