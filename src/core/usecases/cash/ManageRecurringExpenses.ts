import { createClient } from '@/lib/supabase/server';
import type { RecurringExpense } from '@/core/domain/entities/CashFlowProjection';

export async function createRecurringExpense(
  data: Omit<RecurringExpense, 'id' | 'createdAt' | 'updatedAt'>
): Promise<RecurringExpense> {
  const supabase = await createClient();

  const { data: expense, error } = await supabase
    .from('recurring_expenses')
    .insert({
      tenant_id: data.tenantId,
      description: data.description,
      amount: data.amount,
      frequency: data.frequency,
      start_date: data.startDate.toISOString().split('T')[0],
      end_date: data.endDate?.toISOString().split('T')[0],
      category: data.category,
      bank_account_id: data.bankAccountId,
      is_active: data.isActive,
    })
    .select()
    .single();

  if (error) throw error;

  return mapToRecurringExpense(expense);
}

export async function updateRecurringExpense(
  id: string,
  data: Partial<Omit<RecurringExpense, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>
): Promise<RecurringExpense> {
  const supabase = await createClient();

  const updateData: any = {};
  if (data.description !== undefined) updateData.description = data.description;
  if (data.amount !== undefined) updateData.amount = data.amount;
  if (data.frequency !== undefined) updateData.frequency = data.frequency;
  if (data.startDate !== undefined)
    updateData.start_date = data.startDate.toISOString().split('T')[0];
  if (data.endDate !== undefined)
    updateData.end_date = data.endDate?.toISOString().split('T')[0];
  if (data.category !== undefined) updateData.category = data.category;
  if (data.bankAccountId !== undefined) updateData.bank_account_id = data.bankAccountId;
  if (data.isActive !== undefined) updateData.is_active = data.isActive;

  const { data: expense, error } = await supabase
    .from('recurring_expenses')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return mapToRecurringExpense(expense);
}

export async function deleteRecurringExpense(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from('recurring_expenses').delete().eq('id', id);

  if (error) throw error;
}

export async function listRecurringExpenses(tenantId: string): Promise<RecurringExpense[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('recurring_expenses')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data?.map(mapToRecurringExpense) || [];
}

function mapToRecurringExpense(data: any): RecurringExpense {
  return {
    id: data.id,
    tenantId: data.tenant_id,
    description: data.description,
    amount: Number(data.amount),
    frequency: data.frequency,
    startDate: new Date(data.start_date),
    endDate: data.end_date ? new Date(data.end_date) : undefined,
    category: data.category,
    bankAccountId: data.bank_account_id,
    isActive: data.is_active,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}
