import { getCashMovementRepository } from "@/infrastructure/repositories/factory";
import { startOfMonth, endOfMonth, subMonths, eachDayOfInterval, format } from "date-fns";

export async function GetCashFlowData(period: string) {
  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  // Definir período
  switch (period) {
    case "last_month":
      startDate = startOfMonth(subMonths(now, 1));
      endDate = endOfMonth(subMonths(now, 1));
      break;
    case "last_3_months":
      startDate = startOfMonth(subMonths(now, 2));
      endDate = now;
      break;
    case "current_year":
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = now;
      break;
    default: // current_month
      startDate = startOfMonth(now);
      endDate = now;
  }

  // Buscar todas as movimentações do período
  const cashMovements = await getCashMovementRepository().list({
    startDate,
    endDate,
  });

  // Agrupar por dia
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const dailyData = days.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const dayMovements = cashMovements.filter(
      (m) => format(new Date(m.createdAt), "yyyy-MM-dd") === dayStr
    );

    const inflow = dayMovements
      .filter((m) => m.type === "IN")
      .reduce((sum, m) => sum + m.amount, 0);

    const outflow = dayMovements
      .filter((m) => m.type === "OUT")
      .reduce((sum, m) => sum + m.amount, 0);

    return {
      date: day,
      inflow,
      outflow,
      balance: inflow - outflow,
    };
  });

  // Calcular saldo acumulado
  let accumulatedBalance = 0;
  const dailyDataWithBalance = dailyData.map((day) => {
    accumulatedBalance += day.balance;
    return {
      ...day,
      balance: accumulatedBalance,
    };
  });

  // Dados mensais (para gráfico de barras)
  const monthlyData = [];
  for (let i = 0; i < 6; i++) {
    const monthStart = startOfMonth(subMonths(now, i));
    const monthEnd = endOfMonth(subMonths(now, i));

    const monthMovements = cashMovements.filter((m) => {
      const movDate = new Date(m.createdAt);
      return movDate >= monthStart && movDate <= monthEnd;
    });

    const inflow = monthMovements
      .filter((m) => m.type === "IN")
      .reduce((sum, m) => sum + m.amount, 0);

    const outflow = monthMovements
      .filter((m) => m.type === "OUT")
      .reduce((sum, m) => sum + m.amount, 0);

    monthlyData.unshift({
      period: format(monthStart, "MMM/yy"),
      inflow,
      outflow,
      net: inflow - outflow,
    });
  }

  return {
    dailyData: dailyDataWithBalance,
    monthlyData,
  };
}
