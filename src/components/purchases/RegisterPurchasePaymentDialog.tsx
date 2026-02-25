"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, CreditCard } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AccountSelector } from "@/components/bank-accounts/AccountSelector";
import { getPurchasePaymentRepository } from "@/infrastructure/repositories/factory";

const FormSchema = z.object({
    amount: z.number().positive("Valor deve ser positivo"),
    method: z.enum(["CASH", "PIX", "CARD", "TRANSFER", "WALLET"]),
    bankAccountId: z.string().min(1, "Selecione uma conta bancária"),
    notes: z.string().optional(),
});

interface RegisterPurchasePaymentDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    purchaseId: string;
    remainingAmount: number;
    onSuccess: () => void;
}

export function RegisterPurchasePaymentDialog({
    isOpen,
    onOpenChange,
    purchaseId,
    remainingAmount,
    onSuccess,
}: RegisterPurchasePaymentDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            amount: remainingAmount,
            method: "PIX",
            bankAccountId: "",
            notes: "",
        },
    });

    const paymentRepo = getPurchasePaymentRepository();

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        // Validar que o valor não excede o saldo pendente
        if (data.amount > remainingAmount) {
            toast.error(`O valor não pode exceder o saldo pendente de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(remainingAmount)}`);
            return;
        }

        setIsSubmitting(true);
        try {
            await paymentRepo.create({
                purchaseId,
                bankAccountId: data.bankAccountId,
                amount: data.amount,
                method: data.method,
                notes: data.notes,
            });

            toast.success("Pagamento registrado com sucesso!");
            form.reset();
            onOpenChange(false);
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao registrar pagamento");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        Registrar Pagamento
                    </DialogTitle>
                    <DialogDescription>
                        Registre um pagamento para esta compra. O valor será debitado da conta selecionada.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-700 font-medium">
                                        Valor restante a pagar:
                                    </p>
                                    <p className="text-2xl font-bold text-blue-900">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(remainingAmount)}
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => form.setValue('amount', remainingAmount)}
                                    className="bg-white hover:bg-blue-50"
                                >
                                    Pagar Total
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
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
                                                max={remainingAmount}
                                                placeholder="0,00"
                                                {...field}
                                                onChange={e => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                        {field.value > remainingAmount && (
                                            <p className="text-xs text-red-600 mt-1">
                                                Valor não pode exceder o saldo pendente
                                            </p>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="method"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Forma de Pagamento</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="PIX">PIX</SelectItem>
                                                <SelectItem value="CASH">Dinheiro</SelectItem>
                                                <SelectItem value="CARD">Cartão</SelectItem>
                                                <SelectItem value="TRANSFER">Transferência</SelectItem>
                                                <SelectItem value="WALLET">Carteira Digital</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="bankAccountId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Conta de Origem *</FormLabel>
                                    <AccountSelector
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        placeholder="Selecione a conta"
                                    />
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
                                            placeholder="Adicione observações sobre este pagamento..."
                                            className="resize-none"
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
                                Registrar Pagamento
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
