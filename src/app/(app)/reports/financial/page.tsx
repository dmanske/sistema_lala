'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DREReport } from '@/components/reports/DREReport';
import { ProfitabilityAnalysis } from '@/components/reports/ProfitabilityAnalysis';
import { ExpensesByCategory } from '@/components/reports/ExpensesByCategory';
import { FileText, TrendingUp, PieChart, BarChart3, Calendar, Lightbulb } from 'lucide-react';

export default function FinancialReportsPage() {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().split('T')[0];
  });

  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  return (
    <div className="space-y-6 pb-10">

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200">
          <BarChart3 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Relatórios Financeiros</h1>
          <p className="text-sm text-slate-500">Análises gerenciais completas para tomada de decisão</p>
        </div>
      </div>

      {/* Filtro de Período */}
      <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-7 w-7 rounded-lg bg-violet-50 flex items-center justify-center">
            <Calendar className="h-3.5 w-3.5 text-violet-500" />
          </div>
          <p className="text-sm font-semibold text-slate-700">Período de Análise</p>
          <span className="text-xs text-slate-400 ml-1">— selecione o intervalo para gerar os relatórios</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="startDate" className="text-xs font-medium text-slate-500">Data Inicial</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-xl border-slate-200 bg-slate-50 focus:bg-white"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="endDate" className="text-xs font-medium text-slate-500">Data Final</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-xl border-slate-200 bg-slate-50 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Tabs de Relatórios */}
      <Tabs defaultValue="dre" className="space-y-4">
        <TabsList className="w-full rounded-2xl border border-border bg-slate-50 p-1.5 h-auto gap-1">
          <TabsTrigger
            value="dre"
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-violet-700"
          >
            <FileText className="h-4 w-4" />
            DRE
          </TabsTrigger>
          <TabsTrigger
            value="profitability"
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-700"
          >
            <TrendingUp className="h-4 w-4" />
            Lucratividade
          </TabsTrigger>
          <TabsTrigger
            value="expenses"
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-amber-700"
          >
            <PieChart className="h-4 w-4" />
            Despesas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dre" className="space-y-4">
          <DREReport startDate={startDate} endDate={endDate} />
        </TabsContent>

        <TabsContent value="profitability" className="space-y-4">
          <ProfitabilityAnalysis startDate={startDate} endDate={endDate} />
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <ExpensesByCategory startDate={startDate} endDate={endDate} />
        </TabsContent>
      </Tabs>

      {/* Dicas */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-7 w-7 rounded-lg bg-blue-100 flex items-center justify-center">
            <Lightbulb className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <p className="text-sm font-semibold text-blue-800">Entendendo os Relatórios</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/70 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-violet-500" />
              <p className="text-sm font-semibold text-slate-700">DRE</p>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Mostra receitas de vendas pagas, custos dos produtos/serviços e despesas operacionais pagas no período. O resultado final é o lucro líquido do negócio.
            </p>
            <p className="text-xs text-blue-600 mt-2 font-medium">Fonte: Vendas pagas + Contas a pagar quitadas</p>
          </div>
          <div className="bg-white/70 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <p className="text-sm font-semibold text-slate-700">Lucratividade</p>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Por Serviço: quais serviços geram mais receita, quantidade atendida e ticket médio. Por Profissional: receita e atendimentos por colaborador no período.
            </p>
            <p className="text-xs text-blue-600 mt-2 font-medium">Fonte: Itens de vendas pagas com agendamento</p>
          </div>
          <div className="bg-white/70 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <PieChart className="h-4 w-4 text-amber-500" />
              <p className="text-sm font-semibold text-slate-700">Despesas por Categoria</p>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Distribuição visual de todas as contas a pagar quitadas no período, agrupadas por categoria. Identifique onde o dinheiro está saindo e corte custos desnecessários.
            </p>
            <p className="text-xs text-blue-600 mt-2 font-medium">Fonte: Contas a pagar com status Pago</p>
          </div>
        </div>
      </div>
    </div>
  );
}
