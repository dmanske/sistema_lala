"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2, Droplets } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateUsageProductSchema, CreateUsageProductInput, UsageProduct } from "@/core/domain/UsageProduct";

interface UsageProductDialogProps {
    product?: UsageProduct;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: CreateUsageProductInput) => Promise<void>;
}

export function UsageProductDialog({ product, open, onOpenChange, onSubmit }: UsageProductDialogProps) {
    const [submitting, setSubmitting] = useState(false);

    const form = useForm<CreateUsageProductInput>({
        resolver: zodResolver(CreateUsageProductSchema),
        defaultValues: { name: "", contentAmount: 0, measurementUnit: "g", unitLabel: "tubo", stockQuantity: 1 },
    });

    useEffect(() => {
        if (open) {
            if (product) {
                form.reset({
                    name: product.name,
                    contentAmount: product.contentAmount,
                    measurementUnit: product.measurementUnit,
                    unitLabel: product.unitLabel,
                    stockQuantity: product.stockQuantity ?? 1,
                });
            } else {
                form.reset({ name: "", contentAmount: 0, measurementUnit: "g", unitLabel: "tubo", stockQuantity: 1 });
            }
        }
    }, [open, product, form]);

    const handleSubmit = async (data: CreateUsageProductInput) => {
        setSubmitting(true);
        try {
            await onSubmit(data);
            toast.success(product ? "Produto atualizado!" : "Produto criado!");
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar produto");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-slate-50/95 backdrop-blur-xl">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl font-heading text-slate-800 flex items-center gap-2">
                        {product ? <Droplets className="h-5 w-5 text-teal-500" /> : <Plus className="h-5 w-5 text-teal-500" />}
                        {product ? "Editar Produto de Consumo" : "Novo Produto de Consumo"}
                    </DialogTitle>
                    <DialogDescription>
                        Cadastre produtos usados internamente nos serviços (tintas, oxidantes, etc.)
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome do Produto</Label>
                            <Input id="name" placeholder="Ex: Tinta Loreal 7.1" {...form.register("name")} className="bg-slate-50 border-slate-200" />
                            {form.formState.errors.name && <span className="text-xs text-red-500">{form.formState.errors.name.message}</span>}
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="contentAmount">Conteúdo</Label>
                                <Input id="contentAmount" type="number" step="0.1" placeholder="60" {...form.register("contentAmount", { valueAsNumber: true })} className="bg-slate-50 border-slate-200" />
                                {form.formState.errors.contentAmount && <span className="text-xs text-red-500">{form.formState.errors.contentAmount.message}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label>Medida</Label>
                                <Select value={form.watch("measurementUnit")} onValueChange={(v) => form.setValue("measurementUnit", v as any)}>
                                    <SelectTrigger className="bg-slate-50 border-slate-200"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="g">Gramas (g)</SelectItem>
                                        <SelectItem value="ml">Mililitros (ml)</SelectItem>
                                        <SelectItem value="un">Unidades (un)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Embalagem</Label>
                                <Select value={form.watch("unitLabel")} onValueChange={(v) => form.setValue("unitLabel", v)}>
                                    <SelectTrigger className="bg-slate-50 border-slate-200"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="tubo">Tubo</SelectItem>
                                        <SelectItem value="frasco">Frasco</SelectItem>
                                        <SelectItem value="pote">Pote</SelectItem>
                                        <SelectItem value="litro">Litro</SelectItem>
                                        <SelectItem value="pacote">Pacote</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="stockQuantity">Quantidade em Estoque</Label>
                            <Input id="stockQuantity" type="number" min={0} step={1} placeholder="5" {...form.register("stockQuantity", { valueAsNumber: true })} className="bg-slate-50 border-slate-200" />
                            <p className="text-xs text-gray-400">Quantos {form.watch("unitLabel")}s você tem em estoque</p>
                        </div>
                    </div>
                </form>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="hover:bg-slate-100">Cancelar</Button>
                    <Button type="submit" onClick={form.handleSubmit(handleSubmit)} disabled={submitting} className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-md">
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {product ? "Salvar Alterações" : "Criar Produto"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
