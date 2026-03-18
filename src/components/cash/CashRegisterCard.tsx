"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Wallet,
    TrendingDown,
    TrendingUp,
    Calculator,
    Clock,
    User,
    Building2,
    ShoppingCart,
    ArrowUpCircle,
    ArrowDownCircle,
    Banknote,
} from "lucide-react"
import { CashRegisterSummaryWithUser } from "@/core/domain/entities/CashRegister"
import { CashMovementDialog } from "./CashMovementDialog"
import { CashClosingDialog } from "./CashClosingDialog"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface CashRegisterCardProps {
    summary: CashRegisterSummaryWithUser | null
    onUpdate: () => void
}

const brl = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

export function CashRegisterCard({ summary, onUpdate }: CashRegisterCardProps) {
    const [movementDialogOpen, setMovementDialogOpen] = useState(false)
    const [movementType, setMovementType] = useState<'SANGRIA' | 'SUPRIMENTO'>('SANGRIA')
    const [closingDialogOpen, setClosingDialogOpen] = useState(false)

    if (!summary) return null

    const currentBalance =
        summary.cashRegister.initialBalance +
        summary.totalSuprimento -
        summary.totalSangria +
        summary.totalSales

    const openMovement = (type: 'SANGRIA' | 'SUPRIMENTO') => {
        setMovementType(type)
        setMovementDialogOpen(true)
    }

    return (
        <>
            <div className="space-y-4">

                {/* Hero card — saldo atual */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-violet-600 to-purple-700 p-6 shadow-xl shadow-violet-200">
                    {/* Decoração */}
                    <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-white/5" />

                    <div className="relative">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center">
                                    <Wallet className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-white/80 text-sm font-medium">Caixa Aberto</span>
                            </div>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-400/30">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                ATIVO
                            </span>
                        </div>

                        <div className="mb-6">
                            <p className="text-white/60 text-xs mb-1">Saldo Atual</p>
                            <p className="text-white text-4xl font-bold tracking-tight">{brl(currentBalance)}</p>
                        </div>

                        <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-white/50" />
                                <span className="text-white/70">
                                    {format(summary.cashRegister.openedAt, "HH:mm", { locale: ptBR })}
                                </span>
                            </div>
                            {summary.cashRegister.openedByName && (
                                <div className="flex items-center gap-1.5">
                                    <User className="h-3.5 w-3.5 text-white/50" />
                                    <span className="text-white/70">{summary.cashRegister.openedByName}</span>
                                </div>
                            )}
                            {summary.cashRegister.bankAccountName && (
                                <div className="flex items-center gap-1.5">
                                    <Building2 className="h-3.5 w-3.5 text-white/50" />
                                    <span className="text-white/70">{summary.cashRegister.bankAccountName}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Métricas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center">
                                <Banknote className="h-3.5 w-3.5 text-slate-500" />
                            </div>
                            <span className="text-xs text-slate-400 font-medium">Inicial</span>
                        </div>
                        <p className="text-base font-bold text-slate-700">{brl(summary.cashRegister.initialBalance)}</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-7 w-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                                <ArrowUpCircle className="h-3.5 w-3.5 text-emerald-500" />
                            </div>
                            <span className="text-xs text-emerald-500 font-medium">Suprimentos</span>
                        </div>
                        <p className="text-base font-bold text-emerald-700">+ {brl(summary.totalSuprimento)}</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-7 w-7 rounded-lg bg-red-50 flex items-center justify-center">
                                <ArrowDownCircle className="h-3.5 w-3.5 text-red-400" />
                            </div>
                            <span className="text-xs text-red-400 font-medium">Sangrias</span>
                        </div>
                        <p className="text-base font-bold text-red-600">- {brl(summary.totalSangria)}</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-7 w-7 rounded-lg bg-violet-50 flex items-center justify-center">
                                <ShoppingCart className="h-3.5 w-3.5 text-violet-500" />
                            </div>
                            <span className="text-xs text-violet-500 font-medium">Vendas</span>
                        </div>
                        <p className="text-base font-bold text-violet-700">{brl(summary.totalSales)}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{summary.salesCount} venda{summary.salesCount !== 1 ? "s" : ""}</p>
                    </div>
                </div>

                {/* Ações */}
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => openMovement('SANGRIA')}
                        className="flex-1 rounded-xl h-11 border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <TrendingDown className="mr-2 h-4 w-4" />
                        Sangria
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => openMovement('SUPRIMENTO')}
                        className="flex-1 rounded-xl h-11 border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                    >
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Suprimento
                    </Button>
                    <Button
                        onClick={() => setClosingDialogOpen(true)}
                        className="flex-1 rounded-xl h-11 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-100"
                    >
                        <Calculator className="mr-2 h-4 w-4" />
                        Fechar Caixa
                    </Button>
                </div>
            </div>

            <CashMovementDialog
                isOpen={movementDialogOpen}
                onOpenChange={setMovementDialogOpen}
                onSuccess={onUpdate}
                cashRegisterId={summary.cashRegister.id}
                defaultType={movementType}
            />

            <CashClosingDialog
                isOpen={closingDialogOpen}
                onOpenChange={setClosingDialogOpen}
                onSuccess={onUpdate}
                cashRegisterSummary={summary}
            />
        </>
    )
}
