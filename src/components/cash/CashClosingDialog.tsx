"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, Calculator, AlertCircle } from "lucide-react"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/AuthProvider"
import { FecharCaixa } from "@/core/usecases/cash-register/FecharCaixa"
import { createClient } from "@/lib/supabase/client"
import { CashRegisterSummary } from "@/core/domain/entities/CashRegister"

const FormSchema = z.object({
    cash: z.number().min(0, "Valor não pode ser negativo").optional(),
    pix: z.number().min(0, "Valor não pode ser negativo").optional(),
    card: z.number().min(0, "Valor não pode ser negativo").optional(),
    transfer: z.number().min(0, "Valor não pode ser negativo").optional(),
    wallet: z.number().min(0, "Valor não pode ser negativo").optional(),
    notes: z.string().optional(),
})

interface CashClosingDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
    cashRegisterSummary: CashRegisterSummary | null
}

export function CashClosingDialog({
    isOpen,
    onOpenChange,
    onSuccess,
    cashRegisterSummary,
}: CashClosingDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [totalActual, setTotalActual] = useState(0)
    const [difference, setDifference] = useState(0)
    const { user } = useAuth()

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            cash: 0,
            pix: 0,
            card: 0,
            transfer: 0,
            wallet: 0,
            notes: "",
        },
    })

    const watchedValues = form.watch()

    useEffect(() => {
        const total = 
            (watchedValues.cash || 0) +
            (watchedValues.pix || 0) +
            (watchedValues.card || 0) +
            (watchedValues.transfer || 0) +
            (watchedValues.wallet || 0)
        
        setTotalActual(total)

        if (cashRegisterSummary) {
            const expected = 
                cashRegisterSummary.cashRegister.initialBalance +
                cashRegisterSummary.totalSuprimento -
                cashRegisterSummary.totalSangria +
                cashRegisterSummary.totalSales
            
            setDifference(total - expected)
        }
    }, [watchedValues, cashRegisterSummary])

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        if (!user || !cashRegisterSummary) {
            toast.error("Dados inválidos")
            return
        }

        setIsSubmitting(true)
        try {
            const supabase = createClient()
            const useCase = new FecharCaixa(supabase)

            await useCase.execute({
                cashRegisterId: cashRegisterSummary.cashRegister.id,
                closedBy: user.id,
                breakdown: {
                    cash: data.cash,
                    pix: data.pix,
                    card: data.card,
                    transfer: data.transfer,
                    wallet: data.wallet,
                },
                notes: data.notes,
            })

            toast.success("Caixa fechado com sucesso!")
            form.reset()
            onOpenChange(false)
            onSuccess()
        } catch (error) {
            console.error(error)
            const errorMessage = error instanceof Error ? error.message : "Erro ao fechar caixa"
            toast.error(errorMessage)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!cashRegisterSummary) return null

    const expectedBalance = 
        cashRegisterSummary.cashRegister.initialBalance +
        cashRegisterSummary.totalSuprimento -
        cashRegisterSummary.totalSangria +
        cashRegisterSummary.totalSales

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-primary" />
                        Fechar Caixa
                    </DialogTitle>
                    <DialogDescription>
                        Conte o dinheiro em caixa e informe os valores por método de pagamento.
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-2">
                    <p className="text-sm font-medium text-blue-900">Resumo do Turno</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                            <span className="text-blue-600">Saldo Inicial:</span>
                            <span className="ml-2 font-medium">R$ {cashRegisterSummary.cashRegister.initialBalance.toFixed(2)}</span>
                        </div>
                        <div>
                            <span className="text-blue-600">Suprimentos:</span>
                            <span className="ml-2 font-medium text-green-600">+ R$ {cashRegisterSummary.totalSuprimento.toFixed(2)}</span>
                        </div>
                        <div>
                            <span className="text-blue-600">Sangrias:</span>
                            <span className="ml-2 font-medium text-red-600">- R$ {cashRegisterSummary.totalSangria.toFixed(2)}</span>
                        </div>
                        <div>
                            <span className="text-blue-600">Vendas:</span>
                            <span className="ml-2 font-medium text-green-600">+ R$ {cashRegisterSummary.totalSales.toFixed(2)}</span>
                        </div>
                    </div>
                    <div className="pt-2 border-t border-blue-300">
                        <span className="text-sm font-semibold text-blue-900">Saldo Esperado:</span>
                        <span className="ml-2 text-lg font-bold text-blue-900">R$ {expectedBalance.toFixed(2)}</span>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-3">
                            <p className="text-sm font-medium">Contagem por Método de Pagamento</p>
                            
                            <FormField
                                control={form.control}
                                name="cash"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Dinheiro (R$)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0,00"
                                                {...field}
                                                onChange={e => field.onChange(Number(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="pix"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>PIX (R$)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0,00"
                                                {...field}
                                                onChange={e => field.onChange(Number(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="card"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cartão (R$)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0,00"
                                                {...field}
                                                onChange={e => field.onChange(Number(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="transfer"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Transferência (R$)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0,00"
                                                {...field}
                                                onChange={e => field.onChange(Number(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="wallet"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Carteira Digital (R$)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0,00"
                                                {...field}
                                                onChange={e => field.onChange(Number(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className={`p-4 rounded-lg border ${
                            Math.abs(difference) < 0.01 
                                ? 'bg-green-50 border-green-200' 
                                : difference > 0 
                                ? 'bg-yellow-50 border-yellow-200' 
                                : 'bg-red-50 border-red-200'
                        }`}>
                            <div className="flex items-center gap-2 mb-2">
                                {Math.abs(difference) >= 0.01 && (
                                    <AlertCircle className="h-4 w-4" />
                                )}
                                <p className="text-sm font-medium">Resultado da Contagem</p>
                            </div>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span>Total Contado:</span>
                                    <span className="font-semibold">R$ {totalActual.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Saldo Esperado:</span>
                                    <span className="font-semibold">R$ {expectedBalance.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t">
                                    <span className="font-semibold">Diferença:</span>
                                    <span className={`font-bold ${
                                        Math.abs(difference) < 0.01 
                                            ? 'text-green-600' 
                                            : difference > 0 
                                            ? 'text-yellow-600' 
                                            : 'text-red-600'
                                    }`}>
                                        {difference > 0 ? '+' : ''} R$ {difference.toFixed(2)}
                                        {Math.abs(difference) < 0.01 && ' (Caixa OK)'}
                                        {difference > 0 && Math.abs(difference) >= 0.01 && ' (Sobra)'}
                                        {difference < 0 && Math.abs(difference) >= 0.01 && ' (Falta)'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Observações (opcional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Adicione observações sobre o fechamento..."
                                            className="resize-none"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Fechar Caixa
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
