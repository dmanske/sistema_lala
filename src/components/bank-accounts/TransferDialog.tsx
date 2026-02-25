'use client';

import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createTransfer } from '@/app/(app)/bank-accounts/dashboard/actions';
import { toast } from 'sonner';

interface TransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: any[];
}

export function TransferDialog({ open, onOpenChange, accounts }: TransferDialogProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      fromAccountId: '',
      toAccountId: '',
      amount: '',
      scheduledDate: new Date().toISOString().split('T')[0],
      description: '',
    },
  });

  const fromAccountId = watch('fromAccountId');
  const toAccountId = watch('toAccountId');

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      await createTransfer({
        ...data,
        amount: parseFloat(data.amount),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts-dashboard'] });
      toast.success('Transferência criada com sucesso');
      reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao criar transferência');
    },
  });

  const onSubmit = (data: any) => {
    if (!data.fromAccountId || !data.toAccountId) {
      toast.error('Selecione as contas de origem e destino');
      return;
    }
    if (data.fromAccountId === data.toAccountId) {
      toast.error('As contas de origem e destino devem ser diferentes');
      return;
    }
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Transferência</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fromAccountId">Conta de Origem *</Label>
            <Select value={fromAccountId} onValueChange={(value) => setValue('fromAccountId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a conta" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} - {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(account.currentBalance || 0)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="toAccountId">Conta de Destino *</Label>
            <Select value={toAccountId} onValueChange={(value) => setValue('toAccountId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a conta" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id} disabled={account.id === fromAccountId}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('amount', { required: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduledDate">Data da Transferência *</Label>
            <Input
              id="scheduledDate"
              type="date"
              {...register('scheduledDate', { required: true })}
            />
            <p className="text-xs text-muted-foreground">
              Se for hoje, a transferência será executada imediatamente
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (Opcional)</Label>
            <Textarea
              id="description"
              placeholder="Motivo da transferência..."
              {...register('description')}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Criando...' : 'Criar Transferência'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
