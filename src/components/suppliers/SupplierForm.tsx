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

import { CreateSupplierSchema, Supplier } from "@/core/domain/Supplier";
import { LocalStorageSupplierRepository } from "@/infrastructure/repositories/LocalStorageSupplierRepository";
import { normalizePhone } from "@/core/formatters/phone";

const FormSchema = CreateSupplierSchema.omit({ status: true }).extend({
    status: z.enum(["ACTIVE", "INACTIVE"]),
});

interface SupplierFormProps {
    initialData?: Supplier;
    mode: "create" | "edit";
}

export function SupplierForm({ initialData, mode }: SupplierFormProps) {
    const router = useRouter();
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: initialData?.name || "",
            cnpj: initialData?.cnpj || "",
            phone: initialData?.phone || "",
            whatsapp: initialData?.whatsapp || "",
            email: initialData?.email || "",
            notes: initialData?.notes || "",
            status: initialData?.status || "ACTIVE",
        },
    });

    const repo = new LocalStorageSupplierRepository();

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        try {
            const cleanData = {
                ...data,
                phone: data.phone ? normalizePhone(data.phone) : "",
                whatsapp: data.whatsapp ? normalizePhone(data.whatsapp) : "",
            };

            if (mode === "create") {
                await repo.create(cleanData);
                toast.success("Fornecedor cadastrado com sucesso!");
            } else {
                if (!initialData?.id) return;
                await repo.update(initialData.id, cleanData);
                toast.success("Fornecedor atualizado com sucesso!");
            }
            router.push("/suppliers");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar fornecedor.");
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
                                <FormLabel className="text-sm font-semibold text-slate-700">Razão Social / Nome</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: Distribuidora Beleza Ltda" className="h-11 rounded-xl bg-white/50 border-white/20 focus:bg-white" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="cnpj"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-semibold text-slate-700">CNPJ (Opcional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="00.000.000/0000-00" className="h-11 rounded-xl bg-white/50 border-white/20 focus:bg-white" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-semibold text-slate-700">E-mail</FormLabel>
                                <FormControl>
                                    <Input placeholder="contato@fornecedor.com" className="h-11 rounded-xl bg-white/50 border-white/20 focus:bg-white" {...field} />
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
                                <FormLabel className="text-sm font-semibold text-slate-700">Telefone</FormLabel>
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
                                <FormLabel className="text-sm font-semibold text-slate-700">WhatsApp</FormLabel>
                                <FormControl>
                                    <Input placeholder="(00) 00000-0000" className="h-11 rounded-xl bg-white/50 border-white/20 focus:bg-white" {...field} />
                                </FormControl>
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
                                    placeholder="Observações gerais sobre o fornecedor..."
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                    <Button variant="ghost" type="button" onClick={() => router.back()} className="h-11 rounded-xl order-2 sm:order-1">
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={form.formState.isSubmitting} className="h-11 rounded-xl shadow-lg shadow-primary/20 order-1 sm:order-2">
                        {form.formState.isSubmitting && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {mode === "create" ? "Cadastrar Fornecedor" : "Salvar Alterações"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
