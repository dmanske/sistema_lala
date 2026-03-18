"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, Calculator, AlertCircle, CreditCard, Banknote, Calendar } from "lucide-react"

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
    cashCounted: z.number().min(0, "Valor não pode ser negativo"),
    notes: z.string().optional(),
    openedAt: z.string().min(1, "Informe a data de abertura"),
    closedAt: z.string().min(1, "Informe a data de fechamento"),
})

interface PaymentMethodTotal {
    method: string
    total: number
    label: string
}

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
    const [isLoadingPayments, setIsLoadingPayments] = useState(false)
    const [paymentTotals, setPaymentTotals] = useState<PaymentMethodTotal[]>([])
    const [cashExpected, setCashExpected] = useState(0)
    const [difference, setDifference] = useState(0)
    const { user } = useAuth()

    const toDatetimeLocal = (date: Date | string) => {
        const d = new Date(date)
        const offset = d.getTimezoneOffset()
        const local = new Date(d.getTime() - offset * 60000)
        return local.toISOString().slice(0, 16)
    }

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            cashCounted: 0,
            notes: "",
            openedAt: cashRegisterSummary ? toDatetimeLocal(cashRegisterSummary.cashRegister.openedAt) : toDatetimeLocal(new Date()),
            closedAt: toDatetimeLocal(new Date()),
        },
    })

    const cashCounted = form.watch("cashCounted")

    // Buscar totais por método de pagamento quando o dialog abrir
    useEffect(() => {
        if (isOpen && cashRegisterSummary) {
            loadPaymentTotals()
            form.setValue('openedAt', toDatetimeLocal(cashRegisterSummary.cashRegister.openedAt))
            form.setValue('closedAt', toDatetimeLocal(new Date()))
        }
    }, [isOpen, cashRegisterSummary])

    // Calcular diferença quando o valor contado mudar
    useEffect(() => {
        setDifference(cashCounted - cashExpected)
    }, [cashCounted, cashExpected])

    const loadPaymentTotals = async () => {
        if (!cashRegisterSummary) return

        setIsLoadingPayments(true)
        try {
            const supabase = createClient()
            
            // Converter data para ISO string
            const openedAtISO = new Date(cashRegisterSummary.cashRegister.openedAt).toISOString()
            const nowISO = new Date().toISOString()
            
            // Buscar totais de pagamentos por método desde a abertura do caixa
            const { data: payments, error } = await supabase
                .from('sale_payments')
                .select('method, amount')
                .gte('paid_at', openedAtISO)
                .lte('paid_at', nowISO)

            if (error) throw error

            // Agrupar por método
            const totals: Record<string, number> = {}
            payments?.forEach(payment => {
                const method = payment.method.toLowerCase()
                totals[method] = (totals[method] || 0) + Number(payment.amount)
            })

            // Converter para array com labels
            const methodLabels: Record<string, string> = {
                pix: 'PIX',
                card: 'Cartão',
                transfer: 'Transferência',
                wallet: 'Carteira Digital',
                cash: 'Dinheiro',
                credit: 'Crédito',
                fiado: 'Fiado'
            }

            const totalsArray: PaymentMethodTotal[] = Object.entries(totals)
                .filter(([method]) => method !== 'cash' && method !== 'credit' && method !== 'fiado')
                .map(([method, total]) => ({
                    method,
                    total,
                    label: methodLabels[method] || method
                }))
                .sort((a, b) => b.total - a.total)

            setPaymentTotals(totalsArray)

            // Calcular dinheiro esperado
            const cashFromSales = totals.cash || 0
            const expected = 
                cashRegisterSummary.cashRegister.initialBalance +
                cashRegisterSummary.totalSuprimento -
                cashRegisterSummary.totalSangria +
                cashFromSales

            setCashExpected(expected)
            form.setValue('cashCounted', expected)

        } catch (error) {
            console.error('Error loading payment totals:', error)
            toast.error('Erro ao carregar totais de pagamento')
        } finally {
            setIsLoadingPayments(false)
        }
    }

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        if (!user || !cashRegisterSummary) {
            toast.error("Dados inválidos")
            return
        }

        setIsSubmitting(true)
        try {
            const supabase = createClient()
            const useCase = new FecharCaixa(supabase)

            const result = await useCase.execute({
                cashRegisterId: cashRegisterSummary.cashRegister.id,
                closedBy: user.id,
                breakdown: {
                    cash: data.cashCounted,
                },
                notes: data.notes,
                openedAt: new Date(data.openedAt).toISOString(),
                closedAt: new Date(data.closedAt).toISOString(),
            })

            console.log('✅ Caixa fechado com sucesso:', result)
            toast.success("Caixa fechado com sucesso!")
            
            // Resetar o form
            form.reset()
            
            console.log('🔄 Chamando onSuccess para atualizar estado...')
            // Chamar onSuccess ANTES de fechar o dialog
            await onSuccess()
            
            console.log('✅ Estado atualizado, fechando dialog...')
            // Fechar o dialog após atualizar
            onOpenChange(false)
        } catch (error) {
            console.error(error)
            const errorMessage = error instanceof Error ? error.message : "Erro ao fechar caixa"
            toast.error(errorMessage)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!cashRegisterSummary) return null

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-primary" />
                        Fechar Caixa
                    </DialogTitle>
                    <DialogDescription>
                        Conte o dinheiro físico em caixa. Os pagamentos digitais já estão registrados automaticamente.
                    </DialogDescription>
                </DialogHeader>

                {isLoadingPayments ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        {/* Pagamentos Digitais - Já Registrados */}
                        {paymentTotals.length > 0 && (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                                        <CreditCard className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-blue-900">Pagamentos Digitais</p>
                                        <p className="text-xs text-blue-600">Já registrados automaticamente</p>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    {paymentTotals.map((payment) => (
                                        <div key={payment.method} className="flex justify-between items-center bg-white/50 p-2 rounded">
                                            <span className="text-sm text-blue-700">{payment.label}</span>
                                            <span className="text-sm font-semibold text-blue-900">
                                                R$ {payment.total.toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-2 border-t border-blue-300">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-semibold text-blue-900">Total Digital:</span>
                                        <span className="text-base font-bold text-blue-900">
                                            R$ {paymentTotals.reduce((sum, p) => sum + p.total, 0).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Resumo do Dinheiro Físico */}
                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 space-y-2">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center">
                                    <Banknote className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-amber-900">Dinheiro Físico Esperado</p>
                                    <p className="text-xs text-amber-600">Baseado nas movimentações do turno</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-white/50 p-2 rounded">
                                    <span className="text-amber-600">Saldo Inicial:</span>
                                    <span className="ml-2 font-medium">R$ {cashRegisterSummary.cashRegister.initialBalance.toFixed(2)}</span>
                                </div>
                                <div className="bg-white/50 p-2 rounded">
                                    <span className="text-amber-600">Vendas em Dinheiro:</span>
                                    <span className="ml-2 font-medium text-green-600">+ R$ {(paymentTotals.find(p => p.method === 'cash')?.total || 0).toFixed(2)}</span>
                                </div>
                                <div className="bg-white/50 p-2 rounded">
                                    <span className="text-amber-600">Suprimentos:</span>
                                    <span className="ml-2 font-medium text-green-600">+ R$ {cashRegisterSummary.totalSuprimento.toFixed(2)}</span>
                                </div>
                                <div className="bg-white/50 p-2 rounded">
                                    <span className="text-amber-600">Sangrias:</span>
                                    <span className="ml-2 font-medium text-red-600">- R$ {cashRegisterSummary.totalSangria.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="pt-2 border-t border-amber-300">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-amber-900">Dinheiro Esperado:</span>
                                    <span className="text-lg font-bold text-amber-900">R$ {cashExpected.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                {/* Datas de Abertura e Fechamento */}
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Calendar className="h-4 w-4 text-slate-500" />
                                        <p className="text-sm font-semibold text-slate-700">Período do Turno</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <FormField
                                            control={form.control}
                                            name="openedAt"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs text-slate-500">Data de Abertura</FormLabel>
                                                    <FormControl>
                                                        <Input type="datetime-local" className="h-9 text-sm" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="closedAt"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs text-slate-500">Data de Fechamento</FormLabel>
                                                    <FormControl>
                                                        <Input type="datetime-local" className="h-9 text-sm" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Campo de Contagem de Dinheiro */}
                                <div className="space-y-3">
                                    <FormField
                                        control={form.control}
                                        name="cashCounted"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-semibold">
                                                    💰 Quanto tem de DINHEIRO FÍSICO no caixa?
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="0,00"
                                                        className="text-xl font-bold text-center h-14"
                                                        {...field}
                                                        onChange={e => field.onChange(Number(e.target.value) || 0)}
                                                    />
                                                </FormControl>
                                                <p className="text-xs text-muted-foreground text-center">
                                                    Conte as notas e moedas físicas no caixa
                                                </p>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Resultado da Contagem */}
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
                                            <span>Dinheiro Contado:</span>
                                            <span className="font-semibold">R$ {cashCounted.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Dinheiro Esperado:</span>
                                            <span className="font-semibold">R$ {cashExpected.toFixed(2)}</span>
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
                                                {Math.abs(difference) < 0.01 && ' (Caixa OK ✅)'}
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
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
