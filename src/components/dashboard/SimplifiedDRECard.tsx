"use client";

import { TrendingUp, Minus } from "lucide-react";
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

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const Row = ({ label, value, sub, color = 'slate' }: { label: string; value: string; sub?: string; color?: string }) => (
  <div className="flex items-center justify-between py-2">
    <div>
      <p className="text-sm font-medium text-slate-700">{label}</p>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
    <p className={`text-sm font-bold text-${color}-600`}>{value}</p>
  </div>
);

const Deduct = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center gap-2 py-1.5 pl-4">
    <Minus className="h-3 w-3 text-slate-300 shrink-0" />
    <div className="flex-1 flex items-center justify-between">
      <span className="text-xs text-slate-400">{label}</span>
      <span className="text-xs font-semibold text-rose-500">{value}</span>
    </div>
  </div>
);

export function SimplifiedDRECard({ data }: { data?: SimplifiedDREData }) {
  if (!data) {
    return (
      <div className="bg-card rounded-2xl border border-border shadow-sm p-5 animate-pulse">
        <div className="h-3 w-28 bg-slate-200 rounded mb-4" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 bg-slate-100 rounded-lg mb-2" />
        ))}
      </div>
    );
  }

  const { revenue, costs, expenses, grossProfit, netProfit, grossMargin, netMargin } = data;
  const isProfit = netProfit >= 0;

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">DRE</span>
          <p className="text-xs text-slate-400 mt-0.5">Resultado do Exercício</p>
        </div>
        <div className="h-9 w-9 rounded-xl bg-violet-50 flex items-center justify-center">
          <TrendingUp className="h-4 w-4 text-violet-500" />
        </div>
      </div>

      <div className="space-y-0.5">
        {/* Receita */}
        <div className="bg-emerald-50 rounded-xl px-4 py-2.5 border border-emerald-100">
          <Row label="Receita Total" value={brl(revenue)} color="emerald" />
        </div>

        <Deduct label="(-) Custos" value={brl(costs)} />

        {/* Lucro Bruto */}
        <div className="bg-blue-50 rounded-xl px-4 py-2.5 border border-blue-100">
          <Row label="Lucro Bruto" value={brl(grossProfit)} sub={`Margem: ${grossMargin.toFixed(1)}%`} color="blue" />
        </div>

        <Deduct label="(-) Despesas" value={brl(expenses)} />

        {/* Lucro Líquido */}
        <div className={cn('rounded-xl px-4 py-3 border-2', isProfit ? 'bg-violet-50 border-violet-200' : 'bg-rose-50 border-rose-200')}>
          <Row
            label="Lucro Líquido"
            value={brl(netProfit)}
            sub={`Margem: ${netMargin.toFixed(1)}%`}
            color={isProfit ? 'violet' : 'rose'}
          />
        </div>
      </div>

      {/* Insights */}
      <div className="space-y-2 mt-3">
        {grossMargin < 30 && (
          <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200">
            <p className="text-xs text-amber-700 font-medium">Margem bruta abaixo de 30%. Revise custos e precificação.</p>
          </div>
        )}
        {netMargin < 10 && netProfit > 0 && (
          <div className="p-2.5 bg-orange-50 rounded-xl border border-orange-200">
            <p className="text-xs text-orange-700 font-medium">Margem líquida baixa. Considere reduzir despesas.</p>
          </div>
        )}
        {netProfit < 0 && (
          <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200">
            <p className="text-xs text-rose-700 font-medium">Prejuízo no período. Ação imediata necessária.</p>
          </div>
        )}
      </div>
    </div>
  );
}
