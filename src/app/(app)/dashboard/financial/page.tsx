"use client";

import { useEffect, useState, useMemo } from "react";
import { startOfMonth, endOfMonth } from "date-fns";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PeriodFilter } from "@/components/dashboard/PeriodFilter";
import { DashboardAlerts, Alert } from "@/components/dashboard/DashboardAlerts";

import { FinancialMetricsCards } from "@/components/dashboard/FinancialMetricsCards";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { InflowOutflowChart } from "@/components/dashboard/InflowOutflowChart";
import { BankAccountsList } from "@/components/dashboard/BankAccountsList";
import { DefaultRateCard } from "@/components/dashboard/DefaultRateCard";
import { ExpenseTypeCard } from "@/components/dashboard/ExpenseTypeCard";
import { SimplifiedDRECard } from "@/components/dashboard/SimplifiedDRECard";

import { useFinancialDashboard } from "@/hooks/useFinancialDashboard";

export default function FinancialDashboardPage() {
  const [periodStart, setPeriodStart] = useState(startOfMonth(new Date()));
  const [periodEnd, setPeriodEnd] = useState(endOfMonth(new Date()));
  const [activeTab, setActiveTab] = useState<'cashflow' | 'analysis' | 'accounts'>('cashflow');
  
  // Converter para o formato esperado pelo hook
  const period = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    
    if (periodStart.getTime() === monthStart.getTime() && periodEnd.getTime() === monthEnd.getTime()) {
      return 'current_month';
    }
    return 'current_month'; // fallback
  }, [periodStart, periodEnd]);

  const { data, loading, error } = useFinancialDashboard(period);

  const handlePeriodChange = (start: Date, end: Date) => {
    setPeriodStart(start);
    setPeriodEnd(end);
  };

  // Generate alerts
  const alerts: Alert[] = useMemo(() => {
    if (!data?.alerts) return [];
    
    return data.alerts.map((alert: any, idx: number) => ({
      id: `alert-${idx}`,
      type: alert.type || 'warning',
      title: alert.title || 'Alerta',
      message: alert.message || '',
      dismissible: true
    }));
  }, [data?.alerts]);

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-muted/30 rounded-lg animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-muted/30 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Erro ao carregar dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard Financeiro
          </h1>
          <p className="text-muted-foreground">
            Visão consolidada do fluxo de caixa e métricas financeiras
          </p>
        </div>
      </div>

      {/* Métricas Principais */}
      <FinancialMetricsCards metrics={data?.metrics} />

      {/* Alerts */}
      {alerts.length > 0 && <DashboardAlerts alerts={alerts} />}

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <Button
          variant={activeTab === 'cashflow' ? 'default' : 'outline'}
          onClick={() => setActiveTab('cashflow')}
        >
          Fluxo de Caixa
        </Button>
        <Button
          variant={activeTab === 'analysis' ? 'default' : 'outline'}
          onClick={() => setActiveTab('analysis')}
        >
          Análises
        </Button>
        <Button
          variant={activeTab === 'accounts' ? 'default' : 'outline'}
          onClick={() => setActiveTab('accounts')}
        >
          Contas Bancárias
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'cashflow' && (
        <div className="space-y-4">
          {/* Cards de Insights */}
          <div className="grid gap-4 md:grid-cols-3">
            <DefaultRateCard data={data?.insights?.defaultRate} />
            <ExpenseTypeCard data={data?.insights?.expenseType} />
            <SimplifiedDRECard data={data?.insights?.simplifiedDRE} />
          </div>
        </div>
      )}

      {activeTab === 'analysis' && (
        <div className="space-y-4">
          <InflowOutflowChart data={data?.inflowOutflowData} />
          <CashFlowChart data={data?.cashFlowData} />
        </div>
      )}

      {activeTab === 'accounts' && (
        <div className="space-y-4">
          <BankAccountsList accounts={data?.bankAccounts} />
        </div>
      )}
    </div>
  );
}
