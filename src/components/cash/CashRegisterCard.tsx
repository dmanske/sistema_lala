"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
    Wallet, 
    TrendingDown, 
    TrendingUp, 
    Calculator,
    Clock,
    User,
    DollarSign
} from "lucide-react"
import { CashRegisterSummary } from "@/core/domain/entities/CashRegister"
import { CashMovementDialog } from "./CashMovementDialog"
import { CashClosingDialog } from "./CashClosingDialog"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface CashRegisterCardProps {
    summary: CashRegisterSummary | null
    onUpdate: () => void
}

export function CashRegisterCard({ summary, onUpdate }: CashRegisterCardProps) {
    const [movementDialogOpen, setMovementDialogOpen] = useState(false)
    const [closingDialogOpen, setClosingDialogOpen] = useState(false)

    if (!summary) {
        return (
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wallet className="h-5 w-5" />
                        Caixa
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">Nenhum caixa aberto</p>
                        <p className="text-sm text-gray-400">
                            Abra um caixa para começar a registrar movimentações
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const currentBalance = 
        summary.cashRegister.initialBalance +
        summary.totalSuprimento -
        summary.totalSangria +
        summary.totalSales

    return (
        <>
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-purple-600" />
                            Caixa Aberto
                        </CardTitle>
                        <Badge variant="default" className="bg-green-500">
                            ABERTO
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Informações do Turno */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <div>
                                <p className="text-xs text-gray-500">Abertura</p>
                                <p className="font-medium">
                                    {format(summary.cashRegister.openedAt, "HH:mm", { locale: ptBR })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <div>
                                <p className="text-xs text-gray-500">Responsável</p>
                                <p className="font-medium truncate">
                                    {summary.cashRegister.openedBy}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Saldo Atual */}
                    <div className="bg-white/50 p-4 rounded-lg border border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Saldo Atual</span>
                            <DollarSign className="h-4 w-4 text-purple-600" />
                        </div>
                        <p className="text-2xl font-bold text-purple-900">
                            R$ {currentBalance.toFixed(2)}
                        </p>
                    </div>

                    {/* Resumo de Movimentações */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-white/50 p-2 rounded border">
                            <p className="text-gray-500 mb-1">Inicial</p>
                            <p className="font-semibold">
                                R$ {summary.cashRegister.initialBalance.toFixed(2)}
                            </p>
                        </div>
                        <div className="bg-green-50 p-2 rounded border border-green-200">
                            <p className="text-green-600 mb-1">Suprimentos</p>
                            <p className="font-semibold text-green-700">
                                + R$ {summary.totalSuprimento.toFixed(2)}
                            </p>
                        </div>
                        <div className="bg-red-50 p-2 rounded border border-red-200">
                            <p className="text-red-600 mb-1">Sangrias</p>
                            <p className="font-semibold text-red-700">
                                - R$ {summary.totalSangria.toFixed(2)}
                            </p>
                        </div>
                    </div>

                    {/* Vendas */}
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-blue-600">Vendas no Turno</p>
                                <p className="text-lg font-bold text-blue-900">
                                    R$ {summary.totalSales.toFixed(2)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-blue-600">Quantidade</p>
                                <p className="text-lg font-bold text-blue-900">
                                    {summary.salesCount}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Ações */}
                    <div className="grid grid-cols-3 gap-2 pt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setMovementDialogOpen(true)}
                            className="flex items-center gap-1"
                        >
                            <TrendingDown className="h-3 w-3" />
                            Sangria
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setMovementDialogOpen(true)}
                            className="flex items-center gap-1"
                        >
                            <TrendingUp className="h-3 w-3" />
                            Suprimento
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => setClosingDialogOpen(true)}
                            className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700"
                        >
                            <Calculator className="h-3 w-3" />
                            Fechar
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <CashMovementDialog
                isOpen={movementDialogOpen}
                onOpenChange={setMovementDialogOpen}
                onSuccess={onUpdate}
                cashRegisterId={summary.cashRegister.id}
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
