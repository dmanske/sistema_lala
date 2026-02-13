'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { createCashMovementAction } from "@/app/(app)/cash/actions"
import { toast } from "sonner"
import { Plus, Minus, Banknote, QrCode, CreditCard, ArrowRightLeft, Wallet } from "lucide-react"
import { AccountSelector } from "@/components/bank-accounts/AccountSelector"
import { cn } from "@/lib/utils"

const schema = z.object({
    amount: z.number().min(0.01, "O valor deve ser positivo"),
    method: z.enum(["CASH", "PIX", "CARD", "TRANSFER", "WALLET"]),
    description: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface NewTransactionDialogProps {
    type: 'IN' | 'OUT'
}

const METHOD_OPTIONS = [
    { id: 'CASH', label: 'Dinheiro', icon: Banknote },
    { id: 'PIX', label: 'Pix', icon: QrCode },
    { id: 'CARD', label: 'Cartão', icon: CreditCard },
    { id: 'WALLET', label: 'Carteira', icon: Wallet },
    { id: 'TRANSFER', label: 'Transf.', icon: ArrowRightLeft },
] as const

export function NewTransactionDialog({ type }: NewTransactionDialogProps) {
    const [open, setOpen] = useState(false)
    const [bankAccountId, setBankAccountId] = useState<string>("")
    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            amount: 0,
            method: "CASH",
            description: "",
        },
    })

    async function onSubmit(values: FormValues) {
        if (!bankAccountId) {
            toast.error("Selecione uma conta bancária")
            return
        }

        const result = await createCashMovementAction({
            ...values,
            type,
            bankAccountId,
        })

        if (result.success) {
            toast.success(type === 'IN' ? "Entrada registrada" : "Saída registrada")
            setOpen(false)
            form.reset()
            setBankAccountId("")
        } else {
            toast.error(result.error || "Erro ao salvar")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant={type === 'IN' ? "default" : "destructive"}
                    className={cn(
                        "shadow-sm transition-all hover:scale-105",
                        type === 'IN' ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-rose-600 hover:bg-rose-700 text-white"
                    )}
                >
                    {type === 'IN' ? <Plus className="mr-2 h-4 w-4" /> : <Minus className="mr-2 h-4 w-4" />}
                    {type === 'IN' ? "Nova Entrada" : "Nova Saída"}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{type === 'IN' ? "Nova Entrada" : "Nova Saída"}</DialogTitle>
                    <DialogDescription>
                        {type === 'IN'
                            ? "Registre uma entrada de valor no caixa."
                            : "Registre uma saída/sangria do caixa."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* Amount Input */}
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-muted-foreground">Valor da Transação</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-lg">R$</span>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                placeholder="0,00"
                                                className="pl-10 text-2xl font-bold h-14"
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Visual Method Selector */}
                        <FormField
                            control={form.control}
                            name="method"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Método de Pagamento</FormLabel>
                                    <FormControl>
                                        <div className="grid grid-cols-5 gap-2">
                                            {METHOD_OPTIONS.map((option) => {
                                                const isSelected = field.value === option.id
                                                return (
                                                    <div
                                                        key={option.id}
                                                        onClick={() => field.onChange(option.id)}
                                                        className={cn(
                                                            "cursor-pointer rounded-lg border p-2 flex flex-col items-center justify-center gap-1.5 transition-all hover:bg-muted/50 hover:border-foreground/20",
                                                            isSelected
                                                                ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/20"
                                                                : "border-border text-muted-foreground"
                                                        )}
                                                    >
                                                        <option.icon className={cn("h-5 w-5", isSelected ? "text-primary" : "text-muted-foreground")} />
                                                        <span className="text-[10px] font-medium">{option.label}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Account Selector */}
                        <FormItem>
                            <FormLabel>Conta Bancária *</FormLabel>
                            <AccountSelector
                                value={bankAccountId}
                                onValueChange={setBankAccountId}
                                placeholder="Selecione a conta de movimentação"
                            />
                            <p className="text-[11px] text-muted-foreground">
                                {type === 'IN' ? 'Onde o valor será creditado.' : 'De onde o valor será debitado.'}
                            </p>
                        </FormItem>

                        {/* Description */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descrição (Opcional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Venda de produtos, pagamento de luz..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-2">
                            <Button type="submit" className="w-full sm:w-auto" size="lg">
                                {type === 'IN' ? 'Registrar Entrada' : 'Registrar Saída'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
