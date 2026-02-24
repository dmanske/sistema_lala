"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CashRegisterWithUser } from "@/core/domain/entities/CashRegister"
import { 
    Clock, 
    User, 
    DollarSign, 
    TrendingUp, 
    TrendingDown,
    AlertCircle,
    CheckCircle
} from "lucide-react"

interface CashClosingDetailsProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    cashRegister: CashRegisterWithUser
}

export function CashClosingDetails({
    isOpen,
    onOpenChange,
    cashRegister,
}: CashClosingDetailsProps) {
    const difference = cashRegister.difference || 0
    const isDifferent = Math.abs(difference) >= 0.01

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[540px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Detalhes do Fechamento</SheetTitle>
                    <SheetDescription>
                        Informações completas do turno de caixa
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6 mt-6">
                    {/* Status Badge */}
                    <div className="flex justify-center">
                        {isDifferent ? (
                            <Badge variant="destructive" className="text-base px-4 py-2">
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Fechamento com Diferença
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="text-base px-4 py-2 bg-green-100 text-green-800">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Fechamento OK
                            </Badge>
                        )}
                    </div>

                    {/* Informações do Turno */}
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <h3 className="font-semibold text-sm text-gray-700">Informações do Turno</h3>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-start gap-2">
                                <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500">Abertura</p>
                                    <p className="font-medium">
                                        {format(cashRegister.openedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500">Fechamento</p>
                                    <p className="font-medium">
                                        {cashRegister.closedAt 
                                            ? format(cashRegister.closedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                                            : "N/A"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <User className="h-4 w-4 text-gray-500 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500">Aberto por</p>
                                    <p className="font-medium">{cashRegister.openedByName || "N/A"}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <User className="h-4 w-4 text-gray-500 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500">Fechado por</p>
                                    <p className="font-medium">{cashRegister.closedByName || "N/A"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Valores */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-sm text-gray-700">Valores</h3>
                        
                        <div className="space-y-2">
                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm">Saldo Inicial</span>
                                </div>
                                <span className="font-semibold">
                                    R$ {cashRegister.initialBalance.toFixed(2)}
                                </span>
                            </div>

                            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                    <span className="text-sm">Suprimentos</span>
                                </div>
                                <span className="font-semibold text-green-600">
                                    + R$ 0.00
                                </span>
                            </div>

                            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <TrendingDown className="h-4 w-4 text-red-600" />
                                    <span className="text-sm">Sangrias</span>
                                </div>
                                <span className="font-semibold text-red-600">
                                    - R$ 0.00
                                </span>
                            </div>

                            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-purple-600" />
                                    <span className="text-sm">Vendas</span>
                                </div>
                                <span className="font-semibold text-purple-600">
                                    + R$ 0.00
                                </span>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Resultado */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-sm text-gray-700">Resultado do Fechamento</h3>
                        
                        <div className="space-y-2">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium">Saldo Esperado</span>
                                <span className="font-semibold">
                                    R$ {(cashRegister.expectedBalance || 0).toFixed(2)}
                                </span>
                            </div>

                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium">Saldo Contado</span>
                                <span className="font-semibold">
                                    R$ {(cashRegister.actualBalance || 0).toFixed(2)}
                                </span>
                            </div>

                            <div className={`flex justify-between items-center p-4 rounded-lg border-2 ${
                                !isDifferent 
                                    ? "bg-green-50 border-green-200" 
                                    : difference > 0 
                                    ? "bg-yellow-50 border-yellow-200" 
                                    : "bg-red-50 border-red-200"
                            }`}>
                                <span className="text-sm font-semibold">Diferença</span>
                                <span className={`text-lg font-bold ${
                                    !isDifferent 
                                        ? "text-green-600" 
                                        : difference > 0 
                                        ? "text-yellow-600" 
                                        : "text-red-600"
                                }`}>
                                    {difference > 0 ? "+" : ""}
                                    R$ {difference.toFixed(2)}
                                    {!isDifferent && " ✓"}
                                    {difference > 0 && isDifferent && " (Sobra)"}
                                    {difference < 0 && " (Falta)"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Observações */}
                    {cashRegister.notes && (
                        <>
                            <Separator />
                            <div className="space-y-2">
                                <h3 className="font-semibold text-sm text-gray-700">Observações</h3>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600">{cashRegister.notes}</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
