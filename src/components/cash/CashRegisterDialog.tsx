"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, Wallet } from "lucide-react"

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/contexts/AuthProvider"
import { AbrirCaixa } from "@/core/usecases/cash-register/AbrirCaixa"
import { SupabaseCashRegisterRepository } from "@/infrastructure/repositories/supabase/SupabaseCashRegisterRepository"
import { createClient } from "@/lib/supabase/client"

const FormSchema = z.object({
    bankAccountId: z.string().min(1, "Selecione uma conta bancária"),
    initialBalance: z.number().min(0, "Saldo inicial não pode ser negativo"),
    notes: z.string().optional(),
})

interface BankAccount {
    id: string
    name: string
    type: string
}

interface CashRegisterDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function CashRegisterDialog({
    isOpen,
    onOpenChange,
    onSuccess,
}: CashRegisterDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(true)
    const { user } = useAuth()

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            bankAccountId: "",
            initialBalance: 0,
            notes: "",
        },
    })

    useEffect(() => {
        if (isOpen) {
            loadBankAccounts()
        }
    }, [isOpen])

    async function loadBankAccounts() {
        setIsLoadingAccounts(true)
        try {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('bank_accounts')
                .select('id, name, type')
                .eq('is_active', true)
                .order('name')

            if (error) throw error

            setBankAccounts(data || [])

            // Auto-select "Caixa Geral" if exists
            const caixaGeral = data?.find(acc => 
                acc.name.toLowerCase().includes('caixa') && 
                acc.name.toLowerCase().includes('geral')
            )
            if (caixaGeral) {
                form.setValue('bankAccountId', caixaGeral.id)
            }
        } catch (error) {
            console.error('Error loading bank accounts:', error)
            toast.error('Erro ao carregar contas bancárias')
        } finally {
            setIsLoadingAccounts(false)
        }
    }

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        if (!user) {
            toast.error("Usuário não autenticado")
            return
        }

        setIsSubmitting(true)
        try {
            const supabase = createClient()
            const repository = new SupabaseCashRegisterRepository(supabase)
            const useCase = new AbrirCaixa(repository)

            await useCase.execute({
                initialBalance: data.initialBalance,
                bankAccountId: data.bankAccountId,
                openedBy: user.id,
                notes: data.notes,
            })

            toast.success("Caixa aberto com sucesso!")
            form.reset()
            onOpenChange(false)
            onSuccess()
        } catch (error) {
            console.error(error)
            const errorMessage = error instanceof Error ? error.message : "Erro ao abrir caixa"
            toast.error(errorMessage)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-primary" />
                        Abrir Caixa
                    </DialogTitle>
                    <DialogDescription>
                        Selecione a conta bancária e informe o saldo inicial para abrir um novo turno de caixa.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <p className="text-sm text-purple-700 font-medium mb-2">
                                Atenção
                            </p>
                            <p className="text-xs text-purple-600">
                                Certifique-se de contar o dinheiro em caixa antes de iniciar o turno.
                                Este valor será usado como referência para o fechamento.
                            </p>
                        </div>

                        <FormField
                            control={form.control}
                            name="bankAccountId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Conta Bancária *</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={isLoadingAccounts}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={
                                                    isLoadingAccounts 
                                                        ? "Carregando..." 
                                                        : "Selecione a conta"
                                                } />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {bankAccounts.map((account) => (
                                                <SelectItem key={account.id} value={account.id}>
                                                    {account.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="initialBalance"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Saldo Inicial (R$) *</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0,00"
                                            {...field}
                                            onChange={e => field.onChange(Number(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Observações (opcional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Adicione observações sobre a abertura do caixa..."
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
                                Abrir Caixa
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
