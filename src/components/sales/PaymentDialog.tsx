
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { PaymentMethod } from "@/core/domain/sales/types"

interface PaymentDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    totalRemaining: number
    onConfirm: (method: PaymentMethod, amount: number) => void
}

export function PaymentDialog({ open, onOpenChange, totalRemaining, onConfirm }: PaymentDialogProps) {
    const [method, setMethod] = useState<PaymentMethod>('pix')
    const [amount, setAmount] = useState(totalRemaining)

    useEffect(() => {
        if (open) {
            setAmount(totalRemaining)
        }
    }, [open, totalRemaining])

    const handleSubmit = () => {
        if (amount <= 0) {
            toast.error("Valor inválido")
            return
        }
        onConfirm(method, amount)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Receber Pagamento</DialogTitle>
                    <DialogDescription className="text-slate-500">
                        Selecione o método e confirme o valor.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-2">
                        <Label>Forma de Pagamento</Label>
                        <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pix">Pix</SelectItem>
                                <SelectItem value="card">Cartão</SelectItem>
                                <SelectItem value="cash">Dinheiro</SelectItem>
                                <SelectItem value="transfer">Transferência</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>Valor (R$)</Label>
                        <Input
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit}>Confirmar Pagamento</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
