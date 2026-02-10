
"use client"

import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { PaymentMethod } from "@/core/domain/sales/types"
import { CreditCard, Banknote, QrCode, ArrowRightLeft, Wallet, Check, Plus, X, CheckCircle2, HandCoins, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaymentEntry {
    id: string
    method: PaymentMethod
    amount: number
    cashGiven?: number // Only for cash: how much the customer handed over
}

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; icon: React.ReactNode; color: string }[] = [
    { value: "pix", label: "Pix", icon: <QrCode className="h-5 w-5" />, color: "from-emerald-500 to-teal-600" },
    { value: "card", label: "Cartão", icon: <CreditCard className="h-5 w-5" />, color: "from-blue-500 to-indigo-600" },
    { value: "cash", label: "Dinheiro", icon: <Banknote className="h-5 w-5" />, color: "from-amber-500 to-orange-600" },
    { value: "transfer", label: "Transferência", icon: <ArrowRightLeft className="h-5 w-5" />, color: "from-violet-500 to-purple-600" },
]

const ALL_METHOD_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    pix: { label: "Pix", icon: <QrCode className="h-4 w-4" />, color: "from-emerald-500 to-teal-600" },
    card: { label: "Cartão", icon: <CreditCard className="h-4 w-4" />, color: "from-blue-500 to-indigo-600" },
    cash: { label: "Dinheiro", icon: <Banknote className="h-4 w-4" />, color: "from-amber-500 to-orange-600" },
    transfer: { label: "Transferência", icon: <ArrowRightLeft className="h-4 w-4" />, color: "from-violet-500 to-purple-600" },
    credit: { label: "Crédito", icon: <Wallet className="h-4 w-4" />, color: "from-green-500 to-emerald-600" },
    fiado: { label: "Fiado", icon: <HandCoins className="h-4 w-4" />, color: "from-rose-500 to-red-600" },
}

const getMethodLabel = (method: PaymentMethod) => ALL_METHOD_META[method]?.label ?? method
const getMethodIcon = (method: PaymentMethod) => ALL_METHOD_META[method]?.icon ?? null
const getMethodColor = (method: PaymentMethod) => ALL_METHOD_META[method]?.color ?? "from-slate-400 to-slate-500"

interface PaymentDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    totalRemaining: number
    onConfirm: (payments: { method: PaymentMethod; amount: number }[]) => void
    creditBalance?: number
    customerName?: string
    hasCustomer?: boolean
}

