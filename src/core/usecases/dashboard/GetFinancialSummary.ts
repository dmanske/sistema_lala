import { getCashMovementRepository } from "@/infrastructure/repositories/factory";
import { getSaleInstallmentRepository } from "@/infrastructure/repositories/factory";
import { getAccountPayableRepository } from "@/infrastructure/repositories/factory";
import { getBankAccountRepository } from "@/infrastructure/repositories/factory";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

export async function GetFinancialSummary(period: string) {
  const now = new Date();
  let startDate: Date;
  let endDate: Date;
  let prevStartDate: Date;
  let prevEndDate: Date;

  // Definir período
  switch (period) {
    case "last_month":
      startDate = startOfMonth(subMonths(now, 1));
      endDate = endOfMonth(subMonths(now, 1));
      prevStartDate = startOfMonth(subMonths(now, 2));
      prevEndDate = endOfMonth(subMonths(now, 2));
      break;
    case "last_3_months":
      startDate = startOfMonth(subMonths(now, 2));
      endDate = now;
      prevStartDate = startOfMonth(subMonths(now, 5));
      prevEndDate = endOfMonth(subMonths(now, 3));
      break;
    case "current_year":
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = now;
      prevStartDate = new Date(now.getFullYear() - 1, 0, 1);
      prevEndDate = new Date(now.getFullYear() - 1, 11, 31);
      break;
    default: // current_month
      startDate = startOfMonth(now);
      endDate = now;
      prevStartDate = startOfMonth(subMonths(now, 1));
      prevEndDate = endOfMonth(subMonths(now, 1));
  }

  // Buscar movimentações do período atual
  const cashMovements = await getCashMovementRepository().list({
    startDate,
    endDate,
  });

  // Buscar movimentações do período anterior
  const prevCashMovements = await getCashMovementRepository().list({
    startDate: prevStartDate,
    endDate: prevEndDate,
  });

  // Calcular receitas e despesas
  const monthRevenue = cashMovements
    .filter((m) => m.type === "IN")
    .reduce((sum, m) => sum + m.amount, 0);

  const monthExpenses = cashMovements
    .filter((m) => m.type === "OUT")
    .reduce((sum, m) => sum + m.amount, 0);

  const prevMonthRevenue = prevCashMovements
    .filter((m) => m.type === "IN")
    .reduce((sum, m) => sum + m.amount, 0);

  const prevMonthExpenses = prevCashMovements
    .filter((m) => m.type === "OUT")
    .reduce((sum, m) => sum + m.amount, 0);

  // Calcular lucro
  const netProfit = monthRevenue - monthExpenses;
  const prevNetProfit = prevMonthRevenue - prevMonthExpenses;
  const profitMargin = monthRevenue > 0 ? (netProfit / monthRevenue) * 100 : 0;

  // Calcular crescimentos
  const revenueGrowth = prevMonthRevenue > 0
    ? ((monthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100
    : 0;

  const expensesGrowth = prevMonthExpenses > 0
    ? ((monthExpenses - prevMonthExpenses) / prevMonthExpenses) * 100
    : 0;

  const profitGrowth = prevNetProfit !== 0
    ? ((netProfit - prevNetProfit) / Math.abs(prevNetProfit)) * 100
    : 0;

  // Buscar contas a receber (próximos 30 dias)
  const next30Days = new Date();
  next30Days.setDate(next30Days.getDate() + 30);

  const receivables = await getSaleInstallmentRepository().list({
    status: "PENDING",
    dueDateStart: now,
    dueDateEnd: next30Days,
  });

  const receivables30Days = receivables.reduce((sum, r) => sum + r.amount, 0);

  // Buscar contas a pagar (próximos 30 dias)
  const payables = await getAccountPayableRepository().list({
    status: "PENDING",
    startDate: now,
    endDate: next30Days,
  });

  const payables30Days = payables.reduce((sum, p) => sum + p.amount, 0);

  // Buscar saldo atual de todas as contas
  const bankAccounts = await getBankAccountRepository().listWithBalances();
  const currentBalance = bankAccounts.reduce((sum: number, acc) => sum + acc.currentBalance, 0);

  // Projeção simples de saldo (saldo atual + recebíveis - pagáveis)
  const projectedBalance30Days = currentBalance + receivables30Days - payables30Days;

  return {
    currentBalance,
    monthRevenue,
    monthExpenses,
    netProfit,
    profitMargin,
    receivables30Days,
    payables30Days,
    projectedBalance30Days,
    revenueGrowth,
    expensesGrowth,
    profitGrowth,
    bankAccounts: bankAccounts.map((acc) => ({
      id: acc.id,
      name: acc.name,
      type: acc.type,
      balance: acc.currentBalance,
    })),
  };
}
