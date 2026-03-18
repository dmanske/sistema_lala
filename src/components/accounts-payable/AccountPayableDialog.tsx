'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AccountPayableCategory } from '@/core/domain/entities/AccountPayable';
import { createClient } from '@/lib/supabase/client';
import { CostCenterSelector } from '@/components/cost-centers/CostCenterSelector';
import { ProjectSelector } from '@/components/projects/ProjectSelector';

const FormSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.coerce.number().positive('Valor deve ser maior que zero'),
  dueDate: z.string().min(1, 'Data de vencimento é obrigatória'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  supplierId: z.string().optional(),
  notes: z.string().optional(),
  costCenterId: z.string().optional(),
  projectId: z.string().optional(),
});

type FormData = z.infer<typeof FormSchema>;

export interface InstallmentData {
  description: string;
  amount: number;
  dueDate: string;
  category: AccountPayableCategory;
  supplierId?: string;
  notes?: string;
  costCenterId?: string;
  projectId?: string;
  installmentNumber: number;
  totalInstallments: number;
}

interface AccountPayableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormData) => Promise<void>;
  onSubmitInstallments?: (installments: InstallmentData[]) => Promise<void>;
  editData?: {
    id: string;
    description: string;
    amount: number;
    dueDate: Date;
    category: AccountPayableCategory;
    supplierId?: string;
    notes?: string;
    costCenterId?: string;
    projectId?: string;
  };
}

const categories: { value: AccountPayableCategory; label: string }[] = [
  { value: 'COMPRA', label: 'Compra' },
  { value: 'ALUGUEL', label: 'Aluguel' },
  { value: 'ENERGIA', label: 'Energia' },
  { value: 'AGUA', label: 'Água' },
  { value: 'INTERNET', label: 'Internet' },
  { value: 'TELEFONE', label: 'Telefone' },
  { value: 'IMPOSTOS', label: 'Impostos' },
  { value: 'SALARIOS', label: 'Salários' },
  { value: 'OUTROS', label: 'Outros' },
];

