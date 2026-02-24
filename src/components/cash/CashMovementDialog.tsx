"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, TrendingDown, TrendingUp } from "lucide-react"

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
import { RegistrarSangria } from "@/core/usecases/cash-register/RegistrarSangria"
import { RegistrarSuprimento } from "@/core/usecases/cash-register/RegistrarSuprimento"
import { SupabaseCashRegisterRepository } from "@/infrastructure/repositories/supabase/SupabaseCashRegisterRepository"
import { createClient } from "@/lib/supabase/client"

const FormSchema = z.object({
    type: z.enum(["SANGRIA", "SUPRIMENTO"], {
        required_error: "Selecione o tipo de movimentação",
    }),
    amount: z.number().min(0.01, "Valor deve ser maior que zero"),
    reason: z.string().min(3, "Motivo deve ter pelo menos 3 caracteres"),
})

interface CashMovementDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
    cashRegisterId: string
}

export function CashMovementDialog({
    isOpen,
    onOpenChange,
    onSuccess,
    cashRegisterId,
}: CashMovementDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { user } = useAuth()

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            type: "SANGRIA",
            amount: 0,
            reason: "",
        },
    })

    const selectedType = form.watch("type")

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        if (!user) {
            toast.error("Usuário não autenticado")
            return
        }

        setIsSubmitting(true)
        try {
            const supabase = createClient()
            const repository = new SupabaseCashRegisterRepository(supabase)

            if (data.type === "SANGRIA") {
                const useCase = new RegistrarSangria(repository)
                await useCase.execute({
                    cashRegisterId,
                    amount: data.amount,
                    reason: data.reason,
                    createdBy: user.id,
                })
                toast.success("Sangria registrada com sucesso!")
            } else {
                const useCase = new RegistrarSuprimento(repository)
                await useCase.execute({
                    cashRegisterId,
                    amount: data.amount,
                    reason: data.reason,
                    createdBy: user.id,
                })
                toast.success("Suprimento registrado com sucesso!")
            }

            form.reset()
            onOpenChange(false)
            onSuccess()
        } catch (error) {
            console.error(error)
            const errorMessage = error instanceof Error ? error.message : "Erro ao registrar movimentação"
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
                        {selectedType === "SANGRIA" ? (
                            <TrendingDown className="h-5 w-5 text-red-500" />
                        ) : (
                            <TrendingUp className="h-5 w-5 text-green-500" />
                        )}
                        Registrar Movimentação
                    </DialogTitle>
                    <DialogDescription>
                        {selectedType === "SANGRIA" 
                            ? "Registre uma retirada de dinheiro do caixa."
                            : "Registre uma adição de dinheiro ao caixa."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de Movimentação *</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o tipo" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="SANGRIA">
                                                <div className="flex items-center gap-2">
                                                    <TrendingDown className="h-4 w-4 text-red-500" />
                                                    <span>Sangria (Retirada)</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="SUPRIMENTO">
                                                <div className="flex items-center gap-2">
                                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                                    <span>Suprimento (Adição)</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Valor (R$) *</FormLabel>
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
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Motivo *</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Descreva o motivo da movimentação..."
                                            className="resize-none"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className={`p-3 rounded-lg border ${
                            selectedType === "SANGRIA" 
                                ? "bg-red-50 border-red-200" 
                                : "bg-green-50 border-green-200"
                        }`}>
                            <p className="text-xs text-gray-600">
                                {selectedType === "SANGRIA" 
                                    ? "⚠️ Esta operação irá reduzir o saldo do caixa."
                                    : "✓ Esta operação irá aumentar o saldo do caixa."}
                            </p>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={isSubmitting}
                                variant={selectedType === "SANGRIA" ? "destructive" : "default"}
                            >
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Registrar {selectedType === "SANGRIA" ? "Sangria" : "Suprimento"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
