import { getSaleInstallmentRepository } from "@/infrastructure/repositories/factory";
import { getAccountPayableRepository } from "@/infrastructure/repositories/factory";
import { getBankAccountRepository } from "@/infrastructure/repositories/factory";

export async function GetFinancialAlerts(period: string) {
  const alerts = [];
  const now = new Date();

  // Buscar contas vencidas
  const overdueReceivables = await getSaleInstallmentRepository().list({
    status: "PENDING",
    dueDateEnd: now,
  });

  if (overdueReceivables.length > 0) {
    const totalOverdue = overdueReceivables.reduce((sum, r) => sum + r.amount, 0);
    alerts.push({
      id: "overdue-receivables",
      type: "warning" as const,
      title: "Contas a Receber Vencidas",
      message: `${overdueReceivables.length} parcela(s) vencida(s)`,
      value: totalOverdue,
      action: {
        label: "Ver Contas",
        href: "/receivables",
      },
    });
  }

  // Buscar contas a pagar vencidas
  const overduePayables = await getAccountPayableRepository().list({
    status: "PENDING",
    endDate: now,
  });

  if (overduePayables.length > 0) {
    const totalOverdue = overduePayables.reduce((sum, p) => sum + p.amount, 0);
    alerts.push({
      id: "overdue-payables",
      type: "error" as const,
      title: "Contas a Pagar Vencidas",
      message: `${overduePayables.length} conta(s) vencida(s)`,
      value: totalOverdue,
      action: {
        label: "Ver Contas",
        href: "/accounts-payable",
      },
    });
  }

  // Verificar saldo baixo em contas
  const bankAccounts = await getBankAccountRepository().listWithBalances();
  const lowBalanceAccounts = bankAccounts.filter((acc) => acc.currentBalance < 1000 && acc.currentBalance > 0);

  if (lowBalanceAccounts.length > 0) {
    alerts.push({
      id: "low-balance",
      type: "warning" as const,
      title: "Saldo Baixo",
      message: `${lowBalanceAccounts.length} conta(s) com saldo abaixo de R$ 1.000`,
      action: {
        label: "Ver Contas",
        href: "/bank-accounts/dashboard",
      },
    });
  }

  // Verificar projeção de saldo negativo
  const next30Days = new Date();
  next30Days.setDate(next30Days.getDate() + 30);

  const receivables = await getSaleInstallmentRepository().list({
    status: "PENDING",
    dueDateStart: now,
    dueDateEnd: next30Days,
  });

  const payables = await getAccountPayableRepository().list({
    status: "PENDING",
    startDate: now,
    endDate: next30Days,
  });

  const currentBalance = bankAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
  const receivablesTotal = receivables.reduce((sum, r) => sum + r.amount, 0);
  const payablesTotal = payables.reduce((sum, p) => sum + p.amount, 0);
  const projectedBalance = currentBalance + receivablesTotal - payablesTotal;

  if (projectedBalance < 0) {
    alerts.push({
      id: "negative-projection",
      type: "error" as const,
      title: "Projeção de Saldo Negativo",
      message: "Saldo projetado para os próximos 30 dias está negativo",
      value: projectedBalance,
      action: {
        label: "Ver Dashboard",
        href: "/dashboard/financial",
      },
    });
  }

  return alerts;
}
