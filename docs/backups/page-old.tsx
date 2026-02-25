"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertCircle,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { FinancialMetricsCards } from "@/components/dashboard/FinancialMetricsCards";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { InflowOutflowChart } from "@/components/dashboard/InflowOutflowChart";
import { BankAccountsList } from "@/components/dashboard/BankAccountsList";
import { FinancialAlerts } from "@/components/dashboard/FinancialAlerts";

import { useFinancialDashboard } from "@/hooks/useFinancialDashboard";

export default function FinancialDashboardPage() {
  const [period, setPeriod] = useState("current_month");
  const { data, loading, error } = useFinancialDashboard(period);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Carregando dashboard financeiro...</p>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">
            Dashboard Financeiro
          </h1>
          <p className="text-muted-foreground">
            Visão consolidada do fluxo de caixa e métricas financeiras
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px] bg-white border-slate-200 shadow-sm">
              <Calendar className="mr-2 h-4 w-4 text-slate-500" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current_month">Mês Atual</SelectItem>
              <SelectItem value="last_month">Mês Anterior</SelectItem>
              <SelectItem value="last_3_months">Últimos 3 Meses</SelectItem>
              <SelectItem value="current_year">Ano Atual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Alertas Financeiros */}
      {data?.alerts && data.alerts.length > 0 && (
        <FinancialAlerts alerts={data.alerts} />
      )}

      {/* Métricas Principais */}
      <FinancialMetricsCards metrics={data?.metrics} />

      {/* Gráficos e Análises */}
      <Tabs defaultValue="cashflow" className="space-y-6">
        <TabsList className="bg-white border p-1 rounded-xl shadow-sm w-full md:w-auto grid grid-cols-3 md:inline-flex">
          <TabsTrigger 
            value="cashflow" 
            className="rounded-lg data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900"
          >
            Fluxo de Caixa
          </TabsTrigger>
          <TabsTrigger 
            value="comparison" 
            className="rounded-lg data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900"
          >
            Entradas vs Saídas
          </TabsTrigger>
          <TabsTrigger 
            value="accounts" 
            className="rounded-lg data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900"
          >
            Contas Bancárias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cashflow" className="space-y-4">
          <CashFlowChart data={data?.cashFlowData} />
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <InflowOutflowChart data={data?.inflowOutflowData} />
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <BankAccountsList accounts={data?.bankAccounts} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
