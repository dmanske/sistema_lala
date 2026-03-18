'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowRight, CheckCircle2, Clock, XCircle, ArrowRightLeft } from 'lucide-react';
import { getTransferHistory } from '@/app/(app)/bank-accounts/dashboard/actions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const statusConfig = {
  SCHEDULED: {
    label: 'Agendada',
    icon: Clock,
    className: 'bg-amber-50 text-amber-600 border-amber-200',
    iconClass: 'text-amber-400',
  },
  EXECUTED: {
    label: 'Executada',
    icon: CheckCircle2,
    className: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    iconClass: 'text-emerald-400',
  },
  CANCELLED: {
    label: 'Cancelada',
    icon: XCircle,
    className: 'bg-red-50 text-red-500 border-red-200',
    iconClass: 'text-red-400',
  },
};

export function TransferHistory() {
  const { data: transfers, isLoading } = useQuery({
    queryKey: ['transfer-history'],
    queryFn: getTransferHistory,
  });

  if (isLoading || !transfers || transfers.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
        Histórico de Transferências
      </h2>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-50">
          {transfers.map((transfer: any) => {
            const status = statusConfig[transfer.status as keyof typeof statusConfig] ?? statusConfig.SCHEDULED;
            const Icon = status.icon;

            return (
              <div key={transfer.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/60 transition-colors">

                {/* Ícone */}
                <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <ArrowRightLeft className="h-4 w-4 text-blue-400" />
                </div>

                {/* Contas */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate">{transfer.from_account?.name}</p>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                  <p className="text-sm font-semibold text-slate-700 truncate">{transfer.to_account?.name}</p>
                  {transfer.description && (
                    <p className="text-xs text-slate-400 truncate hidden md:block">· {transfer.description}</p>
                  )}
                </div>

                {/* Data */}
                <p className="text-xs text-slate-400 shrink-0 hidden sm:block">
                  {format(new Date(transfer.scheduled_date), "dd/MM/yyyy", { locale: ptBR })}
                </p>

                {/* Valor */}
                <p className="text-sm font-bold text-slate-700 shrink-0 w-28 text-right">
                  {brl(transfer.amount)}
                </p>

                {/* Status */}
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border shrink-0 ${status.className}`}>
                  <Icon className={`h-3 w-3 ${status.iconClass}`} />
                  {status.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
