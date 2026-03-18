'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import {
  Receipt, Banknote, Smartphone, CreditCard,
  ArrowLeftRight, FileText, CheckCircle2,
} from 'lucide-react';
import type { SaleInstallmentWithDetails } from '@/core/domain/entities/SaleInstallment';

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const methodConfig: Record<string, { label: string; icon: React.ElementType }> = {
  CASH:          { label: 'Dinheiro',      icon: Banknote },
  PIX:           { label: 'PIX',           icon: Smartphone },
  CREDIT_CARD:   { label: 'Cartão Créd.',  icon: CreditCard },
  DEBIT_CARD:    { label: 'Cartão Déb.',   icon: CreditCard },
  BANK_TRANSFER: { label: 'Transferência', icon: ArrowLeftRight },
  CHECK:         { label: 'Cheque',        icon: FileText },
};

interface ReceiptHistorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  installment: SaleInstallmentWithDetails | null;
}

export function ReceiptHistorySheet({ open, onOpenChange, installment }: ReceiptHistorySheetProps) {
  if (!installment) return null;

  const method = methodConfig[installment.notes ?? ''] ?? { label: installment.notes ?? '—', icon: Banknote };
  const Icon = method.icon;
  const receivedAmount = installment.receivedAmount ?? 0;
  const balance = installment.amount - receivedAmount;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[440px] p-0 overflow-y-auto">

        {/* Header */}
        <div className="bg-gradient-to-br from-teal-600 to-emerald-700 px-6 py-7">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center">
              <Receipt className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-white/60 text-xs uppercase tracking-wider">Histórico de Recebimentos</p>
              <p className="text-white font-bold text-base leading-tight">{installment.clientName}</p>
              <p className="text-white/70 text-xs">Parcela {installment.installmentNumber}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-white/50 text-xs mb-0.5">Total</p>
              <p className="text-white font-bold text-sm">{brl(installment.amount)}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-white/50 text-xs mb-0.5">Recebido</p>
              <p className="text-emerald-300 font-bold text-sm">{brl(receivedAmount)}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-white/50 text-xs mb-0.5">Saldo</p>
              <p className={`font-bold text-sm ${balance > 0 ? 'text-rose-300' : 'text-emerald-300'}`}>
                {brl(balance)}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Recebimentos registrados
          </p>

          {!installment.receivedAt ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <Receipt className="h-7 w-7 text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-500">Nenhum recebimento registrado</p>
              <p className="text-xs text-slate-400 mt-1">Os recebimentos aparecerão aqui</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="h-9 w-9 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-teal-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700">{brl(receivedAmount)}</p>
                  <p className="text-xs text-slate-400">{method.label}</p>
                  {installment.bankAccountName && (
                    <p className="text-xs text-slate-400 truncate">{installment.bankAccountName}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-medium text-slate-600">
                    {format(installment.receivedAt, 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium mt-0.5">
                    <CheckCircle2 className="h-3 w-3" /> Confirmado
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200 mt-3">
                <span className="text-sm font-semibold text-slate-600">Total recebido</span>
                <span className="text-base font-bold text-teal-600">{brl(receivedAmount)}</span>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
