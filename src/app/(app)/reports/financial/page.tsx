'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DREReport } from '@/components/reports/DREReport';
import { ProfitabilityAnalysis } from '@/components/reports/ProfitabilityAnalysis';
import { ExpensesByCategory } from '@/components/reports/ExpensesByCategory';
import { FileText, TrendingUp, PieChart } from 'lucide-react';

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
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Relatórios Financeiros</h2>
          <p className="text-muted-foreground">
            Análises gerenciais completas para tomada de decisão
          </p>
        </div>
      </div>

      {/* Filtros Globais */}
      <Card>
        <CardHeader>
          <CardTitle>Período de Análise</CardTitle>
          <CardDescription>
            Selecione o período para gerar os relatórios financeiros
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data Inicial</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Data Final</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Relatórios */}
      <Tabs defaultValue="dre" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dre" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            DRE
          </TabsTrigger>
          <TabsTrigger value="profitability" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Lucratividade
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Despesas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dre" className="space-y-4">
          <DREReport />
        </TabsContent>

        <TabsContent value="profitability" className="space-y-4">
          <ProfitabilityAnalysis startDate={startDate} endDate={endDate} />
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <ExpensesByCategory startDate={startDate} endDate={endDate} />
        </TabsContent>
      </Tabs>

      {/* Texto Explicativo */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">💡 Como usar os Relatórios Financeiros</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 space-y-2">
          <p>
            <strong>DRE (Demonstração do Resultado do Exercício):</strong> Visão contábil completa do seu negócio,
            mostrando receitas, custos, despesas e lucros. Use para entender a saúde financeira geral.
          </p>
          <p>
            <strong>Análise de Lucratividade:</strong> Descubra quais serviços e profissionais são mais rentáveis.
            Use para tomar decisões sobre precificação e alocação de recursos.
          </p>
          <p>
            <strong>Despesas por Categoria:</strong> Visualize onde seu dinheiro está sendo gasto.
            Use para identificar oportunidades de redução de custos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