export function AccountPayableDialog({
  open,
  onOpenChange,
  onSubmit,
  onSubmitInstallments,
  editData,
}: AccountPayableDialogProps) {
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // Installment state
  const [paymentType, setPaymentType] = useState<'single' | 'installment'>('single');
  const [installmentsCount, setInstallmentsCount] = useState(2);
  const [installmentInterval, setInstallmentInterval] = useState(30);
  const [installments, setInstallments] = useState<{ number: number; dueDate: string; value: number }[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema) as any,
    defaultValues: {
      description: '',
      amount: 0,
      dueDate: '',
      category: 'OUTROS',
      supplierId: '',
      notes: '',
      costCenterId: '',
      projectId: '',
    },
  });

  const watchAmount = form.watch('amount');
  const watchDueDate = form.watch('dueDate');

  // Recalcula parcelas quando parâmetros mudam
  useEffect(() => {
    if (paymentType !== 'installment' || !watchDueDate || !watchAmount || installmentsCount < 2) {
      setInstallments([]);
      return;
    }

    const count = installmentsCount;
    const total = Number(watchAmount) || 0;
    const baseValue = Math.floor((total / count) * 100) / 100;
    const remainder = total - baseValue * count;

    const newInstallments = [];
    for (let i = 0; i < count; i++) {
      const dueDate = new Date(watchDueDate);
      dueDate.setDate(dueDate.getDate() + i * installmentInterval);
      const value = i === count - 1 ? baseValue + remainder : baseValue;
      newInstallments.push({
        number: i + 1,
        dueDate: dueDate.toISOString().split('T')[0],
        value,
      });
    }
    setInstallments(newInstallments);
  }, [paymentType, watchAmount, watchDueDate, installmentsCount, installmentInterval]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setPaymentType('single');
      setInstallmentsCount(2);
      setInstallmentInterval(30);
      setInstallments([]);

      if (editData) {
        const year = editData.dueDate.getFullYear();
        const month = String(editData.dueDate.getMonth() + 1).padStart(2, '0');
        const day = String(editData.dueDate.getDate()).padStart(2, '0');
        form.reset({
          description: editData.description,
          amount: editData.amount,
          dueDate: `${year}-${month}-${day}`,
          category: editData.category,
          supplierId: editData.supplierId || '',
          notes: editData.notes || '',
          costCenterId: editData.costCenterId || '',
          projectId: editData.projectId || '',
        });
      } else {
        form.reset({
          description: '',
          amount: 0,
          dueDate: '',
          category: 'OUTROS',
          supplierId: '',
          notes: '',
          costCenterId: '',
          projectId: '',
        });
      }
      fetchSuppliers();
    }
  }, [open, editData, form]);

  const fetchSuppliers = async () => {
    const supabase = createClient();
    const { data } = await supabase.from('suppliers').select('id, name').order('name');
    if (data) setSuppliers(data);
  };

  const handleInstallmentDateChange = (index: number, newDate: string) => {
    setInstallments((prev) =>
      prev.map((inst, i) => (i === index ? { ...inst, dueDate: newDate } : inst))
    );
  };

  const handleSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      if (paymentType === 'installment' && installments.length >= 2 && onSubmitInstallments) {
        const installmentData: InstallmentData[] = installments.map((inst) => ({
          description: `${data.description} - Parcela ${inst.number}/${installments.length}`,
          amount: inst.value,
          dueDate: inst.dueDate,
          category: data.category as AccountPayableCategory,
          supplierId: data.supplierId || undefined,
          notes: data.notes || undefined,
          costCenterId: data.costCenterId || undefined,
          projectId: data.projectId || undefined,
          installmentNumber: inst.number,
          totalInstallments: installments.length,
        }));
        await onSubmitInstallments(installmentData);
      } else {
        await onSubmit(data);
      }

      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving account payable:', error);
    } finally {
      setLoading(false);
    }
  };

  const isEditing = !!editData;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Conta a Pagar' : 'Nova Conta a Pagar'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Edite os dados da conta' : 'Cadastre uma nova despesa no sistema'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Aluguel Janeiro 2026" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fornecedor</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Opcional" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliers.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tipo de pagamento — só na criação */}
            {!isEditing && (
              <div className="space-y-1">
                <Label className="text-sm font-medium">Tipo de Lançamento</Label>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={paymentType === 'single'}
                      onChange={() => setPaymentType('single')}
                      className="w-4 h-4 accent-rose-500"
                    />
                    <span className="text-sm">À Vista (1 parcela)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={paymentType === 'installment'}
                      onChange={() => setPaymentType('installment')}
                      className="w-4 h-4 accent-rose-500"
                    />
                    <span className="text-sm">Parcelado</span>
                  </label>
                </div>
              </div>
            )}

            {/* Valor + Vencimento */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{paymentType === 'installment' ? 'Valor Total *' : 'Valor *'}</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {paymentType === 'installment' ? '1º Vencimento *' : 'Vencimento *'}
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Opções de parcelamento */}
            {paymentType === 'installment' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Nº de Parcelas</Label>
                    <Input
                      type="number"
                      min={2}
                      max={36}
                      value={installmentsCount}
                      onChange={(e) => setInstallmentsCount(Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Intervalo (dias)</Label>
                    <Input
                      type="number"
                      min={1}
                      value={installmentInterval}
                      onChange={(e) => setInstallmentInterval(Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                </div>

                {installments.length >= 2 && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
                    <p className="text-xs font-semibold text-rose-700 mb-2">
                      {installments.length} parcelas que serão criadas:
                    </p>
                    <div className="space-y-1.5">
                      {installments.map((inst, idx) => (
                        <div key={inst.number} className="flex items-center gap-3 text-sm">
                          <span className="text-rose-500 font-medium w-12 shrink-0">
                            {inst.number}/{installments.length}
                          </span>
                          <span className="font-semibold w-24 shrink-0 text-slate-700">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(inst.value)}
                          </span>
                          <Input
                            type="date"
                            value={inst.dueDate}
                            onChange={(e) => handleInstallmentDateChange(idx, e.target.value)}
                            className="h-7 text-xs px-2 flex-1"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Informações adicionais..." rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="costCenterId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Centro de Custos</FormLabel>
                    <FormControl>
                      <CostCenterSelector
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Selecione"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Projeto</FormLabel>
                    <FormControl>
                      <ProjectSelector
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Selecione"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading
                  ? 'Salvando...'
                  : paymentType === 'installment'
                  ? `Criar ${installments.length || installmentsCount} parcelas`
                  : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
