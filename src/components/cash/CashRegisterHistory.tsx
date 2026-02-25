"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { CashRegisterWithUser } from "@/core/domain/entities/CashRegister"
import { CashClosingDetails } from "./CashClosingDetails"

interface CashRegisterHistoryProps {
    cashRegisters: CashRegisterWithUser[]
}

export function CashRegisterHistory({ cashRegisters }: CashRegisterHistoryProps) {
    const [selectedCashRegister, setSelectedCashRegister] = useState<CashRegisterWithUser | null>(null)
    const [detailsOpen, setDetailsOpen] = useState(false)

    const handleViewDetails = (cashRegister: CashRegisterWithUser) => {
        setSelectedCashRegister(cashRegister)
        setDetailsOpen(true)
    }

    if (cashRegisters.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Nenhum fechamento encontrado</p>
                <p className="text-sm text-gray-400 mt-2">
                    Os fechamentos de caixa aparecerão aqui
                </p>
            </div>
        )
    }

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Responsável</TableHead>
                            <TableHead>Conta</TableHead>
                            <TableHead className="text-right">Inicial</TableHead>
                            <TableHead className="text-right">Final</TableHead>
                            <TableHead className="text-right">Diferença</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {cashRegisters.map((cashRegister) => {
                            const difference = cashRegister.difference || 0
                            const isDifferent = Math.abs(difference) >= 0.01

                            return (
                                <TableRow key={cashRegister.id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">
                                                {format(cashRegister.openedAt, "dd/MM/yyyy", { locale: ptBR })}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {format(cashRegister.openedAt, "HH:mm", { locale: ptBR })} - {" "}
                                                {cashRegister.closedAt
                                                    ? format(cashRegister.closedAt, "HH:mm", { locale: ptBR })
                                                    : "Aberto"}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{cashRegister.openedByName || "N/A"}</p>
                                            {cashRegister.closedByName && (
                                                <p className="text-xs text-gray-500">
                                                    Fechado por: {cashRegister.closedByName}
                                                </p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-sm font-medium text-blue-700">
                                            {cashRegister.bankAccountName || "N/A"}
                                        </p>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        R$ {cashRegister.initialBalance.toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {cashRegister.actualBalance !== null && cashRegister.actualBalance !== undefined
                                            ? `R$ ${cashRegister.actualBalance.toFixed(2)}`
                                            : "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {cashRegister.difference !== null ? (
                                            <span className={`font-semibold ${!isDifferent
                                                    ? "text-green-600"
                                                    : difference > 0
                                                        ? "text-yellow-600"
                                                        : "text-red-600"
                                                }`}>
                                                {difference > 0 ? "+" : ""}
                                                R$ {difference.toFixed(2)}
                                            </span>
                                        ) : (
                                            "-"
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {cashRegister.status === "OPEN" ? (
                                            <Badge variant="default" className="bg-green-500">
                                                ABERTO
                                            </Badge>
                                        ) : (
                                            <Badge
                                                variant={isDifferent ? "destructive" : "secondary"}
                                            >
                                                {isDifferent ? "COM DIFERENÇA" : "FECHADO"}
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {cashRegister.status === "CLOSED" && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleViewDetails(cashRegister)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
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
