"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { TrendingDown } from "lucide-react";

interface ExpenseTypeData {
  fixed: number;
  variable: number;
  total: number;
}

interface ExpenseTypeCardProps {
  data?: ExpenseTypeData;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const COLORS = {
  fixed: '#ef4444',    // rose-500
  variable: '#f97316', // orange-500
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
        <p className="text-sm font-semibold text-slate-900 mb-1">
          {payload[0].name}
        </p>
        <p className="text-sm text-slate-600">
          Valor: <span className="font-bold">{formatCurrency(payload[0].value)}</span>
        </p>
        <p className="text-sm text-slate-600">
          Percentual: <span className="font-bold">{payload[0].payload.percentage.toFixed(1)}%</span>
        </p>
      </div>
    );
  }
  return null;
};

export function ExpenseTypeCard({ data }: ExpenseTypeCardProps) {
  if (!data) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 bg-orange-50 rounded-lg">
              <TrendingDown className="h-4 w-4 text-orange-600" />
            </div>
            Despesas Fixas vs Variáveis
          </CardTitle>
          <CardDescription>Distribuição dos tipos de despesa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>Carregando dados...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { fixed, variable, total } = data;
  const fixedPercentage = total > 0 ? (fixed / total) * 100 : 0;
  const variablePercentage = total > 0 ? (variable / total) * 100 : 0;

  const chartData = [
    { name: 'Despesas Fixas', value: fixed, percentage: fixedPercentage },
    { name: 'Despesas Variáveis', value: variable, percentage: variablePercentage },
  ];

  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 bg-orange-50 rounded-lg">
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </div>
          Despesas Fixas vs Variáveis
        </CardTitle>
        <CardDescription>Distribuição dos tipos de despesa</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Gráfico de Pizza */}
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                <Cell fill={COLORS.fixed} />
                <Cell fill={COLORS.variable} />
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legenda e Valores */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-rose-50 rounded-lg border border-rose-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-sm font-medium">Despesas Fixas</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-rose-600">{formatCurrency(fixed)}</p>
                <p className="text-xs text-muted-foreground">{fixedPercentage.toFixed(1)}%</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-sm font-medium">Despesas Variáveis</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-orange-600">{formatCurrency(variable)}</p>
                <p className="text-xs text-muted-foreground">{variablePercentage.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="pt-3 border-t">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-700">Total de Despesas</span>
              <span className="text-lg font-bold text-slate-900">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Insight */}
          {fixedPercentage > 70 && (
            <div className="p-2 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-xs text-amber-700 font-medium">
                💡 Despesas fixas representam {fixedPercentage.toFixed(0)}% do total. Considere revisar contratos e custos recorrentes.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
