'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/lib/utils';
import type { SaleInstallmentWithDetails } from '@/core/domain/entities/SaleInstallment';

interface ReceivePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  installment: SaleInstallmentWithDetails | null;
  bankAccounts: Array<{ id: string; name: string }>;
  onSubmit: (data: {
    receivedAmount: number;
    receivedAt: Date;
    bankAccountId: string;
    paymentMethod: string;
    notes?: string;
  }) => Promise<void>;
}

export function ReceivePaymentDialog({
  open,
  onOpenChange,
  installment,
  bankAccounts,
  onSubmit,
}: ReceivePaymentDialogProps) {
  const [receivedAmount, setReceivedAmount] = useState('');
  const [receivedAt, setReceivedAt] = useState('');
  const [bankAccountId, setBankAccountId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && installment) {
      setReceivedAmount(installment.amount.toFixed(2));
      
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      setReceivedAt(`${year}-${month}-${day}`);
      
      setBankAccountId('');
      setPaymentMethod('');
      setNotes('');
    }
  }, [open, installment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!installment) return;

    setLoading(true);
    try {
      const [year, month, day] = receivedAt.split('-').map(Number);
      const date = new Date(year, month - 1, day);

      await onSubmit({
        receivedAmount: parseFloat(receivedAmount),
        receivedAt: date,
        bankAccountId,
        paymentMethod,
        notes: notes || undefined,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Failed to register receipt:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!installment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Recebimento</DialogTitle>
          <DialogDescription>
            Registre o recebimento da parcela informando o valor, data e forma de pagamento
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              <div>Cliente: {installment.clientName}</div>
              <div>Parcela: {installment.installmentNumber}</div>
              <div>Valor: {formatCurrency(installment.amount)}</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="receivedAmount">Valor Recebido *</Label>
            <Input
              id="receivedAmount"
              type="number"
              step="0.01"
              value={receivedAmount}
              onChange={(e) => setReceivedAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="receivedAt">Data do Recebimento *</Label>
            <Input
              id="receivedAt"
              type="date"
              value={receivedAt}
              onChange={(e) => setReceivedAt(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankAccountId">Conta Bancária *</Label>
            <Select value={bankAccountId} onValueChange={setBankAccountId} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a conta" />
              </SelectTrigger>
              <SelectContent>
                {bankAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Método de Pagamento *</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Dinheiro</SelectItem>
                <SelectItem value="PIX">PIX</SelectItem>
                <SelectItem value="CREDIT_CARD">Cartão de Crédito</SelectItem>
                <SelectItem value="DEBIT_CARD">Cartão de Débito</SelectItem>
                <SelectItem value="BANK_TRANSFER">Transferência</SelectItem>
                <SelectItem value="CHECK">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações sobre o recebimento..."
              rows={3}
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
              {loading ? 'Registrando...' : 'Registrar Recebimento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
