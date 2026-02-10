"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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

import { CreditService } from "@/core/services/CreditService";
import { LocalStorageCreditRepository } from "@/infrastructure/repositories/LocalStorageCreditRepository";
import { LocalStorageClientRepository } from "@/infrastructure/repositories/LocalStorageClientRepository";
import { CreateCreditMovementSchema, CreditOriginSchema } from "@/core/domain/Credit";

interface RegisterCreditDialogProps {
    clientId: string;
    onSuccess?: () => void;
}

const FormSchema = z.object({
    amount: z.coerce.number().min(0.01, "O valor deve ser maior que zero"),
    origin: CreditOriginSchema,
    note: z.string().optional(),
});

export function RegisterCreditDialog({ clientId, onSuccess }: RegisterCreditDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema) as any,
        defaultValues: {
            amount: 0,
            origin: "CASH",
            note: "",
        },
    });

    const onSubmit = async (data: z.infer<typeof FormSchema>) => {
        setIsSubmitting(true);
        try {
            const creditRepo = new LocalStorageCreditRepository();
            const clientRepo = new LocalStorageClientRepository();
            const service = new CreditService(creditRepo, clientRepo);

            await service.addCredit(clientId, {
                amount: data.amount,
                origin: data.origin,
                note: data.note,
                clientId: clientId,
            });

            toast.success("Crédito registrado com sucesso!");
            setIsOpen(false);
            form.reset();
            onSuccess?.();
            window.location.reload(); // Quick refresh to update balance in parent
        } catch (error) {
            console.error(error);
            toast.error("Erro ao registrar crédito.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-primary hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/20">
                    <Plus className="h-4 w-4" /> Registrar Crédito
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-2xl border-white/20 bg-white/60 backdrop-blur-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold font-heading text-slate-800">Registrar Crédito</DialogTitle>
                    <DialogDescription className="text-slate-500">
                        Adicione saldo à conta do cliente. Esta ação gera uma movimentação financeira.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-semibold text-slate-700">Valor (R$)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            step="0.01"
                                            min="0"
                                            className="h-11 rounded-xl bg-white/50 border-white/20 focus:bg-white"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="origin"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-semibold text-slate-700">Origem do Pagamento</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-11 rounded-xl bg-white/50 border-white/20">
                                                <SelectValue placeholder="Selecione a origem" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="rounded-xl border-white/20 bg-white/80 backdrop-blur-2xl">
                                            <SelectItem value="CASH">Dinheiro</SelectItem>
                                            <SelectItem value="PIX">Pix</SelectItem>
                                            <SelectItem value="CARD">Cartão</SelectItem>
                                            <SelectItem value="WALLET">Carteira Virtual</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="note"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Observação (Opcional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Ex: Adiantamento para pacote..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-4">
                            <Button type="submit" disabled={isSubmitting} className="w-full h-11 rounded-xl shadow-lg shadow-primary/20">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Confirmar Crédito
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
