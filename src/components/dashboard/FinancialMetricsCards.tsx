"use client";

import { DollarSign, TrendingUp, TrendingDown, Wallet, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface FinancialMetrics {
  currentBalance: number;
  monthRevenue: number;
  monthExpenses: number;
  netProfit: number;
  profitMargin: number;
  receivables30Days: number;
  payables30Days: number;
  projectedBalance30Days: number;
  revenueGrowth: number;
  expensesGrowth: number;
  profitGrowth: number;
}

interface FinancialMetricsCardsProps {
  metrics?: FinancialMetrics;
}

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const pct = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;

interface MetricCardProps {
  title: string;
  value: string;
  subtext: string;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  accent?: 'blue' | 'green' | 'purple' | 'rose' | 'orange';
}

const accentIcon: Record<string, string> = {
  blue:   'bg-blue-50 text-blue-500',
  green:  'bg-emerald-50 text-emerald-500',
  purple: 'bg-violet-50 text-violet-500',
  rose:   'bg-rose-50 text-rose-500',
  orange: 'bg-amber-50 text-amber-500',
};

const accentValue: Record<string, string> = {
  blue:   'text-blue-600',
  green:  'text-emerald-600',
  purple: 'text-violet-600',
  rose:   'text-rose-500',
  orange: 'text-amber-600',
};

const MetricCard = ({ title, value, subtext, icon: Icon, trend, accent = 'blue' }: MetricCardProps) => (
  <div className="bg-card rounded-2xl border border-border shadow-sm p-5 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
      <div className={cn('h-8 w-8 rounded-xl flex items-center justify-center', accentIcon[accent])}>
        <Icon className="h-4 w-4" />
      </div>
    </div>
    <p className={cn('text-2xl font-bold', accentValue[accent])}>{value}</p>
    <div className="flex items-center gap-1 mt-1">
      {trend === 'up' && <ArrowUpRight className="h-3 w-3 text-emerald-500" />}
      {trend === 'down' && <ArrowDownRight className="h-3 w-3 text-rose-500" />}
      <p className="text-xs text-slate-400">{subtext}</p>
    </div>
  </div>
);

export function FinancialMetricsCards({ metrics }: FinancialMetricsCardsProps) {
  if (!metrics) {
    return (
      <>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border shadow-sm p-5 animate-pulse">
              <div className="h-3 w-24 bg-slate-200 rounded mb-3" />
              <div className="h-7 w-32 bg-slate-200 rounded mb-2" />
              <div className="h-3 w-16 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border shadow-sm p-5 animate-pulse">
              <div className="h-3 w-24 bg-slate-200 rounded mb-3" />
              <div className="h-7 w-32 bg-slate-200 rounded mb-2" />
              <div className="h-3 w-16 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Saldo Atual" value={brl(metrics.currentBalance)} subtext="Todas as contas" icon={Wallet} accent="blue" />
        <MetricCard title="Receita do Mês" value={brl(metrics.monthRevenue)} subtext={pct(metrics.revenueGrowth)} icon={DollarSign} trend={metrics.revenueGrowth >= 0 ? 'up' : 'down'} accent="green" />
        <MetricCard title="Despesa do Mês" value={brl(metrics.monthExpenses)} subtext={pct(metrics.expensesGrowth)} icon={TrendingDown} trend={metrics.expensesGrowth <= 0 ? 'up' : 'down'} accent="rose" />
        <MetricCard title="Lucro Líquido" value={brl(metrics.netProfit)} subtext={`Margem: ${metrics.profitMargin.toFixed(1)}%`} icon={TrendingUp} trend={metrics.profitGrowth >= 0 ? 'up' : 'down'} accent="purple" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Contas a Receber" value={brl(metrics.receivables30Days)} subtext="Próximos 30 dias" icon={Calendar} accent="blue" />
        <MetricCard title="Contas a Pagar" value={brl(metrics.payables30Days)} subtext="Próximos 30 dias" icon={Calendar} accent="orange" />
        <MetricCard title="Projeção de Saldo" value={brl(metrics.projectedBalance30Days)} subtext="Em 30 dias" icon={TrendingUp} trend={metrics.projectedBalance30Days >= metrics.currentBalance ? 'up' : 'down'} accent={metrics.projectedBalance30Days >= 0 ? 'green' : 'rose'} />
        <MetricCard title="Margem de Lucro" value={`${metrics.profitMargin.toFixed(1)}%`} subtext={pct(metrics.profitGrowth)} icon={TrendingUp} trend={metrics.profitGrowth >= 0 ? 'up' : 'down'} accent="purple" />
      </div>
    </>
  );
}
