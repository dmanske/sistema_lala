"use client";

import { useState, useMemo } from "react";
import { startOfMonth, endOfMonth } from "date-fns";
import { BarChart2, AlertCircle, Loader2 } from "lucide-react";

import { DashboardAlerts, Alert } from "@/components/dashboard/DashboardAlerts";
import { FinancialMetricsCards } from "@/components/dashboard/FinancialMetricsCards";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { InflowOutflowChart } from "@/components/dashboard/InflowOutflowChart";
import { BankAccountsList } from "@/components/dashboard/BankAccountsList";
import { DefaultRateCard } from "@/components/dashboard/DefaultRateCard";
import { ExpenseTypeCard } from "@/components/dashboard/ExpenseTypeCard";
import { SimplifiedDRECard } from "@/components/dashboard/SimplifiedDRECard";
import { useFinancialDashboard } from "@/hooks/useFinancialDashboard";

const TABS = [
  { id: 'cashflow', label: 'Fluxo de Caixa' },
  { id: 'analysis', label: 'Análises' },
  { id: 'accounts', label: 'Contas Bancárias' },
] as const;

type TabId = typeof TABS[number]['id'];

export default function FinancialDashboardPage() {
  const [periodStart] = useState(startOfMonth(new Date()));
  const [periodEnd] = useState(endOfMonth(new Date()));
  const [activeTab, setActiveTab] = useState<TabId>('cashflow');

  const { data, loading, error } = useFinancialDashboard('current_month');

  const alerts: Alert[] = useMemo(() => {
    if (!data?.alerts) return [];
    return data.alerts.map((alert: any, idx: number) => ({
      id: `alert-${idx}`,
      type: alert.type || 'warning',
      title: alert.title || 'Alerta',
      message: alert.message || '',
      dismissible: true,
    }));
  }, [data?.alerts]);

  if (loading && !data) {
    return (
      <div className="space-y-6 pb-10">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200 animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-muted/40 rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-muted/30 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-32 bg-card rounded-2xl border border-border animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="bg-card rounded-2xl border border-border shadow-sm p-8 max-w-md text-center">
          <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <h3 className="text-base font-semibold text-slate-800 mb-2">Erro ao carregar dados</h3>
          <p className="text-sm text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200">
          <BarChart2 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Dashboard Financeiro</h1>
          <p className="text-sm text-slate-500">Visão consolidada do fluxo financeiro</p>
        </div>
      </div>

      {/* Métricas */}
      <FinancialMetricsCards metrics={data?.metrics} />

      {/* Alerts */}
      {alerts.length > 0 && <DashboardAlerts alerts={alerts} />}

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-card border border-border shadow-sm rounded-xl p-1 w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'cashflow' && (
        <div className="grid gap-4 md:grid-cols-3">
          <DefaultRateCard data={data?.insights?.defaultRate} />
          <ExpenseTypeCard data={data?.insights?.expenseType} />
          <SimplifiedDRECard data={data?.insights?.simplifiedDRE} />
        </div>
      )}

      {activeTab === 'analysis' && (
        <div className="space-y-4">
          <InflowOutflowChart data={data?.inflowOutflowData} />
          <CashFlowChart data={data?.cashFlowData} />
        </div>
      )}

      {activeTab === 'accounts' && (
        <BankAccountsList accounts={data?.bankAccounts} />
      )}
    </div>
  );
}
