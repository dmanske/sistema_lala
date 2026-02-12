'use client'

import { CashMovement } from '@/core/domain/CashMovement'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from 'react'
import { SupabaseBankAccountRepository } from '@/infrastructure/repositories/supabase/SupabaseBankAccountRepository'

import { ArrowUpCircle, ArrowDownCircle, ShoppingBag, RotateCcw, Truck, Settings } from 'lucide-react'

const SOURCE_ICONS: Record<string, React.ReactNode> = {
    SALE: <ShoppingBag className="h-3.5 w-3.5 text-emerald-500" />,
    REFUND: <RotateCcw className="h-3.5 w-3.5 text-rose-500" />,
    PURCHASE: <Truck className="h-3.5 w-3.5 text-rose-500" />,
    MANUAL: <Settings className="h-3.5 w-3.5 text-slate-500" />,
}

const SOURCE_LABELS: Record<string, string> = {
    SALE: 'Venda',
    REFUND: 'Estorno',
    PURCHASE: 'Compra',
    MANUAL: 'Manual',
}

interface CashListProps {
    movements: CashMovement[]
}

export function CashList({ movements }: CashListProps) {
    const [accountNames, setAccountNames] = useState<Record<string, string>>({})

    useEffect(() => {
        async function loadAccountNames() {
            const repo = new SupabaseBankAccountRepository()
            const accounts = await repo.list()
            const names: Record<string, string> = {}
            accounts.forEach(account => {
                names[account.id] = account.name
            })
            setAccountNames(names)
        }
        loadAccountNames()
    }, [])

    return (
        <div className="rounded-xl border border-white/20 bg-white/40 backdrop-blur-sm overflow-hidden shadow-sm">
            <Table>
                <TableHeader className="bg-slate-50/50">
                    <TableRow>
                        <TableHead className="font-semibold">Data</TableHead>
                        <TableHead className="font-semibold">Descrição</TableHead>
                        <TableHead className="font-semibold">Método</TableHead>
                        <TableHead className="font-semibold">Origem</TableHead>
                        <TableHead className="font-semibold">Conta</TableHead>
                        <TableHead className="text-right font-semibold">Valor</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {movements.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                Nenhuma movimentação no período.
                            </TableCell>
                        </TableRow>
                    ) : (
                        movements.map((movement) => (
                            <TableRow key={movement.id} className="hover:bg-white/60 transition-colors">
                                <TableCell className="whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">
                                            {format(new Date(movement.occurredAt), "dd/MM/yyyy", { locale: ptBR })}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">
                                            {format(new Date(movement.occurredAt), "HH:mm", { locale: ptBR })}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-slate-700">{movement.description || "-"}</span>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="font-normal capitalize bg-white/50">
                                        {movement.method.toLowerCase()}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {SOURCE_ICONS[movement.sourceType] || <Settings className="h-3.5 w-3.5" />}
                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-tight">
                                            {SOURCE_LABELS[movement.sourceType] || movement.sourceType}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-xs text-slate-600">
                                        {accountNames[movement.bankAccountId] || 'Carregando...'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex flex-col items-end">
                                        <div className={`flex items-center gap-1 font-bold ${movement.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {movement.type === 'IN' ? <ArrowUpCircle className="h-3 w-3" /> : <ArrowDownCircle className="h-3 w-3" />}
                                            {formatCurrency(movement.amount)}
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
