"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
    Sheet,
    SheetContent,
} from "@/components/ui/sheet"
import { CashRegisterWithUser } from "@/core/domain/entities/CashRegister"
import {
    Clock,
    User,
    Banknote,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle2,
    Building2,
    ShoppingCart,
    ArrowUpCircle,
    ArrowDownCircle,
} from "lucide-react"

interface CashClosingDetailsProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    cashRegister: CashRegisterWithUser
}

const brl = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

export function CashClosingDetails({
    isOpen,
    onOpenChange,
    cashRegister,
}: CashClosingDetailsProps) {
    const difference = cashRegister.difference || 0
    const isDifferent = Math.abs(difference) >= 0.01
    const isShortage = difference < -0.01
    const isSurplus = difference > 0.01

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[480px] p-0 overflow-y-auto">

                {/* Header colorido baseado no status */}
                <div className={`px-6 py-8 ${
                    isDifferent
                        ? isShortage ? "bg-red-600" : "bg-yellow-500"
                        : "bg-emerald-600"
                }`}>
                    <div className="flex items-center gap-3 mb-4">
                        {isDifferent ? (
                            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                                <AlertTriangle className="h-5 w-5 text-white" />
                            </div>
                        ) : (
                            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                                <CheckCircle2 className="h-5 w-5 text-white" />
                            </div>
                        )}
                        <div>
                            <p className="text-white/70 text-xs font-medium uppercase tracking-wider">
                                Detalhes do Fechamento
                            </p>
                            <p className="text-white font-bold text-lg">
                                {isDifferent
                                    ? isShortage ? "Fechamento com Falta" : "Fechamento com Sobra"
                                    : "Fechamento OK"}
                            </p>
                        </div>
                    </div>

                    {/* Diferença em destaque */}
                    <div className="bg-white/15 rounded-2xl px-5 py-4">
                        <p className="text-white/70 text-xs mb-1">Diferença</p>
                        <p className="text-white text-3xl font-bold tracking-tight">
                            {difference > 0 ? "+" : ""}{brl(difference)}
                        </p>
                        <p className="text-white/60 text-xs mt-1">
                            Esperado {brl(cashRegister.expectedBalance || 0)} · Contado {brl(cashRegister.actualBalance || 0)}
                        </p>
                    </div>
                </div>

                <div className="px-6 py-6 space-y-6">

                    {/* Período do Turno */}
                    <section className="space-y-3">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Período do Turno</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                                    <span className="text-xs text-slate-400">Abertura</span>
                                </div>
                                <p className="text-sm font-semibold text-slate-700">
                                    {format(cashRegister.openedAt, "dd/MM/yyyy", { locale: ptBR })}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {format(cashRegister.openedAt, "HH:mm", { locale: ptBR })}
                                </p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                                    <span className="text-xs text-slate-400">Fechamento</span>
                                </div>
                                <p className="text-sm font-semibold text-slate-700">
                                    {cashRegister.closedAt
                                        ? format(cashRegister.closedAt, "dd/MM/yyyy", { locale: ptBR })
                                        : "—"}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {cashRegister.closedAt
                                        ? format(cashRegister.closedAt, "HH:mm", { locale: ptBR })
                                        : ""}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Responsáveis e Conta */}
                    <section className="space-y-3">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Responsáveis</p>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between py-2.5 px-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-slate-400" />
                                    <span className="text-sm text-slate-500">Aberto por</span>
                                </div>
                                <span className="text-sm font-semibold text-slate-700">
                                    {cashRegister.openedByName || "—"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2.5 px-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-slate-400" />
                                    <span className="text-sm text-slate-500">Fechado por</span>
                                </div>
                                <span className="text-sm font-semibold text-slate-700">
                                    {cashRegister.closedByName || "—"}
                                </span>
                            </div>
                            {cashRegister.bankAccountName && (
                                <div className="flex items-center justify-between py-2.5 px-3 bg-blue-50 rounded-xl border border-blue-100">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-blue-400" />
                                        <span className="text-sm text-blue-500">Conta</span>
                                    </div>
                                    <span className="text-sm font-semibold text-blue-700">
                                        {cashRegister.bankAccountName}
                                    </span>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Movimentações */}
                    <section className="space-y-3">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Movimentações</p>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between py-2.5 px-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-2">
                                    <Banknote className="h-4 w-4 text-slate-400" />
                                    <span className="text-sm text-slate-500">Saldo Inicial</span>
                                </div>
                                <span className="text-sm font-semibold text-slate-700">
                                    {brl(cashRegister.initialBalance)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2.5 px-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                <div className="flex items-center gap-2">
                                    <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
                                    <span className="text-sm text-emerald-600">Suprimentos</span>
                                </div>
                                <span className="text-sm font-semibold text-emerald-700">
                                    + R$ 0,00
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2.5 px-3 bg-red-50 rounded-xl border border-red-100">
                                <div className="flex items-center gap-2">
                                    <ArrowDownCircle className="h-4 w-4 text-red-400" />
                                    <span className="text-sm text-red-500">Sangrias</span>
                                </div>
                                <span className="text-sm font-semibold text-red-600">
                                    - R$ 0,00
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2.5 px-3 bg-violet-50 rounded-xl border border-violet-100">
                                <div className="flex items-center gap-2">
                                    <ShoppingCart className="h-4 w-4 text-violet-400" />
                                    <span className="text-sm text-violet-500">Vendas</span>
                                </div>
                                <span className="text-sm font-semibold text-violet-700">
                                    + R$ 0,00
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* Resultado */}
                    <section className="space-y-3">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resultado</p>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between py-2.5 px-3 bg-slate-50 rounded-xl border border-slate-100">
                                <span className="text-sm text-slate-500">Saldo Esperado</span>
                                <span className="text-sm font-semibold text-slate-700">
                                    {brl(cashRegister.expectedBalance || 0)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2.5 px-3 bg-slate-50 rounded-xl border border-slate-100">
                                <span className="text-sm text-slate-500">Saldo Contado</span>
                                <span className="text-sm font-semibold text-slate-700">
                                    {brl(cashRegister.actualBalance || 0)}
                                </span>
                            </div>
                            <div className={`flex items-center justify-between py-3 px-4 rounded-xl border-2 ${
                                !isDifferent
                                    ? "bg-emerald-50 border-emerald-200"
                                    : isShortage
                                    ? "bg-red-50 border-red-200"
                                    : "bg-yellow-50 border-yellow-200"
                            }`}>
                                <span className="text-sm font-bold">Diferença</span>
                                <span className={`text-base font-bold ${
                                    !isDifferent ? "text-emerald-600"
                                    : isShortage ? "text-red-600"
                                    : "text-yellow-600"
                                }`}>
                                    {difference > 0 ? "+" : ""}{brl(difference)}
                                    {!isDifferent && "  ✓"}
                                    {isSurplus && "  (Sobra)"}
                                    {isShortage && "  (Falta)"}
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* Observações */}
                    {cashRegister.notes && (
                        <section className="space-y-2">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Observações</p>
                            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                                <p className="text-sm text-amber-800">{cashRegister.notes}</p>
                            </div>
                        </section>
                    )}

                </div>
            </SheetContent>
        </Sheet>
    )
}
