import { createClient } from '@/lib/supabase/server';
import type {
  CashFlowProjection,
  ProjectionScenario,
  ExpectedInflow,
  ExpectedOutflow,
  DailyProjection,
} from '@/core/domain/entities/CashFlowProjection';
import { addDays, startOfDay, isAfter, isBefore, differenceInDays } from 'date-fns';

interface CalculateProjectionParams {
  tenantId: string;
  startDate: Date;
  endDate: Date;
  scenario: ProjectionScenario;
}

const CONFIDENCE_FACTORS = {
  OPTIMISTIC: 1.0,
  REALISTIC: 0.85,
  PESSIMISTIC: 0.7,
} as const;

const MINIMUM_BALANCE_REQUIRED = 1000;

export async function calculateCashFlowProjection({
  tenantId,
  startDate,
  endDate,
  scenario,
}: CalculateProjectionParams): Promise<CashFlowProjection> {
  const supabase = await createClient();
  const confidenceFactor = CONFIDENCE_FACTORS[scenario];

  // 1. Buscar saldo atual
  const currentBalance = await getCurrentBalance(supabase, tenantId);

  // 2. Buscar recebíveis pendentes
  const receivables = await getReceivables(supabase, tenantId, startDate, endDate);

  // 3. Buscar contas a pagar pendentes
  const payables = await getPayables(supabase, tenantId, startDate, endDate);

  // 4. Buscar despesas recorrentes
  const recurringExpenses = await getRecurringExpenses(supabase, tenantId, startDate, endDate);

  // 5. Montar lista de entradas esperadas
  const expectedInflows: ExpectedInflow[] = receivables.map((r) => ({
    source: 'RECEIVABLES' as const,
    amount: r.amount * confidenceFactor,
    date: r.dueDate,
    description: r.description,
    confidence: getConfidenceLevel(confidenceFactor),
  }));

  // 6. Montar lista de saídas esperadas
  const expectedOutflows: ExpectedOutflow[] = [
    ...payables.map((p) => ({
      source: 'PAYABLES' as const,
      amount: p.amount,
      date: p.dueDate,
      description: p.description,
      confidence: 'HIGH' as const,
    })),
    ...recurringExpenses.map((e) => ({
      source: 'RECURRING' as const,
      amount: e.amount,
      date: e.date,
      description: e.description,
      confidence: 'HIGH' as const,
    })),
  ];

  // 7. Calcular projeção diária
  const dailyProjection = calculateDailyProjection(
    currentBalance,
    startDate,
    endDate,
    expectedInflows,
    expectedOutflows
  );

  return {
    projectionDate: new Date(),
    expectedInflows,
    expectedOutflows,
    dailyProjection,
    scenario,
  };
}

async function getCurrentBalance(supabase: any, tenantId: string): Promise<number> {
  const { data: accounts } = await supabase
    .from('bank_accounts')
    .select('balance')
    .eq('tenant_id', tenantId);

  return accounts?.reduce((sum: number, acc: any) => sum + Number(acc.balance), 0) || 0;
}

async function getReceivables(
  supabase: any,
  tenantId: string,
  startDate: Date,
  endDate: Date
) {
  const { data } = await supabase
    .from('sale_installments')
    .select(`
      id,
      amount,
      due_date,
      sales (
        clients (
          name
        )
      )
    `)
    .eq('tenant_id', tenantId)
    .eq('status', 'PENDING')
    .gte('due_date', startDate.toISOString())
    .lte('due_date', endDate.toISOString())
    .order('due_date');

  return (
    data?.map((item: any) => ({
      amount: Number(item.amount),
      dueDate: new Date(item.due_date),
      description: `Recebível - ${item.sales?.clients?.name || 'Cliente'}`,
    })) || []
  );
}

async function getPayables(
  supabase: any,
  tenantId: string,
  startDate: Date,
  endDate: Date
) {
  const { data } = await supabase
    .from('accounts_payable')
    .select('id, amount, due_date, description')
    .eq('tenant_id', tenantId)
    .eq('status', 'PENDING')
    .gte('due_date', startDate.toISOString())
    .lte('due_date', endDate.toISOString())
    .order('due_date');

  return (
    data?.map((item: any) => ({
      amount: Number(item.amount),
      dueDate: new Date(item.due_date),
      description: item.description,
    })) || []
  );
}

async function getRecurringExpenses(
  supabase: any,
  tenantId: string,
  startDate: Date,
  endDate: Date
) {
  const { data } = await supabase
    .from('recurring_expenses')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .lte('start_date', endDate.toISOString())
    .or(`end_date.is.null,end_date.gte.${startDate.toISOString()}`);

  const expenses: Array<{ amount: number; date: Date; description: string }> = [];

  data?.forEach((expense: any) => {
    const occurrences = calculateOccurrences(
      new Date(expense.start_date),
      expense.end_date ? new Date(expense.end_date) : endDate,
      expense.frequency,
      startDate,
      endDate
    );

    occurrences.forEach((date) => {
      expenses.push({
        amount: Number(expense.amount),
        date,
        description: expense.description,
      });
    });
  });

  return expenses;
}

function calculateOccurrences(
  expenseStart: Date,
  expenseEnd: Date,
  frequency: string,
  rangeStart: Date,
  rangeEnd: Date
): Date[] {
  const dates: Date[] = [];
  let current = startOfDay(expenseStart);

  // Ajustar para começar dentro do range
  if (isBefore(current, rangeStart)) {
    current = startOfDay(rangeStart);
  }

  while (isBefore(current, rangeEnd) && isBefore(current, expenseEnd)) {
    if (!isBefore(current, rangeStart)) {
      dates.push(new Date(current));
    }

    switch (frequency) {
      case 'DAILY':
        current = addDays(current, 1);
        break;
      case 'WEEKLY':
        current = addDays(current, 7);
        break;
      case 'MONTHLY':
        current = addDays(current, 30);
        break;
      case 'YEARLY':
        current = addDays(current, 365);
        break;
    }
  }

  return dates;
}

function calculateDailyProjection(
  initialBalance: number,
  startDate: Date,
  endDate: Date,
  inflows: ExpectedInflow[],
  outflows: ExpectedOutflow[]
): DailyProjection[] {
  const projections: DailyProjection[] = [];
  let balance = initialBalance;
  let current = startOfDay(startDate);

  while (!isAfter(current, endDate)) {
    const dayStart = startOfDay(current);
    const dayInflows = inflows
      .filter((i) => startOfDay(i.date).getTime() === dayStart.getTime())
      .reduce((sum, i) => sum + i.amount, 0);

    const dayOutflows = outflows
      .filter((o) => startOfDay(o.date).getTime() === dayStart.getTime())
      .reduce((sum, o) => sum + o.amount, 0);

    const openingBalance = balance;
    balance = balance + dayInflows - dayOutflows;

    projections.push({
      date: new Date(current),
      openingBalance,
      inflows: dayInflows,
      outflows: dayOutflows,
      closingBalance: balance,
      minimumRequired: MINIMUM_BALANCE_REQUIRED,
    });

    current = addDays(current, 1);
  }

  return projections;
}

function getConfidenceLevel(factor: number): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (factor >= 0.9) return 'HIGH';
  if (factor >= 0.75) return 'MEDIUM';
  return 'LOW';
}
