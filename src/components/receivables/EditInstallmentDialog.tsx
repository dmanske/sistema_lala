'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils';
import type { SaleInstallmentWithDetails } from '@/core/domain/entities/SaleInstallment';

interface EditInstallmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  installment: SaleInstallmentWithDetails | null;
  onSubmit: (data: {
    amount: number;
    dueDate: Date;
  }) => Promise<void>;
}

export function EditInstallmentDialog({
  open,
  onOpenChange,
  installment,
  onSubmit,
}: EditInstallmentDialogProps) {
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && installment) {
      setAmount(installment.amount.toFixed(2));
      
      const year = installment.dueDate.getFullYear();
      const month = String(installment.dueDate.getMonth() + 1).padStart(2, '0');
      const day = String(installment.dueDate.getDate()).padStart(2, '0');
      setDueDate(`${year}-${month}-${day}`);
    }
  }, [open, installment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!installment) return;

    setLoading(true);
    try {
      const [year, month, day] = dueDate.split('-').map(Number);
      const date = new Date(year, month - 1, day);

      await onSubmit({
        amount: parseFloat(amount),
        dueDate: date,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update installment:', error);
      alert('Erro ao atualizar parcela. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!installment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Parcela</DialogTitle>
          <DialogDescription>
            Edite o valor e data de vencimento da parcela
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              <div>Cliente: {installment.clientName}</div>
              <div>Parcela: {installment.installmentNumber}</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Data de Vencimento *</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
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
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