export function PaymentDialog({ open, onOpenChange, totalRemaining, onConfirm, creditBalance = 0, customerName, hasCustomer = false }: PaymentDialogProps) {
    const [method, setMethod] = useState<PaymentMethod>('pix')
    const [amount, setAmount] = useState(0)
    const [cashGiven, setCashGiven] = useState(0) // For cash: actual amount handed
    const [entries, setEntries] = useState<PaymentEntry[]>([])

    const entriesTotal = useMemo(() => entries.reduce((acc, e) => acc + e.amount, 0), [entries])
    const remaining = useMemo(() => Math.max(0, totalRemaining - entriesTotal), [totalRemaining, entriesTotal])
    const isFullyPaid = remaining < 0.01
    const usedCredit = useMemo(() => entries.filter(e => e.method === 'credit').reduce((acc, e) => acc + e.amount, 0), [entries])
    const availableCredit = Math.max(0, creditBalance - usedCredit)

    // Cash change calculation
    const cashChange = method === 'cash' && cashGiven > amount ? cashGiven - amount : 0

    // Reset state when dialog opens
    useEffect(() => {
        if (open) {
            setEntries([])
            setMethod('pix')
            setAmount(totalRemaining)
            setCashGiven(0)
        }
    }, [open, totalRemaining])

    // Update amount when method changes or remaining changes
    useEffect(() => {
        if (method === 'credit') {
            setAmount(Math.min(availableCredit, remaining))
        } else if (method === 'fiado') {
            setAmount(remaining)
        } else {
            setAmount(remaining)
        }
        setCashGiven(0)
    }, [method, remaining, availableCredit])

    const handleAddEntry = () => {
        if (amount <= 0) {
            toast.error("Valor inválido")
            return
        }
        if (amount > remaining + 0.01) {
            toast.error("Valor excede o restante")
            return
        }
        if (method === 'credit' && amount > availableCredit + 0.01) {
            toast.error("Saldo de crédito insuficiente")
            return
        }
        if (method === 'fiado' && !hasCustomer) {
            toast.error("Fiado requer um cliente vinculado à venda")
            return
        }

        const entry: PaymentEntry = {
            id: crypto.randomUUID(),
            method,
            amount: Math.round(amount * 100) / 100,
            cashGiven: method === 'cash' && cashGiven > amount ? cashGiven : undefined,
        }
        setEntries(prev => [...prev, entry])
        setMethod('pix')
        setCashGiven(0)
    }

    const handleRemoveEntry = (id: string) => {
        setEntries(prev => prev.filter(e => e.id !== id))
    }

    const handleFinalize = () => {
        if (!isFullyPaid) {
            toast.error("Adicione pagamentos até cobrir o valor total")
            return
        }
        onConfirm(entries.map(e => ({ method: e.method, amount: e.amount })))
        onOpenChange(false)
    }

    const hasCredit = creditBalance > 0

    // Total change to give back (sum of all cash entries with change)
    const totalChange = entries.reduce((acc, e) => {
        if (e.cashGiven && e.cashGiven > e.amount) return acc + (e.cashGiven - e.amount)
        return acc
    }, 0) + cashChange

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[520px] bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-0 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-white">Receber Pagamento</DialogTitle>
                        <DialogDescription className="text-purple-100 mt-1">
                            Total: <span className="font-bold text-white">R$ {totalRemaining.toFixed(2)}</span>
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">

                    {/* Added Payments List */}
                    {entries.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pagamentos Adicionados</Label>
                            <div className="space-y-1.5">
                                {entries.map((entry) => (
                                    <div key={entry.id} className={cn(
                                        "flex items-center gap-3 p-2.5 border rounded-xl animate-in fade-in slide-in-from-top-2 duration-200",
                                        entry.method === 'fiado' ? "bg-rose-50 border-rose-200" : "bg-green-50 border-green-200"
                                    )}>
                                        <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center text-white bg-gradient-to-br", getMethodColor(entry.method))}>
                                            {getMethodIcon(entry.method)}
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-sm font-medium text-slate-700">{getMethodLabel(entry.method)}</span>
                                            {entry.cashGiven && entry.cashGiven > entry.amount && (
                                                <span className="text-xs text-amber-600 ml-2">
                                                    (recebido R$ {entry.cashGiven.toFixed(2)})
                                                </span>
                                            )}
                                        </div>
                                        <span className={cn(
                                            "text-sm font-bold",
                                            entry.method === 'fiado' ? "text-rose-700" : "text-green-700"
                                        )}>
                                            R$ {entry.amount.toFixed(2)}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveEntry(entry.id)}
                                            className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-red-100 text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Progress bar */}
                            <div className="space-y-1">
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-500",
                                            isFullyPaid ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-gradient-to-r from-purple-500 to-indigo-500"
                                        )}
                                        style={{ width: `${Math.min(100, (entriesTotal / totalRemaining) * 100)}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>Pago: R$ {entriesTotal.toFixed(2)}</span>
                                    {!isFullyPaid && <span className="text-amber-600 font-medium">Falta: R$ {remaining.toFixed(2)}</span>}
                                    {isFullyPaid && <span className="text-green-600 font-medium flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Completo!</span>}
                                </div>
                            </div>

                            {/* Total change to give */}
                            {totalChange > 0 && (
                                <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                                    <Banknote className="h-5 w-5 text-amber-600" />
                                    <span className="text-sm font-semibold text-amber-800">
                                        Troco: R$ {totalChange.toFixed(2)}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Add new payment - only show if not fully paid */}
                    {!isFullyPaid && (
                        <>
                            {/* Payment Method Selection */}
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold text-slate-700">
                                    {entries.length > 0 ? "Adicionar outro pagamento" : "Forma de Pagamento"}
                                </Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {PAYMENT_OPTIONS.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setMethod(option.value)}
                                            className={cn(
                                                "flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 text-left",
                                                method === option.value
                                                    ? "border-purple-500 bg-purple-50 shadow-md shadow-purple-500/10"
                                                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                            )}
                                        >
                                            <div className={cn(
                                                "h-9 w-9 rounded-lg flex items-center justify-center text-white bg-gradient-to-br",
                                                method === option.value ? option.color : "from-slate-300 to-slate-400"
                                            )}>
                                                {option.icon}
                                            </div>
                                            <span className={cn(
                                                "font-medium text-sm",
                                                method === option.value ? "text-purple-700" : "text-slate-600"
                                            )}>
                                                {option.label}
                                            </span>
                                            {method === option.value && (
                                                <Check className="h-4 w-4 text-purple-600 ml-auto" />
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* Credit Option */}
                                {hasCredit && availableCredit > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setMethod('credit')}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 w-full text-left",
                                            method === 'credit'
                                                ? "border-green-500 bg-green-50 shadow-md shadow-green-500/10"
                                                : "border-dashed border-green-300 hover:border-green-400 hover:bg-green-50/50"
                                        )}
                                    >
                                        <div className={cn(
                                            "h-9 w-9 rounded-lg flex items-center justify-center text-white bg-gradient-to-br",
                                            method === 'credit' ? "from-green-500 to-emerald-600" : "from-green-300 to-emerald-400"
                                        )}>
                                            <Wallet className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <span className={cn(
                                                "font-medium text-sm block",
                                                method === 'credit' ? "text-green-700" : "text-green-600"
                                            )}>
                                                Crédito do Cliente
                                            </span>
                                            <span className="text-xs text-green-500">
                                                Saldo: R$ {availableCredit.toFixed(2)}
                                                {customerName && ` • ${customerName}`}
                                            </span>
                                        </div>
                                        {method === 'credit' && (
                                            <Check className="h-4 w-4 text-green-600 ml-auto" />
                                        )}
                                    </button>
                                )}

                                {/* Fiado Option - only if customer is linked */}
                                {hasCustomer && (
                                    <button
                                        type="button"
                                        onClick={() => setMethod('fiado')}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 w-full text-left",
                                            method === 'fiado'
                                                ? "border-rose-500 bg-rose-50 shadow-md shadow-rose-500/10"
                                                : "border-dashed border-rose-300 hover:border-rose-400 hover:bg-rose-50/50"
                                        )}
                                    >
                                        <div className={cn(
                                            "h-9 w-9 rounded-lg flex items-center justify-center text-white bg-gradient-to-br",
                                            method === 'fiado' ? "from-rose-500 to-red-600" : "from-rose-300 to-red-400"
                                        )}>
                                            <HandCoins className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <span className={cn(
                                                "font-medium text-sm block",
                                                method === 'fiado' ? "text-rose-700" : "text-rose-600"
                                            )}>
                                                Fiado (Dívida)
                                            </span>
                                            <span className="text-xs text-rose-400">
                                                Fica como débito na carteira do cliente
                                                {customerName && ` • ${customerName}`}
                                            </span>
                                        </div>
                                        {method === 'fiado' && (
                                            <Check className="h-4 w-4 text-rose-600 ml-auto" />
                                        )}
                                    </button>
                                )}
                            </div>

                            {/* Amount */}
                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-slate-700">
                                        {method === 'cash' ? 'Valor a cobrar (R$)' : 'Valor (R$)'}
                                    </Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={amount}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            const limit = method === 'credit' ? Math.min(remaining, availableCredit) : remaining;
                                            setAmount(Math.min(val, limit));
                                        }}
                                        className="h-12 text-lg font-bold text-center bg-white border-slate-200 rounded-xl"
                                        max={method === 'credit' ? Math.min(remaining, availableCredit) : remaining}
                                    />
                                </div>

                                {/* Cash: "Valor recebido" field for change calculation */}
                                {method === 'cash' && (
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-slate-700">Valor recebido do cliente (R$)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={cashGiven || ''}
                                            onChange={(e) => setCashGiven(Number(e.target.value))}
                                            placeholder={amount.toFixed(2)}
                                            className="h-12 text-lg font-bold text-center bg-white border-slate-200 rounded-xl"
                                        />
                                        {cashGiven > amount && (
                                            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                                                <Banknote className="h-5 w-5 text-amber-600 shrink-0" />
                                                <span className="text-sm font-bold text-amber-800">
                                                    Troco: R$ {(cashGiven - amount).toFixed(2)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Fiado warning */}
                                {method === 'fiado' && (
                                    <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                                        <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                                        <p className="text-xs text-rose-700">
                                            O valor ficará como <strong>dívida</strong> na carteira do cliente.
                                            O saldo será negativo até que o cliente pague.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Add Payment Button */}
                            <Button
                                type="button"
                                onClick={handleAddEntry}
                                variant="outline"
                                className="w-full rounded-xl border-dashed border-2 border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400 h-11"
                                disabled={amount <= 0}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Adicionar Pagamento — R$ {amount.toFixed(2)}
                            </Button>
                        </>
                    )}

                    {/* Fully paid celebration */}
                    {isFullyPaid && entries.length > 0 && (
                        <div className="text-center py-4">
                            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-3">
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                            </div>
                            <p className="text-green-700 font-semibold">Valor total coberto!</p>
                            <p className="text-sm text-slate-500 mt-1">Clique em &quot;Finalizar&quot; para confirmar o pagamento.</p>

                            {/* Show total change if any */}
                            {totalChange > 0 && (
                                <div className="flex items-center justify-center gap-2 mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                                    <Banknote className="h-5 w-5 text-amber-600" />
                                    <span className="text-base font-bold text-amber-800">
                                        Troco total: R$ {totalChange.toFixed(2)}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                    <div className="flex items-center justify-between gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="rounded-xl"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleFinalize}
                            disabled={!isFullyPaid}
                            className={cn(
                                "rounded-xl shadow-lg px-8 transition-all",
                                isFullyPaid
                                    ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-green-500/20"
                                    : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                            )}
                        >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Finalizar Pagamento
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
