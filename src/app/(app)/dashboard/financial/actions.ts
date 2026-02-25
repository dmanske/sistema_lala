"use server";

import { GetFinancialSummary } from "@/core/usecases/dashboard/GetFinancialSummary";
import { GetCashFlowData } from "@/core/usecases/dashboard/GetCashFlowData";
import { GetFinancialAlerts } from "@/core/usecases/dashboard/GetFinancialAlerts";

export async function getFinancialDashboardData(period: string) {
  try {
    const [metrics, cashFlowData, alerts] = await Promise.all([
      GetFinancialSummary(period),
      GetCashFlowData(period),
      GetFinancialAlerts(period),
    ]);

    return {
      success: true,
      data: {
        metrics,
        cashFlowData: cashFlowData.dailyData || [],
        inflowOutflowData: cashFlowData.monthlyData || [],
        bankAccounts: metrics.bankAccounts || [],
        alerts: alerts || [],
      },
    };
  } catch (error) {
    console.error("Error loading financial dashboard:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao carregar dashboard",
    };
  }
}
