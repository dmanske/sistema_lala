"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { LocalStorageClientRepository } from "@/infrastructure/repositories/LocalStorageClientRepository";
import { normalizePhone } from "@/core/formatters/phone";

const FormSchema = CreateClientSchema.omit({ status: true }).extend({
    status: z.enum(["ACTIVE", "INACTIVE", "ATTENTION"]),
});


interface ClientFormProps {
    initialData?: Client;
    mode: "create" | "edit";
}

export function ClientForm({ initialData, mode }: ClientFormProps) {
    const router = useRouter();
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: initialData?.name || "",
            birthDate: initialData?.birthDate || "",
            phone: initialData?.phone || "",
            whatsapp: initialData?.whatsapp || "",
            city: initialData?.city || "", // Required in form
            notes: initialData?.notes || "",
            // status: initialData?.status || "ACTIVE", // Handle status explicitly if needed, but schema handles default?
            // Actually, if Schema has default, zodResolver handles it for validation, but for Typescript, useForm needs to know.
            // Let's explicitly set status.
            status: initialData?.status || "ACTIVE",
            photoUrl: initialData?.photoUrl || "",
        },
    });

    const repo = new LocalStorageClientRepository();
    const service = new ClientService(repo);

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        try {
            const cleanData = {
                ...data,
                phone: data.phone ? normalizePhone(data.phone) : "",
                whatsapp: data.whatsapp ? normalizePhone(data.whatsapp) : "",
            };

            if (mode === "create") {
                await service.create(cleanData);
                toast.success("Cliente criado com sucesso!");
            } else {
                if (!initialData?.id) return;
                await service.update(initialData.id, cleanData);
                toast.success("Cliente atualizado com sucesso!");
            }
            router.push("/clients");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar cliente.");
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            <FormLabel>Observações</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Observações gerais sobre o cliente..."
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Photo Upload Placeholder */}
                <div className="space-y-4 pt-2">
                    <FormLabel className="text-sm font-semibold text-slate-700">Foto do Cliente</FormLabel>
                    <div className="border-2 border-dashed border-primary/20 bg-primary/5 rounded-2xl p-8 flex flex-col items-center justify-center text-muted-foreground text-sm transition-all hover:bg-primary/10 hover:border-primary/40 cursor-pointer group">
                        <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
                            <Plus className="h-6 w-6 text-primary/60" />
                        </div>
                        <span className="font-medium">Carregar foto</span>
                        <span className="text-[10px]">JPG, PNG até 2MB</span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                    <Button variant="ghost" type="button" onClick={() => router.back()} className="h-11 rounded-xl order-2 sm:order-1">
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={form.formState.isSubmitting} className="h-11 rounded-xl shadow-lg shadow-primary/20 order-1 sm:order-2">
                        {form.formState.isSubmitting && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {mode === "create" ? "Cadastrar Cliente" : "Salvar Alterações"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
