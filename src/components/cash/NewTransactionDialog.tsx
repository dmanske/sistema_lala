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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createCashMovementAction } from "@/app/(app)/cash/actions"
import { toast } from "sonner"
import { Plus, Minus } from "lucide-react"

const schema = z.object({
    amount: z.coerce.number().min(0.01, "O valor deve ser positivo"),
    method: z.enum(["CASH", "PIX", "CARD", "TRANSFER", "WALLET"]),
    description: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface NewTransactionDialogProps {
    type: 'IN' | 'OUT'
}

export function NewTransactionDialog({ type }: NewTransactionDialogProps) {
    const [open, setOpen] = useState(false)
    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            amount: 0,
            method: "CASH",
            description: "",
        },
    })

    async function onSubmit(values: FormValues) {
        const result = await createCashMovementAction({
            ...values,
            type,
        })

        if (result.success) {
            toast.success(type === 'IN' ? "Entrada registrada" : "Saída registrada")
            setOpen(false)
            form.reset()
        } else {
            toast.error(result.error || "Erro ao salvar")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant={type === 'IN' ? "default" : "destructive"}
                    className="shadow-sm"
                >
                    {type === 'IN' ? <Plus className="mr-2 h-4 w-4" /> : <Minus className="mr-2 h-4 w-4" />}
                    {type === 'IN' ? "Nova Entrada" : "Nova Saída"}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{type === 'IN' ? "Nova Entrada" : "Nova Saída"}</DialogTitle>
                    <DialogDescription>
                        {type === 'IN'
                            ? "Registre uma entrada de valor no caixa."
                            : "Registre uma saída/sangria do caixa."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Valor (R$)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="0.00"
                                            {...field}
                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="method"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Método</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o método" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="CASH">Dinheiro</SelectItem>
                                            <SelectItem value="PIX">Pix</SelectItem>
                                            <SelectItem value="CARD">Cartão</SelectItem>
                                            <SelectItem value="TRANSFER">Transferência</SelectItem>
                                            <SelectItem value="WALLET">Carteira</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descrição</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Ajuste de caixa..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit">Salvar</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
