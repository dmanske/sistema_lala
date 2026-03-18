"use client";

import { AlertTriangle, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DefaultRateData {
  totalOverdue: number;
  totalReceivables: number;
  overdueCount: number;
  defaultRate: number;
}

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export function DefaultRateCard({ data }: { data?: DefaultRateData }) {
  if (!data) {
    return (
      <div className="bg-card rounded-2xl border border-border shadow-sm p-5 animate-pulse">
        <div className="h-3 w-24 bg-slate-200 rounded mb-4" />
        <div className="h-10 w-20 bg-slate-200 rounded mb-3" />
        <div className="h-3 w-32 bg-slate-200 rounded" />
      </div>
    );
  }

  const { totalOverdue, totalReceivables, overdueCount, defaultRate } = data;
  const rateColor = defaultRate > 10 ? 'text-rose-600' : defaultRate > 5 ? 'text-amber-600' : 'text-emerald-600';
  const iconBg = defaultRate > 10 ? 'bg-rose-50' : defaultRate > 5 ? 'bg-amber-50' : 'bg-emerald-50';
  const iconColor = defaultRate > 10 ? 'text-rose-500' : defaultRate > 5 ? 'text-amber-500' : 'text-emerald-500';

  return (
    <div className={cn('bg-card rounded-2xl border shadow-sm p-5', defaultRate > 10 ? 'border-rose-200' : 'border-border')}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Inadimplência</span>
          <p className="text-xs text-slate-400 mt-0.5">Contas vencidas e não pagas</p>
        </div>
        <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center', iconBg)}>
          <AlertTriangle className={cn('h-4 w-4', iconColor)} />
        </div>
      </div>

      {/* Taxa */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Taxa de Inadimplência</p>
          <p className={cn('text-3xl font-bold', rateColor)}>{defaultRate.toFixed(1)}%</p>
        </div>
        <div className={cn('h-10 w-10 rounded-full flex items-center justify-center', iconBg)}>
          <TrendingDown className={cn('h-5 w-5', iconColor)} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-rose-50 rounded-xl p-3 border border-rose-100">
          <p className="text-xs text-slate-400 mb-1">Valor Vencido</p>
          <p className="text-sm font-bold text-rose-600">{brl(totalOverdue)}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <p className="text-xs text-slate-400 mb-1">Parcelas</p>
          <p className="text-sm font-bold text-slate-700">{overdueCount}</p>
        </div>
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-border text-xs">
        <span className="text-slate-400">Total a Receber</span>
        <span className="font-semibold text-slate-700">{brl(totalReceivables)}</span>
      </div>

      {defaultRate > 10 && (
        <div className="mt-3 p-2.5 bg-rose-50 rounded-xl border border-rose-200">
          <p className="text-xs text-rose-700 font-medium">Taxa acima do recomendado (10%). Ação necessária.</p>
        </div>
      )}
    </div>
  );
}
