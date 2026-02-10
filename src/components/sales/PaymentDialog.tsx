
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { PaymentMethod } from "@/core/domain/sales/types"
import { CreditCard, Banknote, QrCode, ArrowRightLeft, Wallet, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; icon: React.ReactNode; color: string }[] = [
    { value: "pix", label: "Pix", icon: <QrCode className="h-5 w-5" />, color: "from-emerald-500 to-teal-600" },
    { value: "card", label: "Cartão", icon: <CreditCard className="h-5 w-5" />, color: "from-blue-500 to-indigo-600" },
    { value: "cash", label: "Dinheiro", icon: <Banknote className="h-5 w-5" />, color: "from-amber-500 to-orange-600" },
    { value: "transfer", label: "Transferência", icon: <ArrowRightLeft className="h-5 w-5" />, color: "from-violet-500 to-purple-600" },
]

interface PaymentDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    totalRemaining: number
    onConfirm: (method: PaymentMethod, amount: number) => void
    creditBalance?: number
    customerName?: string
}

export function PaymentDialog({ open, onOpenChange, totalRemaining, onConfirm, creditBalance = 0, customerName }: PaymentDialogProps) {
    const [method, setMethod] = useState<PaymentMethod>('pix')
    const [amount, setAmount] = useState(totalRemaining)

    useEffect(() => {
        if (open) {
            setAmount(totalRemaining)
            setMethod('pix')
        }
    }, [open, totalRemaining])

    // When credit is selected, cap the amount to the available balance
    useEffect(() => {
        if (method === 'credit') {
            const maxCredit = Math.min(creditBalance, totalRemaining)
            setAmount(maxCredit)
        } else {
            setAmount(totalRemaining)
        }
    }, [method, creditBalance, totalRemaining])

    const handleSubmit = () => {
        if (amount <= 0) {
            toast.error("Valor inválido")
            return
        }
        if (method === 'credit' && amount > creditBalance) {
            toast.error("Saldo de crédito insuficiente")
            return
        }
        onConfirm(method, amount)
        onOpenChange(false)
    }

    const hasCredit = creditBalance > 0

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px] bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-0 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-white">Receber Pagamento</DialogTitle>
                        <DialogDescription className="text-purple-100 mt-1">
                            Valor restante: <span className="font-bold text-white">R$ {totalRemaining.toFixed(2)}</span>
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="px-6 py-5 space-y-5">
                    {/* Payment Method Selection */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-slate-700">Forma de Pagamento</Label>
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

                        {/* Credit Option - only if customer has credit */}
                        {hasCredit && (
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
                                        Saldo: R$ {creditBalance.toFixed(2)}
                                        {customerName && ` • ${customerName}`}
                                    </span>
                                </div>
                                {method === 'credit' && (
                                    <Check className="h-4 w-4 text-green-600 ml-auto" />
                                )}
                            </button>
                        )}
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Valor (R$)</Label>
                        <Input
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                const limit = method === 'credit' ? Math.min(totalRemaining, creditBalance) : totalRemaining;
                                setAmount(Math.min(val, limit));
                            }}
                            className="h-12 text-lg font-bold text-center bg-white border-slate-200 rounded-xl"
                            max={method === 'credit' ? Math.min(totalRemaining, creditBalance) : totalRemaining}
                        />
                        {amount < totalRemaining && (
                            <p className="text-xs text-amber-600 flex items-center gap-1 mt-2">
                                💡 Restante: R$ {(totalRemaining - amount).toFixed(2)}
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="rounded-xl"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-purple-500/20 px-6"
                        >
                            Confirmar Pagamento
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    )
}
