"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
                                <FormLabel>Nome Completo</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: Maria Silva" {...field} />
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
                                <FormLabel>Data de Nascimento</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
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
                                <FormLabel>Telefone (Opcional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="(00) 0000-0000" {...field} />
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
                                <FormLabel>WhatsApp (Opcional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="(00) 00000-0000" {...field} />
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
                                <FormLabel>Cidade</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: São Paulo" {...field} />
                                </FormControl>
                                <FormDescription>
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
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
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
                <div className="space-y-2">
                    <FormLabel>Foto do Cliente</FormLabel>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground text-sm">
                        <span>Upload de foto (Mock)</span>
                        <span className="text-xs">Arraste ou clique para selecionar</span>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Button variant="outline" type="button" onClick={() => router.back()}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
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
