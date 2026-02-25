"use client";

import { DollarSign, TrendingUp, TrendingDown, Wallet, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  
  // Comparativos
  revenueGrowth: number;
  expensesGrowth: number;
  profitGrowth: number;
}

interface FinancialMetricsCardsProps {
  metrics?: FinancialMetrics;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatPercentage = (value: number) => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
};

interface MetricCardProps {
  title: string;
  value: string;
  subtext: string;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  color?: 'blue' | 'green' | 'purple' | 'rose' | 'orange';
}

const MetricCard = ({ title, value, subtext, icon: Icon, trend, color = 'blue' }: MetricCardProps) => {
  const gradientClasses = {
    blue: "from-blue-500/10 to-cyan-500/10 border-blue-100",
    green: "from-emerald-500/10 to-green-500/10 border-emerald-100",
    purple: "from-purple-500/10 to-pink-500/10 border-purple-100",
    rose: "from-rose-500/10 to-orange-500/10 border-rose-100",
    orange: "from-orange-500/10 to-amber-500/10 border-orange-100",
  } as Record<string, string>;

  const iconColorClasses = {
    blue: "bg-blue-50 text-blue-600 shadow-blue-100",
    green: "bg-emerald-50 text-emerald-600 shadow-emerald-100",
    purple: "bg-purple-50 text-purple-600 shadow-purple-100",
    rose: "bg-rose-50 text-rose-600 shadow-rose-100",
    orange: "bg-orange-50 text-orange-600 shadow-orange-100",
  } as Record<string, string>;

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br border",
      gradientClasses[color] || gradientClasses.blue
    )}>
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-white/40 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
          {title}
        </CardTitle>
        <div className={cn(
          "p-2.5 rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110",
          iconColorClasses[color] || iconColorClasses.blue
        )}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-slate-900 tracking-tight">{value}</div>
        <div className="flex items-center text-xs text-slate-600 mt-2 font-medium">
          {trend === 'up' && <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600 mr-1" />}
          {trend === 'down' && <ArrowDownRight className="h-3.5 w-3.5 text-rose-600 mr-1" />}
          {subtext}
        </div>
      </CardContent>
    </Card>
  );
};

export function FinancialMetricsCards({ metrics }: FinancialMetricsCardsProps) {
  // Loading state
  if (!metrics) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-slate-200 rounded w-24" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-slate-200 rounded w-32 mb-2" />
              <div className="h-3 bg-slate-200 rounded w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Primeira linha - Métricas principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Saldo Atual"
          value={formatCurrency(metrics.currentBalance)}
          subtext="Todas as contas"
          icon={Wallet}
          color="blue"
        />
        <MetricCard
          title="Receita do Mês"
          value={formatCurrency(metrics.monthRevenue)}
          subtext={formatPercentage(metrics.revenueGrowth)}
          icon={DollarSign}
          trend={metrics.revenueGrowth >= 0 ? 'up' : 'down'}
          color="green"
        />
        <MetricCard
          title="Despesa do Mês"
          value={formatCurrency(metrics.monthExpenses)}
          subtext={formatPercentage(metrics.expensesGrowth)}
          icon={TrendingDown}
          trend={metrics.expensesGrowth <= 0 ? 'up' : 'down'}
          color="rose"
        />
        <MetricCard
          title="Lucro Líquido"
          value={formatCurrency(metrics.netProfit)}
          subtext={`Margem: ${metrics.profitMargin.toFixed(1)}%`}
          icon={TrendingUp}
          trend={metrics.profitGrowth >= 0 ? 'up' : 'down'}
          color="purple"
        />
      </div>

      {/* Segunda linha - Projeções e contas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Contas a Receber"
          value={formatCurrency(metrics.receivables30Days)}
          subtext="Próximos 30 dias"
          icon={Calendar}
          color="blue"
        />
        <MetricCard
          title="Contas a Pagar"
          value={formatCurrency(metrics.payables30Days)}
          subtext="Próximos 30 dias"
          icon={Calendar}
          color="orange"
        />
        <MetricCard
          title="Projeção de Saldo"
          value={formatCurrency(metrics.projectedBalance30Days)}
          subtext="Em 30 dias"
          icon={TrendingUp}
          trend={metrics.projectedBalance30Days >= metrics.currentBalance ? 'up' : 'down'}
          color={metrics.projectedBalance30Days >= 0 ? 'green' : 'rose'}
        />
        <MetricCard
          title="Margem de Lucro"
          value={`${metrics.profitMargin.toFixed(1)}%`}
          subtext={formatPercentage(metrics.profitGrowth)}
          icon={TrendingUp}
          trend={metrics.profitGrowth >= 0 ? 'up' : 'down'}
          color="purple"
        />
      </div>
    </>
  );
}
