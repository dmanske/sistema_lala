"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, CheckCircle2, AlertTriangle, Clock, User, Building2, History } from "lucide-react"
import { CashRegisterWithUser } from "@/core/domain/entities/CashRegister"
import { CashClosingDetails } from "./CashClosingDetails"

interface CashRegisterHistoryProps {
    cashRegisters: CashRegisterWithUser[]
}

const brl = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

export function CashRegisterHistory({ cashRegisters }: CashRegisterHistoryProps) {
    const [selectedCashRegister, setSelectedCashRegister] = useState<CashRegisterWithUser | null>(null)
    const [detailsOpen, setDetailsOpen] = useState(false)

    const handleViewDetails = (cashRegister: CashRegisterWithUser) => {
        setSelectedCashRegister(cashRegister)
        setDetailsOpen(true)
    }

    if (cashRegisters.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-5">
                    <History className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-1">Nenhum fechamento ainda</h3>
                <p className="text-sm text-slate-400 max-w-xs">
                    Os fechamentos de caixa realizados aparecerão aqui
                </p>
            </div>
        )
    }

    return (
        <>
            <div className="space-y-3">
                {cashRegisters.map((cashRegister) => {
                    const difference = cashRegister.difference || 0
                    const isDifferent = Math.abs(difference) >= 0.01
                    const isShortage = difference < -0.01
                    const isSurplus = difference > 0.01

                    const statusColor = isDifferent
                        ? isShortage
                            ? "border-red-100 bg-red-50/30"
                            : "border-yellow-100 bg-yellow-50/30"
                        : "border-emerald-100 bg-emerald-50/10"

                    return (
                        <div
                            key={cashRegister.id}
                            className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-shadow ${statusColor}`}
                        >
                            <div className="p-4 flex items-center gap-4">

                                {/* Ícone de status */}
                                <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                                    isDifferent
                                        ? isShortage ? "bg-red-100" : "bg-yellow-100"
                                        : "bg-emerald-100"
                                }`}>
                                    {isDifferent ? (
                                        <AlertTriangle className={`h-5 w-5 ${isShortage ? "text-red-500" : "text-yellow-500"}`} />
                                    ) : (
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                    )}
                                </div>

                                {/* Data */}
                                <div className="shrink-0 w-28">
                                    <p className="text-sm font-semibold text-slate-700">
                                        {format(cashRegister.openedAt, "dd/MM/yyyy", { locale: ptBR })}
                                    </p>
                                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                                        <Clock className="h-3 w-3" />
                                        {format(cashRegister.openedAt, "HH:mm", { locale: ptBR })}
                                        {cashRegister.closedAt && (
                                            <> — {format(cashRegister.closedAt, "HH:mm", { locale: ptBR })}</>
                                        )}
                                    </div>
                                </div>

                                {/* Responsável e conta */}
                                <div className="flex-1 min-w-0 hidden sm:block">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
                                        <User className="h-3 w-3" />
                                        <span className="truncate">{cashRegister.openedByName || "—"}</span>
                                    </div>
                                    {cashRegister.bankAccountName && (
                                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                            <Building2 className="h-3 w-3" />
                                            <span className="truncate">{cashRegister.bankAccountName}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Valores */}
                                <div className="flex items-center gap-6 shrink-0">
                                    <div className="text-right hidden md:block">
                                        <p className="text-xs text-slate-400">Inicial</p>
                                        <p className="text-sm font-medium text-slate-600">
                                            {brl(cashRegister.initialBalance)}
                                        </p>
                                    </div>
                                    <div className="text-right hidden md:block">
                                        <p className="text-xs text-slate-400">Final</p>
                                        <p className="text-sm font-medium text-slate-600">
                                            {cashRegister.actualBalance != null
                                                ? brl(cashRegister.actualBalance)
                                                : "—"}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-400">Diferença</p>
                                        <p className={`text-sm font-bold ${
                                            !isDifferent ? "text-emerald-600"
                                            : isShortage ? "text-red-600"
                                            : "text-yellow-600"
                                        }`}>
                                            {difference > 0 ? "+" : ""}{brl(difference)}
                                        </p>
                                    </div>
                                </div>

                                {/* Badge status */}
                                <div className="shrink-0 hidden sm:block">
                                    {isDifferent ? (
                                        <Badge variant="outline" className={`text-xs ${
                                            isShortage
                                                ? "border-red-200 text-red-600 bg-red-50"
                                                : "border-yellow-200 text-yellow-600 bg-yellow-50"
                                        }`}>
                                            {isShortage ? "Falta" : "Sobra"}
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-600 bg-emerald-50">
                                            OK
                                        </Badge>
                                    )}
                                </div>

                                {/* Ação */}
                                {cashRegister.status === "CLOSED" && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleViewDetails(cashRegister)}
                                        className="shrink-0 h-8 w-8 rounded-lg p-0 hover:bg-slate-100"
                                    >
                                        <Eye className="h-4 w-4 text-slate-400" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {selectedCashRegister && (
                <CashClosingDetails
                    isOpen={detailsOpen}
                    onOpenChange={setDetailsOpen}
                    cashRegister={selectedCashRegister}
                />
            )}
        </>
    )
}
