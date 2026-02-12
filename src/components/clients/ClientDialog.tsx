"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
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

import { CreateClientSchema, Client } from "@/core/domain/Client";
import { ClientService } from "@/core/services/ClientService";
import { getClientRepository } from "@/infrastructure/repositories/factory";
import { normalizePhone } from "@/core/formatters/phone";

const FormSchema = CreateClientSchema.omit({ status: true }).extend({
    status: z.enum(["ACTIVE", "INACTIVE", "ATTENTION"]),
});

interface ClientDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: (client: Client) => void;
}

export function ClientDialog({ isOpen, onOpenChange, onSuccess }: ClientDialogProps) {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: "",
            birthDate: "",
            phone: "",
            whatsapp: "",
            city: "",
            notes: "",
            status: "ACTIVE",
            photoUrl: "",
        },
    });

    const repo = getClientRepository();
    const service = new ClientService(repo);

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        try {
            const cleanData = {
                ...data,
                phone: data.phone ? normalizePhone(data.phone) : "",
                whatsapp: data.whatsapp ? normalizePhone(data.whatsapp) : "",
            };

            const newClient = await service.create(cleanData);
            toast.success("Cliente criado com sucesso!");
            form.reset();
            onOpenChange(false);
            onSuccess?.(newClient);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar cliente.");
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl border-white/20 rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold font-heading">Novo Cliente</DialogTitle>
                    <DialogDescription>
                        Preencha os dados do cliente para cadastrá-lo no sistema.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold text-slate-700">Nome Completo</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Maria Silva" className="h-11 rounded-xl bg-white/50 border-white/20 focus:bg-white" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="birthDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold text-slate-700">Data de Nascimento</FormLabel>
                                        <FormControl>
                                            <Input type="date" className="h-11 rounded-xl bg-white/50 border-white/20 focus:bg-white" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold text-slate-700">Telefone (Opcional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="(00) 0000-0000" className="h-11 rounded-xl bg-white/50 border-white/20 focus:bg-white" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="whatsapp"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold text-slate-700">WhatsApp (Opcional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="(00) 00000-0000" className="h-11 rounded-xl bg-white/50 border-white/20 focus:bg-white" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold text-slate-700">Cidade</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: São Paulo" className="h-11 rounded-xl bg-white/50 border-white/20 focus:bg-white" {...field} />
                                        </FormControl>
                                        <FormDescription className="text-[10px]">
                                            Obrigatório para cadastro.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold text-slate-700">Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-11 rounded-xl bg-white/50 border-white/20">
                                                    <SelectValue placeholder="Selecione o status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-xl border-white/20 bg-white/80 backdrop-blur-xl">
                                                <SelectItem value="ACTIVE">Ativo</SelectItem>
                                                <SelectItem value="INACTIVE">Inativo</SelectItem>
                                                <SelectItem value="ATTENTION">Atenção</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-semibold text-slate-700">Observações</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Observações gerais sobre o cliente..."
                                            className="resize-none rounded-xl bg-white/50 border-white/20 focus:bg-white"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                            <Button 
                                variant="ghost" 
                                type="button" 
                                onClick={() => onOpenChange(false)} 
                                className="h-11 rounded-xl order-2 sm:order-1"
                            >
                                Cancelar
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={form.formState.isSubmitting} 
                                className="h-11 rounded-xl shadow-lg shadow-primary/20 order-1 sm:order-2"
                            >
                                {form.formState.isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Cadastrar Cliente
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
