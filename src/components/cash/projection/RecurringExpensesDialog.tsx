'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import type { RecurringExpense } from '@/core/domain/entities/CashFlowProjection';
import {
  createRecurringExpenseAction,
  updateRecurringExpenseAction,
  deleteRecurringExpenseAction,
} from '@/app/(app)/cash/projection/actions';

interface RecurringExpensesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expenses: RecurringExpense[];
}

const FREQUENCY_LABELS = {
  DAILY: 'Diária',
  WEEKLY: 'Semanal',
  MONTHLY: 'Mensal',
  YEARLY: 'Anual',
};

export function RecurringExpensesDialog({
  open,
  onOpenChange,
  expenses,
}: RecurringExpensesDialogProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    frequency: 'MONTHLY' as const,
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: '',
    category: '',
  });
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        frequency: formData.frequency,
        startDate: new Date(formData.startDate),
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        category: formData.category,
        isActive: true,
      };

      if (editingId) {
        await updateRecurringExpenseAction(editingId, data);
        toast.success('Despesa recorrente atualizada');
      } else {
        await createRecurringExpenseAction(data);
        toast.success('Despesa recorrente criada');
      }

      queryClient.invalidateQueries({ queryKey: ['recurring-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['cash-projection'] });
      resetForm();
    } catch (error) {
      toast.error('Erro ao salvar despesa recorrente');
      console.error(error);
    }
  };

  const handleEdit = (expense: RecurringExpense) => {
    setEditingId(expense.id);
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      frequency: expense.frequency,
      startDate: format(expense.startDate, 'yyyy-MM-dd'),
      endDate: expense.endDate ? format(expense.endDate, 'yyyy-MM-dd') : '',
      category: expense.category,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta despesa recorrente?')) return;

    try {
      await deleteRecurringExpenseAction(id);
      toast.success('Despesa recorrente excluída');
      queryClient.invalidateQueries({ queryKey: ['recurring-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['cash-projection'] });
    } catch (error) {
      toast.error('Erro ao excluir despesa recorrente');
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      frequency: 'MONTHLY',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: '',
      category: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Despesas Recorrentes</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {!showForm ? (
            <>
              <Button onClick={() => setShowForm(true)} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Nova Despesa Recorrente
              </Button>

              {expenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="rounded-full bg-muted p-4 mb-3">
                    <Trash2 className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-base font-semibold mb-1">Nenhuma despesa cadastrada</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Adicione despesas recorrentes para melhorar a precisão da sua projeção de caixa
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border bg-card">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-semibold">Descrição</TableHead>
                        <TableHead className="font-semibold">Valor</TableHead>
                        <TableHead className="font-semibold">Frequência</TableHead>
                        <TableHead className="font-semibold">Categoria</TableHead>
                        <TableHead className="font-semibold">Início</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="text-right font-semibold">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses.map((expense) => (
                        <TableRow key={expense.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            {expense.description}
                          </TableCell>
                          <TableCell className="font-mono">
                            R${' '}
                            {expense.amount.toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-normal">
                              {FREQUENCY_LABELS[expense.frequency]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {expense.category}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">
                            {format(expense.startDate, 'dd/MM/yyyy', { locale: ptBR })}
                          </TableCell>
                          <TableCell>
                            <Badge variant={expense.isActive ? 'default' : 'secondary'}>
                              {expense.isActive ? 'Ativa' : 'Inativa'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEdit(expense)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleDelete(expense.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="rounded-lg border bg-card p-4">
                <h3 className="text-base font-semibold mb-3">
                  {editingId ? 'Editar Despesa' : 'Nova Despesa'}
                </h3>
                
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Descrição *</Label>
                    <Input
                      id="description"
                      placeholder="Ex: Aluguel do salão"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Valor *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequência *</Label>
                    <Select
                      value={formData.frequency}
                      onValueChange={(value: any) =>
                        setFormData({ ...formData, frequency: value })
                      }
                    >
                      <SelectTrigger id="frequency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DAILY">Diária</SelectItem>
                        <SelectItem value="WEEKLY">Semanal</SelectItem>
                        <SelectItem value="MONTHLY">Mensal</SelectItem>
                        <SelectItem value="YEARLY">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria *</Label>
                    <Input
                      id="category"
                      placeholder="Ex: Aluguel, Energia, Salários"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate">Data de Início *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="endDate">Data de Término</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      placeholder="Opcional"
                    />
                    <p className="text-xs text-muted-foreground">
                      Deixe em branco para despesa sem data final
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingId ? 'Atualizar Despesa' : 'Criar Despesa'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
