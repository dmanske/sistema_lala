'use server';

import { calculateCashFlowProjection } from '@/core/usecases/cash/CalculateCashFlowProjection';
import {
  createRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
  listRecurringExpenses,
} from '@/core/usecases/cash/ManageRecurringExpenses';
import { createClient } from '@/lib/supabase/server';
import type { ProjectionScenario } from '@/core/domain/entities/CashFlowProjection';
import { addDays } from 'date-fns';

export async function getProjection(
  scenario: ProjectionScenario = 'REALISTIC',
  days: number = 30
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Não autenticado');

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile?.tenant_id) throw new Error('Tenant não encontrado');

  const startDate = new Date();
  const endDate = addDays(startDate, days);

  return calculateCashFlowProjection({
    tenantId: profile.tenant_id,
    startDate,
    endDate,
    scenario,
  });
}

export async function getRecurringExpenses() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Não autenticado');

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile?.tenant_id) throw new Error('Tenant não encontrado');

  return listRecurringExpenses(profile.tenant_id);
}

export async function createRecurringExpenseAction(data: any) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Não autenticado');

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile?.tenant_id) throw new Error('Tenant não encontrado');

  return createRecurringExpense({
    tenantId: profile.tenant_id,
    ...data,
  });
}

export async function updateRecurringExpenseAction(id: string, data: any) {
  return updateRecurringExpense(id, data);
}

export async function deleteRecurringExpenseAction(id: string) {
  return deleteRecurringExpense(id);
}
