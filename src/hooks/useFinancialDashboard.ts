"use client";

import { useState, useEffect } from "react";
import { GetFinancialSummary } from "@/core/usecases/dashboard/GetFinancialSummary";
import { GetCashFlowData } from "@/core/usecases/dashboard/GetCashFlowData";
import { GetFinancialAlerts } from "@/core/usecases/dashboard/GetFinancialAlerts";

interface FinancialDashboardData {
  metrics: any;
  cashFlowData: any[];
  inflowOutflowData: any[];
  bankAccounts: any[];
  alerts: any[];
}

export function useFinancialDashboard(period: string) {
  const [data, setData] = useState<FinancialDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      setError(null);

      try {
        const [metrics, cashFlowData, alerts] = await Promise.all([
          GetFinancialSummary(period),
          GetCashFlowData(period),
          GetFinancialAlerts(period),
        ]);

        setData({
          metrics,
          cashFlowData: cashFlowData.dailyData || [],
          inflowOutflowData: cashFlowData.monthlyData || [],
          bankAccounts: metrics.bankAccounts || [],
          alerts: alerts || [],
        });
      } catch (err) {
        console.error("Error loading financial dashboard:", err);
        setError(err instanceof Error ? err.message : "Erro ao carregar dashboard");
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [period]);

  return { data, loading, error };
}
