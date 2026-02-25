'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils';
import { Plus, Trash2 } from 'lucide-react';

interface InstallmentInput {
  installmentNumber: number;
  amount: number;
  dueDate: Date;
}

interface InstallmentSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saleId: string;
  saleTotal: number;
  onSubmit: (installments: InstallmentInput[]) => Promise<void>;
}

export function InstallmentSaleDialog({
  open,
  onOpenChange,
  saleId,
  saleTotal,
  onSubmit,
}: InstallmentSaleDialogProps) {
  const [numberOfInstallments, setNumberOfInstallments] = useState(2);
  const [firstDueDate, setFirstDueDate] = useState('');
  const [installments, setInstallments] = useState<InstallmentInput[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      // Data padrão: 30 dias a partir de hoje
      const today = new Date();
      today.setDate(today.getDate() + 30);
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      setFirstDueDate(`${year}-${month}-${day}`);
      
      setNumberOfInstallments(2);
      generateInstallments(2, `${year}-${month}-${day}`, saleTotal);
    }
  }, [open, saleTotal]);

  const generateInstallments = (count: number, firstDate: string, total: number) => {
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

  const handleNumberChange = (value: string) => {
    const num = parseInt(value) || 2;
    setNumberOfInstallments(num);
    if (firstDueDate) {
      generateInstallments(num, firstDueDate, saleTotal);
    }
  };

  const handleFirstDateChange = (value: string) => {
    setFirstDueDate(value);
    generateInstallments(numberOfInstallments, value, saleTotal);
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
  const difference = totalInstallments - saleTotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (Math.abs(difference) > 0.01) {
      alert('A soma das parcelas deve ser igual ao total da venda');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(installments);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create installment sale:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Venda Parcelada</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              <div>Total da Venda: {formatCurrency(saleTotal)}</div>
            </div>
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

          <div className="space-y-2">
            <Label>Parcelas</Label>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
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
              <span>Total da Venda:</span>
              <span className="font-medium">{formatCurrency(saleTotal)}</span>
            </div>
            {Math.abs(difference) > 0.01 && (
              <div className="flex justify-between text-sm text-red-600">
                <span>Diferença:</span>
                <span className="font-medium">{formatCurrency(Math.abs(difference))}</span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || Math.abs(difference) > 0.01}>
              {loading ? 'Criando...' : 'Criar Parcelas'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
