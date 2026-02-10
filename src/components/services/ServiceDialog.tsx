"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2, Calculator, Info } from "lucide-react";
import { toast } from "sonner";

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
import { CreateServiceSchema, CreateServiceInput, Service } from "@/core/domain/Service";
import { Separator } from "@/components/ui/separator";

interface ServiceDialogProps {
    service?: Service; // If provided, edit mode
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: CreateServiceInput) => Promise<void>;
}

export function ServiceDialog({ service, open, onOpenChange, onSubmit }: ServiceDialogProps) {
    const [submitting, setSubmitting] = useState(false);

    const form = useForm<CreateServiceInput>({
        resolver: zodResolver(CreateServiceSchema),
        defaultValues: {
            name: "",
            duration: 60,
            price: 0,
            cost: 0,
            commission: 0,
            profitAmount: 0,
            profitPercentage: 0
        },
    });

    // Reset form when service changes or dialog opens
    useEffect(() => {
        if (open) {
            if (service) {
                form.reset({
                    name: service.name,
                    duration: service.duration,
                    price: service.price,
                    cost: service.cost,
                    commission: service.commission,
                    profitAmount: service.profitAmount,
                    profitPercentage: service.profitPercentage,
                    netValue: service.netValue || (service.price - service.commission)
                });
            } else {
                form.reset({
                    name: "",
                    duration: 60,
                    price: 0,
                    cost: 0,
                    commission: 0,
                    profitAmount: 0,
                    profitPercentage: 0
                });
            }
        }
    }, [open, service, form]);

    // --- Auto Calculation Logic ---
    const cost = useWatch({ control: form.control, name: "cost" });
    const profitAmount = useWatch({ control: form.control, name: "profitAmount" });
    const profitPercentage = useWatch({ control: form.control, name: "profitPercentage" });
    const commission = useWatch({ control: form.control, name: "commission" });
    const price = useWatch({ control: form.control, name: "price" });

    // Internal flags to prevent infinite loops if we were using useEffects bi-directionally
    // But specific handlers for onChange are better. 
    // Since Shadcn Input uses react-hook-form register, we can't easily intercept onChange without Controller.
    // So we use useEffect with care or just simple imperative updates on specific field changes if possible, 
    // but Watch is passive.

    // Strategy: We will manual override the inputs to use `onChange` that triggers calcs.

    const calculatePrice = (c: number, p: number, com: number) => {
        // Price = Cost + Profit + Commission
        return parseFloat((c + p + com).toFixed(2));
    };

    const calculateProfitFromPrice = (pr: number, c: number, com: number) => {
        // Profit = Price - Cost - Commission
        return parseFloat((pr - c - com).toFixed(2));
    };

    const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value) || 0;
        form.setValue("cost", val);

        // Recalc Price based on current ProfitAmount
        const currentProfit = form.getValues("profitAmount");
        const currentComm = form.getValues("commission");
        const newPrice = calculatePrice(val, currentProfit, currentComm);

        form.setValue("price", newPrice);
        // Recalc Profit % if Cost > 0
        if (val > 0) {
            form.setValue("profitPercentage", parseFloat(((currentProfit / val) * 100).toFixed(2)));
        }
    };

    const handleProfitAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value) || 0;
        form.setValue("profitAmount", val);

        const currentCost = form.getValues("cost");
        const currentComm = form.getValues("commission");

        // Update Price
        const newPrice = calculatePrice(currentCost, val, currentComm);
        form.setValue("price", newPrice);

        // Update %
        if (currentCost > 0) {
            form.setValue("profitPercentage", parseFloat(((val / currentCost) * 100).toFixed(2)));
        }
    };

    const handleProfitPercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value) || 0;
        form.setValue("profitPercentage", val);

        const currentCost = form.getValues("cost");
        const currentComm = form.getValues("commission");

        // Calculate Amount from %
        const newProfitAmount = parseFloat(((currentCost * val) / 100).toFixed(2));
        form.setValue("profitAmount", newProfitAmount);

        // Update Price
        const newPrice = calculatePrice(currentCost, newProfitAmount, currentComm);
        form.setValue("price", newPrice);
    };

    const handleCommissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value) || 0;
        form.setValue("commission", val);

        // Update Price to maintain profit (Add commission on top)
        const currentCost = form.getValues("cost");
        const currentProfit = form.getValues("profitAmount");
        const newPrice = calculatePrice(currentCost, currentProfit, val);
        form.setValue("price", newPrice);
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value) || 0;
        form.setValue("price", val);

        // Backward calc: Update Profit Amount
        const currentCost = form.getValues("cost");
        const currentComm = form.getValues("commission");

        const newProfit = calculateProfitFromPrice(val, currentCost, currentComm);
        form.setValue("profitAmount", newProfit);

        if (currentCost > 0) {
            form.setValue("profitPercentage", parseFloat(((newProfit / currentCost) * 100).toFixed(2)));
        }
    };

    const handleSubmit = async (data: CreateServiceInput) => {
        setSubmitting(true);
        try {
            // Ensure netValue is set (Price - Commission)
            data.netValue = data.price - data.commission;
            await onSubmit(data);
            toast.success(service ? "Serviço atualizado!" : "Serviço criado!");
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar serviço");
        } finally {
            setSubmitting(false);
        }
    };

    // Calculate Net Value for Display
    const displayNetValue = (price || 0) - (commission || 0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] bg-slate-50/95 backdrop-blur-xl">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl font-heading text-slate-800 flex items-center gap-2">
                        {service ? <Calculator className="h-5 w-5 text-indigo-500" /> : <Plus className="h-5 w-5 text-indigo-500" />}
                        {service ? "Editar Serviço" : "Novo Serviço"}
                    </DialogTitle>
                    <DialogDescription>
                        Defina os detalhes e a precificação do serviço.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 space-y-4">
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">Informações Básicas</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome do Serviço</Label>
                                <Input
                                    id="name"
                                    placeholder="Ex: Corte Masculino"
                                    {...form.register("name")}
                                    className="bg-slate-50 border-slate-200"
                                />
                                {form.formState.errors.name && <span className="text-xs text-red-500">{form.formState.errors.name.message}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="duration">Duração (minutos)</Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    {...form.register("duration", { valueAsNumber: true })}
                                    className="bg-slate-50 border-slate-200"
                                />
                            </div>
                        </div>
                    </div>

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
                            <div className="space-y-2 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                                <Label htmlFor="price" className="text-indigo-700 font-bold text-lg">Preço de Venda</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 font-bold">R$</span>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        {...form.register("price", { valueAsNumber: true })}
                                        onChange={handlePriceChange}
                                        className="pl-10 h-12 text-2xl font-bold text-indigo-700 border-indigo-200 bg-white"
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
                </form>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="hover:bg-slate-100">
                        Cancelar
                    </Button>
                    <Button type="submit" onClick={form.handleSubmit(handleSubmit)} disabled={submitting} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md">
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {service ? "Salvar Alterações" : "Criar Serviço"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
