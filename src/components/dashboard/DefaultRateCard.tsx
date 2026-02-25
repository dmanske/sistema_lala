"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DefaultRateData {
  totalOverdue: number;
  totalReceivables: number;
  overdueCount: number;
  defaultRate: number;
}

interface DefaultRateCardProps {
  data?: DefaultRateData;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export function DefaultRateCard({ data }: DefaultRateCardProps) {
  if (!data) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 bg-rose-50 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
            </div>
            Inadimplência
          </CardTitle>
          <CardDescription>Contas vencidas e não pagas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p>Carregando dados...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { totalOverdue, totalReceivables, overdueCount, defaultRate } = data;

  return (
    <Card className={cn(
      "border-slate-200 shadow-sm hover:shadow-md transition-shadow",
      defaultRate > 10 && "border-rose-200 bg-rose-50/30"
    )}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className={cn(
            "p-2 rounded-lg",
            defaultRate > 10 ? "bg-rose-100" : "bg-rose-50"
          )}>
            <AlertTriangle className={cn(
              "h-4 w-4",
              defaultRate > 10 ? "text-rose-700" : "text-rose-600"
            )} />
          </div>
          Inadimplência
        </CardTitle>
        <CardDescription>Contas vencidas e não pagas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Taxa de Inadimplência */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Taxa de Inadimplência</p>
              <p className={cn(
                "text-3xl font-bold",
                defaultRate > 10 ? "text-rose-700" : 
                defaultRate > 5 ? "text-orange-600" : 
                "text-emerald-600"
              )}>
                {defaultRate.toFixed(1)}%
              </p>
            </div>
            <div className={cn(
              "p-3 rounded-full",
              defaultRate > 10 ? "bg-rose-100" : 
              defaultRate > 5 ? "bg-orange-100" : 
              "bg-emerald-100"
            )}>
              <TrendingDown className={cn(
                "h-6 w-6",
                defaultRate > 10 ? "text-rose-600" : 
                defaultRate > 5 ? "text-orange-600" : 
                "text-emerald-600"
              )} />
            </div>
          </div>

          {/* Valores */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-rose-50 rounded-lg border border-rose-100">
              <p className="text-xs text-muted-foreground mb-1">Valor Vencido</p>
              <p className="text-lg font-bold text-rose-600">
                {formatCurrency(totalOverdue)}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-xs text-muted-foreground mb-1">Parcelas Vencidas</p>
              <p className="text-lg font-bold text-slate-700">
                {overdueCount}
              </p>
            </div>
          </div>

          {/* Total a Receber */}
          <div className="pt-3 border-t">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Total a Receber</span>
              <span className="font-semibold">{formatCurrency(totalReceivables)}</span>
            </div>
          </div>

          {/* Alerta */}
          {defaultRate > 10 && (
            <div className="p-2 bg-rose-100 rounded-lg border border-rose-200">
              <p className="text-xs text-rose-700 font-medium">
                ⚠️ Taxa de inadimplência acima do recomendado (10%)
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
