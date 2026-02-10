"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Calculator, Info, Package, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreateProductSchema, CreateProductInput, Product } from "@/core/domain/Product";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface ProductDialogProps {
    product?: Product;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: CreateProductInput) => Promise<void>;
}

export function ProductDialog({ product, open, onOpenChange, onSubmit }: ProductDialogProps) {
    const [submitting, setSubmitting] = useState(false);

    const form = useForm<CreateProductInput>({
        resolver: zodResolver(CreateProductSchema),
        defaultValues: {
            name: "",
            cost: 0,
            price: 0,
            minStock: 0,
            profitAmount: 0,
            profitPercentage: 0,
            commission: 0,
        },
    });

    useEffect(() => {
        if (open) {
            if (product) {
                form.reset({
                    name: product.name,
                    cost: product.cost,
                    price: product.price,
                    minStock: product.minStock,
                    profitAmount: product.profitAmount,
                    profitPercentage: product.profitPercentage,
                    commission: product.commission,
                    netValue: product.netValue || (product.price - product.commission)
                });
            } else {
                form.reset({
                    name: "",
                    cost: 0,
                    price: 0,
                    minStock: 0,
                    profitAmount: 0,
                    profitPercentage: 0,
                    commission: 0,
                });
            }
        }
    }, [open, product, form]);

    // --- Auto Calculation Logic ---
    const cost = useWatch({ control: form.control, name: "cost" });
    const profitAmount = useWatch({ control: form.control, name: "profitAmount" });
    const profitPercentage = useWatch({ control: form.control, name: "profitPercentage" });
    const commission = useWatch({ control: form.control, name: "commission" });
    const price = useWatch({ control: form.control, name: "price" });

    const calculatePrice = (c: number, p: number, com: number) => {
        return parseFloat((c + p + com).toFixed(2));
    };

    const calculateProfitFromPrice = (pr: number, c: number, com: number) => {
        return parseFloat((pr - c - com).toFixed(2));
    };

    const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value) || 0;
        form.setValue("cost", val);

        const currentProfit = form.getValues("profitAmount");
        const currentComm = form.getValues("commission");
        const newPrice = calculatePrice(val, currentProfit, currentComm);

        form.setValue("price", newPrice);
        if (val > 0) {
            form.setValue("profitPercentage", parseFloat(((currentProfit / val) * 100).toFixed(2)));
        }
    };

    const handleProfitAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value) || 0;
        form.setValue("profitAmount", val);

        const currentCost = form.getValues("cost");
        const currentComm = form.getValues("commission");

        const newPrice = calculatePrice(currentCost, val, currentComm);
        form.setValue("price", newPrice);

        if (currentCost > 0) {
            form.setValue("profitPercentage", parseFloat(((val / currentCost) * 100).toFixed(2)));
        }
    };

    const handleProfitPercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value) || 0;
        form.setValue("profitPercentage", val);

        const currentCost = form.getValues("cost");
        const currentComm = form.getValues("commission");

        const newProfitAmount = parseFloat(((currentCost * val) / 100).toFixed(2));
        form.setValue("profitAmount", newProfitAmount);

        const newPrice = calculatePrice(currentCost, newProfitAmount, currentComm);
        form.setValue("price", newPrice);
    };

    const handleCommissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value) || 0;
        form.setValue("commission", val);

        const currentCost = form.getValues("cost");
        const currentProfit = form.getValues("profitAmount");
        const newPrice = calculatePrice(currentCost, currentProfit, val);
        form.setValue("price", newPrice);
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value) || 0;
        form.setValue("price", val);

        const currentCost = form.getValues("cost");
        const currentComm = form.getValues("commission");

        const newProfit = calculateProfitFromPrice(val, currentCost, currentComm);
        form.setValue("profitAmount", newProfit);

        if (currentCost > 0) {
            form.setValue("profitPercentage", parseFloat(((newProfit / currentCost) * 100).toFixed(2)));
        }
    };

    const handleSubmit = async (data: CreateProductInput) => {
        setSubmitting(true);
        try {
            data.netValue = data.price - data.commission;
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

    const displayNetValue = (price || 0) - (commission || 0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] bg-slate-50/95 backdrop-blur-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl font-heading text-slate-800 flex items-center gap-2">
                        <Package className="h-5 w-5 text-purple-500" />
                        {product ? "Editar Produto" : "Novo Produto"}
                    </DialogTitle>
                    <DialogDescription>
                        Gerencie detalhes, estoque e precificação do produto.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 space-y-4">
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">Informações Básicas</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome do Produto</Label>
                                <Input
                                    id="name"
                                    placeholder="Ex: Shampoo Hidratante"
                                    {...form.register("name")}
                                    className="bg-slate-50 border-slate-200"
                                />
                                {form.formState.errors.name && <span className="text-xs text-red-500">{form.formState.errors.name.message}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="minStock">Estoque Mínimo (Alerta)</Label>
                                <Input
                                    id="minStock"
                                    type="number"
                                    {...form.register("minStock", { valueAsNumber: true })}
                                    className="bg-slate-50 border-slate-200"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Stock Info (Read Only) */}
                    {product && (
                        <div className="bg-slate-100/50 p-4 rounded-xl border border-dashed border-slate-200 space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Status do Estoque</h3>
                                <Badge variant={product.currentStock <= product.minStock ? "destructive" : "secondary"}>
                                    {product.currentStock <= product.minStock ? "Crítico" : "Normal"}
                                </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground block text-xs uppercase">Estoque Atual</span>
                                    <span className="font-bold text-lg text-slate-700">{product.currentStock} un</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block text-xs uppercase">Última Movimentação</span>
                                    <span className="font-medium text-slate-600">
                                        {product.lastMovement ? format(new Date(product.lastMovement), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "Nenhuma"}
                                    </span>
                                </div>
                            </div>
                            <div className="text-xs text-slate-400 italic flex items-center gap-1">
                                <Info className="h-3 w-3" />
                                Para ajustar o estoque, utilize a função de Movimentação na lista.
                            </div>
                        </div>
                    )}

                    {/* Financials */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 space-y-4">
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2 flex items-center justify-between">
                            Precificação <span className="text-[10px] font-normal text-slate-400 normal-case bg-slate-100 px-2 py-0.5 rounded-full">Calculado Automaticamente</span>
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="cost" className="text-slate-600">Custo (R$)</Label>
                                <Input
                                    id="cost"
                                    type="number"
                                    step="0.01"
                                    {...form.register("cost", { valueAsNumber: true })}
                                    onChange={handleCostChange}
                                    className="border-slate-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="profitAmount" className="text-green-600">Lucro (R$)</Label>
                                <Input
                                    id="profitAmount"
                                    type="number"
                                    step="0.01"
                                    {...form.register("profitAmount", { valueAsNumber: true })}
                                    onChange={handleProfitAmountChange}
                                    className="border-green-100 bg-green-50/50 text-green-700 font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="profitPercentage" className="text-green-600">Margem (%)</Label>
                                <Input
                                    id="profitPercentage"
                                    type="number"
                                    step="0.1"
                                    {...form.register("profitPercentage", { valueAsNumber: true })}
                                    onChange={handleProfitPercentageChange}
                                    className="border-green-100 bg-green-50/50 text-green-700 font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="commission" className="text-orange-600">Comissão (R$)</Label>
                                <Input
                                    id="commission"
                                    type="number"
                                    step="0.01"
                                    {...form.register("commission", { valueAsNumber: true })}
                                    onChange={handleCommissionChange}
                                    className="border-orange-100 bg-orange-50/50 text-orange-700"
                                />
                            </div>
                        </div>

                        <Separator className="bg-slate-100" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div className="space-y-2 bg-purple-50/50 p-3 rounded-xl border border-purple-100">
                                <Label htmlFor="price" className="text-purple-700 font-bold text-lg">Preço de Venda</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 font-bold">R$</span>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        {...form.register("price", { valueAsNumber: true })}
                                        onChange={handlePriceChange}
                                        className="pl-10 h-12 text-2xl font-bold text-purple-700 border-purple-200 bg-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1 text-right p-3 opacity-90">
                                <Label className="text-slate-500 text-xs uppercase tracking-widest">Valor Líquido (Receita)</Label>
                                <div className="text-3xl font-bold text-slate-700">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(displayNetValue)}
                                </div>
                                <div className="text-xs text-slate-400">Preço - Comissão</div>
                            </div>
                        </div>
                    </div>

                    {/* Metadata (Read Only) */}
                    {product && (
                        <div className="grid grid-cols-2 gap-4 text-xs text-slate-400">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                Criado em: {format(new Date(product.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </div>
                            {product.updatedAt && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-3 w-3" />
                                    Atualizado em: {format(new Date(product.updatedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                </div>
                            )}
                        </div>
                    )}
                </form>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="hover:bg-slate-100">
                        Cancelar
                    </Button>
                    <Button type="submit" onClick={form.handleSubmit(handleSubmit)} disabled={submitting} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md">
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {product ? "Salvar Alterações" : "Criar Produto"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
