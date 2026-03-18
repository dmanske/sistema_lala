'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Loader2, Receipt, Banknote, CreditCard, Smartphone, ArrowLeftRight, FileText } from 'lucide-react';
import { AccountPayableWithDetails } from '@/core/domain/entities/AccountPayable';
import { AccountPayablePayment } from '@/core/domain/entities/AccountPayablePayment';
import { SupabaseAccountPayableRepository } from '@/infrastructure/repositories/supabase/SupabaseAccountPayableRepository';

const repository = new SupabaseAccountPayableRepository();

const methodLabels: Record<string, { label: string; icon: React.ElementType }> = {
  DINHEIRO:      { label: 'Dinheiro',         icon: Banknote },
  PIX:           { label: 'PIX',              icon: Smartphone },
  TRANSFERENCIA: { label: 'Transferência',    icon: ArrowLeftRight },
  CARTAO_DEBITO: { label: 'Cartão Débito',    icon: CreditCard },
  CARTAO_CREDITO:{ label: 'Cartão Crédito',   icon: CreditCard },
  BOLETO:        { label: 'Boleto',           icon: FileText },
  CHEQUE:        { label: 'Cheque',           icon: FileText },
};

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

interface PaymentHistorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: AccountPayableWithDetails | null;
}

export function PaymentHistorySheet({ open, onOpenChange, account }: PaymentHistorySheetProps) {
  const [payments, setPayments] = useState<AccountPayablePayment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && account) {
      setLoading(true);
      repository
        .getPayments(account.id)
        .then(setPayments)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setPayments([]);
    }
  }, [open, account]);

  if (!account) return null;

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[440px] p-0 overflow-y-auto">

        {/* Header */}
        <div className="bg-gradient-to-br from-slate-700 to-slate-800 px-6 py-7">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center">
              <Receipt className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-white/60 text-xs uppercase tracking-wider">Histórico de Pagamentos</p>
              <p className="text-white font-bold text-base leading-tight">{account.description}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-white/50 text-xs mb-0.5">Total</p>
              <p className="text-white font-bold text-sm">{brl(account.amount)}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-white/50 text-xs mb-0.5">Pago</p>
              <p className="text-emerald-300 font-bold text-sm">{brl(totalPaid)}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-white/50 text-xs mb-0.5">Saldo</p>
              <p className={`font-bold text-sm ${account.remainingAmount > 0 ? 'text-rose-300' : 'text-emerald-300'}`}>
                {brl(account.remainingAmount)}
              </p>
            </div>
          </div>
        </div>

        {/* Lista de pagamentos */}
        <div className="px-6 py-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Pagamentos realizados
          </p>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <Receipt className="h-7 w-7 text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-500">Nenhum pagamento registrado</p>
              <p className="text-xs text-slate-400 mt-1">Os pagamentos aparecerão aqui</p>
            </div>
          ) : (
            <div className="space-y-2">
              {payments.map((payment) => {
                const method = methodLabels[payment.paymentMethod] ?? { label: payment.paymentMethod, icon: Banknote };
                const Icon = method.icon;
                return (
                  <div
                    key={payment.id}
                    className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100"
                  >
                    <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700">{brl(payment.amount)}</p>
                      <p className="text-xs text-slate-400">{method.label}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-medium text-slate-600">
                        {format(new Date(payment.paidAt), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                      {payment.notes && (
                        <p className="text-xs text-slate-400 truncate max-w-24">{payment.notes}</p>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Total */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200 mt-3">
                <span className="text-sm font-semibold text-slate-600">Total pago</span>
                <span className="text-base font-bold text-emerald-600">{brl(totalPaid)}</span>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
