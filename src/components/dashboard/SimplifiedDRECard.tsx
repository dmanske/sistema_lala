"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SimplifiedDREData {
  revenue: number;
  costs: number;
  expenses: number;
  grossProfit: number;
  netProfit: number;
  grossMargin: number;
  netMargin: number;
}

interface SimplifiedDRECardProps {
  data?: SimplifiedDREData;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export function SimplifiedDRECard({ data }: SimplifiedDRECardProps) {
  if (!data) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 bg-purple-50 rounded-lg">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
            DRE Simplificado
          </CardTitle>
          <CardDescription>Demonstração do Resultado do Exercício</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>Carregando dados...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { revenue, costs, expenses, grossProfit, netProfit, grossMargin, netMargin } = data;

  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 bg-purple-50 rounded-lg">
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </div>
          DRE Simplificado
        </CardTitle>
        <CardDescription>Demonstração do Resultado do Exercício</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Receita */}
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-emerald-900">Receita Total</span>
              <span className="text-lg font-bold text-emerald-600">{formatCurrency(revenue)}</span>
            </div>
          </div>

          {/* Custos */}
          <div className="flex items-center gap-2 pl-4">
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1 flex justify-between items-center">
              <span className="text-sm text-muted-foreground">(-) Custos</span>
              <span className="text-sm font-semibold text-rose-600">{formatCurrency(costs)}</span>
            </div>
          </div>

          {/* Lucro Bruto */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm font-medium text-blue-900">Lucro Bruto</span>
                <p className="text-xs text-blue-600">Margem: {grossMargin.toFixed(1)}%</p>
              </div>
              <span className="text-lg font-bold text-blue-600">{formatCurrency(grossProfit)}</span>
            </div>
          </div>

          {/* Despesas */}
          <div className="flex items-center gap-2 pl-4">
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1 flex justify-between items-center">
              <span className="text-sm text-muted-foreground">(-) Despesas</span>
              <span className="text-sm font-semibold text-rose-600">{formatCurrency(expenses)}</span>
            </div>
          </div>

          {/* Lucro Líquido */}
          <div className={cn(
            "p-4 rounded-lg border-2",
            netProfit >= 0 
              ? "bg-gradient-to-r from-purple-50 to-purple-50/50 border-purple-200" 
              : "bg-gradient-to-r from-rose-50 to-rose-50/50 border-rose-200"
          )}>
            <div className="flex justify-between items-center">
              <div>
                <span className={cn(
                  "text-base font-bold",
                  netProfit >= 0 ? "text-purple-900" : "text-rose-900"
                )}>
                  Lucro Líquido
                </span>
                <p className={cn(
                  "text-xs font-medium",
                  netProfit >= 0 ? "text-purple-600" : "text-rose-600"
                )}>
                  Margem: {netMargin.toFixed(1)}%
                </p>
              </div>
              <span className={cn(
                "text-2xl font-bold",
                netProfit >= 0 ? "text-purple-600" : "text-rose-600"
              )}>
                {formatCurrency(netProfit)}
              </span>
            </div>
          </div>

          {/* Insights */}
          <div className="pt-2 space-y-2">
            {grossMargin < 30 && (
              <div className="p-2 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-xs text-amber-700 font-medium">
                  ⚠️ Margem bruta abaixo de 30%. Revise custos e precificação.
                </p>
              </div>
            )}
            {netMargin < 10 && netProfit > 0 && (
              <div className="p-2 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-xs text-orange-700 font-medium">
                  💡 Margem líquida baixa. Considere reduzir despesas operacionais.
                </p>
              </div>
            )}
            {netProfit < 0 && (
              <div className="p-2 bg-rose-50 rounded-lg border border-rose-200">
                <p className="text-xs text-rose-700 font-medium">
                  🚨 Prejuízo no período. Ação imediata necessária!
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
