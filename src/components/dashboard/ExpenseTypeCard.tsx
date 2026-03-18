"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingDown } from "lucide-react";

interface ExpenseTypeData {
  fixed: number;
  variable: number;
  total: number;
}

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

const COLORS = { fixed: '#ef4444', variable: '#f97316' };

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-xs">
      <p className="font-semibold text-slate-800 mb-1">{payload[0].name}</p>
      <p className="text-slate-500">Valor: <span className="font-bold text-slate-700">{brl(payload[0].value)}</span></p>
      <p className="text-slate-500">{payload[0].payload.percentage.toFixed(1)}%</p>
    </div>
  );
};

export function ExpenseTypeCard({ data }: { data?: ExpenseTypeData }) {
  if (!data) {
    return (
      <div className="bg-card rounded-2xl border border-border shadow-sm p-5 animate-pulse">
        <div className="h-3 w-32 bg-slate-200 rounded mb-4" />
        <div className="h-40 bg-slate-100 rounded-xl mb-3" />
        <div className="h-3 w-24 bg-slate-200 rounded" />
      </div>
    );
  }

  const { fixed, variable, total } = data;
  const fixedPct = total > 0 ? (fixed / total) * 100 : 0;
  const variablePct = total > 0 ? (variable / total) * 100 : 0;

  const chartData = [
    { name: 'Despesas Fixas', value: fixed, percentage: fixedPct },
    { name: 'Despesas Variáveis', value: variable, percentage: variablePct },
  ];

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Despesas</span>
          <p className="text-xs text-slate-400 mt-0.5">Fixas vs Variáveis</p>
        </div>
        <div className="h-9 w-9 rounded-xl bg-amber-50 flex items-center justify-center">
          <TrendingDown className="h-4 w-4 text-amber-500" />
        </div>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
            <Cell fill={COLORS.fixed} />
            <Cell fill={COLORS.variable} />
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <div className="space-y-2 mt-2">
        <div className="flex items-center justify-between p-2.5 bg-rose-50 rounded-xl border border-rose-100">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-xs font-medium text-slate-700">Fixas</span>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-rose-600">{brl(fixed)}</p>
            <p className="text-xs text-slate-400">{fixedPct.toFixed(1)}%</p>
          </div>
        </div>
        <div className="flex items-center justify-between p-2.5 bg-amber-50 rounded-xl border border-amber-100">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span className="text-xs font-medium text-slate-700">Variáveis</span>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-amber-600">{brl(variable)}</p>
            <p className="text-xs text-slate-400">{variablePct.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-border mt-3 text-xs">
        <span className="font-semibold text-slate-600">Total</span>
        <span className="font-bold text-slate-800">{brl(total)}</span>
      </div>

      {fixedPct > 70 && (
        <div className="mt-3 p-2.5 bg-amber-50 rounded-xl border border-amber-200">
          <p className="text-xs text-amber-700 font-medium">Fixas em {fixedPct.toFixed(0)}% do total. Revise contratos recorrentes.</p>
        </div>
      )}
    </div>
  );
}
