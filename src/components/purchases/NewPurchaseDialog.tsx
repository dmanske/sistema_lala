"use client";

import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Plus, Package, CreditCard, Calendar, Clock, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
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
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

import { CreatePurchaseSchema } from "@/core/domain/Purchase";
import type { CreatePurchaseInput } from "@/core/domain/Purchase";

const PurchaseFormSchema = CreatePurchaseSchema.omit({
    paymentType: true,
    installmentsCount: true,
    firstDueDate: true,
    installmentInterval: true,
    bankAccountId: true,
    costCenterId: true,
    projectId: true,
});

type PurchaseFormInput = z.infer<typeof PurchaseFormSchema>;
import { CreatePurchaseWithInstallments } from "@/core/usecases/purchases/CreatePurchaseWithInstallments";
import { getPurchaseRepository, getSupplierRepository, getProductRepository, getAccountPayableRepository } from "@/infrastructure/repositories/factory";
import { Supplier } from "@/core/domain/Supplier";
import { Product } from "@/core/domain/Product";
import { PurchaseItemRow } from "./PurchaseItemRow";
import { AccountSelector } from "@/components/bank-accounts/AccountSelector";
import { CostCenterSelector } from "@/components/cost-centers/CostCenterSelector";
import { ProjectSelector } from "@/components/projects/ProjectSelector";

interface NewPurchaseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

const brl = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export function NewPurchaseDialog({ open, onOpenChange, onSuccess }: NewPurchaseDialogProps) {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isPaid, setIsPaid] = useState(false);
    const [bankAccountId, setBankAccountId] = useState<string>("");
    const [costCenterId, setCostCenterId] = useState<string>("");
    const [projectId, setProjectId] = useState<string>("");

    const [paymentType, setPaymentType] = useState<'single' | 'installment'>('single');
    const [installmentsCount, setInstallmentsCount] = useState(1);
    const [firstDueDate, setFirstDueDate] = useState<string>("");
    const [installmentInterval, setInstallmentInterval] = useState(30);
    const [installments, setInstallments] = useState<{ number: number; total: number; value: number; dueDate: string }[]>([]);

    const form = useForm<PurchaseFormInput>({
        resolver: zodResolver(PurchaseFormSchema),
        defaultValues: {
            supplierId: "",
            date: new Date().toISOString().split('T')[0],
            notes: "",
            items: [{ productId: "", quantity: 1, unitCost: 0 }],
            paymentMethod: "CASH",
            paidAmount: 0,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    const purchaseRepo = getPurchaseRepository();
    const productRepo = getProductRepository();
    const supplierRepo = getSupplierRepository();
    const accountPayableRepo = getAccountPayableRepository();
    const createUseCase = new CreatePurchaseWithInstallments(purchaseRepo, accountPayableRepo);

    useEffect(() => {
        if (open) {
            setIsLoadingData(true);
            const load = async () => {
                try {
                    const [s, p] = await Promise.all([
                        supplierRepo.getAll({ status: 'ACTIVE' }),
                        productRepo.getAll()
                    ]);
                    setSuppliers(s);
                    setProducts(p);
                } catch (err) {
                    console.error(err);
                    toast.error("Erro ao carregar dados.");
                } finally {
                    setIsLoadingData(false);
                }
            };
            load();
        }
    }, [open]);

    const watchItems = form.watch("items");
    const grandTotal = watchItems?.reduce((acc: number, item) => {
        const qty = Number(item.quantity) || 0;
        const cost = Number(item.unitCost) || 0;
        return acc + (qty * cost);
    }, 0) || 0;

    useEffect(() => {
        if (isPaid || !firstDueDate || paymentType === 'single') {
            setInstallments([]);
            return;
        }

        const count = paymentType === 'installment' ? installmentsCount : 1;
        const baseValue = Math.floor((grandTotal / count) * 100) / 100;
        const remainder = grandTotal - (baseValue * count);
        const newInstallments = [];

        for (let i = 0; i < count; i++) {
            const dueDate = new Date(firstDueDate);
            dueDate.setDate(dueDate.getDate() + (i * installmentInterval));
            const value = i === count - 1 ? baseValue + remainder : baseValue;
            newInstallments.push({
                number: i + 1,
                total: count,
                value,
                dueDate: dueDate.toISOString().split('T')[0],
            });
        }

        setInstallments(newInstallments);
    }, [isPaid, firstDueDate, paymentType, installmentsCount, grandTotal, installmentInterval]);

    const handleInstallmentDateChange = (index: number, newDate: string) => {
        setInstallments(prev => prev.map((inst, i) => i === index ? { ...inst, dueDate: newDate } : inst));
    };

    useEffect(() => {
        if (isPaid && form.getValues("paidAmount") === 0) {
            form.setValue("paidAmount", grandTotal);
        }
    }, [isPaid, grandTotal, form]);

    async function onSubmit(data: PurchaseFormInput) {
        try {
            if (isPaid && !bankAccountId) {
                toast.error("Selecione uma conta bancária para o pagamento");
                return;
            }

            if (!isPaid && !firstDueDate) {
                toast.error("Informe a data de vencimento");
                return;
            }

            if (!isPaid && paymentType === 'installment' && installmentsCount < 2) {
                toast.error("Para parcelar, informe pelo menos 2 parcelas");
                return;
            }

            const input: CreatePurchaseInput & {
                paymentType?: string;
                installmentsCount?: number;
                firstDueDate?: string;
                installmentInterval?: number;
                customInstallments?: typeof installments;
            } = {
                ...data,
                paymentMethod: isPaid ? data.paymentMethod : undefined,
                paidAmount: isPaid ? data.paidAmount : undefined,
                paidAt: isPaid ? new Date().toISOString() : undefined,
                bankAccountId: isPaid ? bankAccountId : undefined,
                costCenterId: costCenterId || undefined,
                projectId: projectId || undefined,
                paymentType: isPaid ? 'IMMEDIATE' : (paymentType === 'installment' ? 'INSTALLMENT' : 'SINGLE_DUE'),
                installmentsCount: !isPaid && paymentType === 'installment' ? installmentsCount : 1,
                firstDueDate: !isPaid ? firstDueDate : undefined,
                installmentInterval: !isPaid && paymentType === 'installment' ? installmentInterval : undefined,
                customInstallments: !isPaid && installments.length > 0 ? installments : undefined,
            };

            await createUseCase.execute(input);
            toast.success("Compra registrada com sucesso!");
            onOpenChange(false);
            onSuccess?.();
            form.reset();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao registrar compra.");
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] p-0 gap-0">
                {/* Header */}
                <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-emerald-50 to-white">
                    <DialogTitle className="text-xl font-bold flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                            <Package className="h-5 w-5 text-white" />
                        </div>
                        Nova Entrada de Estoque
                    </DialogTitle>
                    <DialogDescription className="ml-13">
                        Registre uma nova compra de produtos para o estoque
                    </DialogDescription>
                </DialogHeader>

                {isLoadingData ? (
                    <div className="px-6 py-10 flex flex-col items-center gap-4 text-slate-400">
                        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                        <p className="text-sm">Carregando fornecedores e produtos...</p>
                    </div>
                ) : (
                    <ScrollArea className="max-h-[calc(90vh-160px)]">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <div className="space-y-6 px-6 py-6">

                                    {/* Fornecedor e Data */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="supplierId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Fornecedor</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="rounded-xl">
                                                                <SelectValue placeholder="Selecione o fornecedor" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {suppliers.length === 0 ? (
                                                                <div className="p-4 text-sm text-muted-foreground text-center">
                                                                    Nenhum fornecedor ativo encontrado
                                                                </div>
                                                            ) : (
                                                                suppliers.map(s => (
                                                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="date"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Data da Compra</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" className="rounded-xl" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Centro de Custos e Projetos */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormItem>
                                            <FormLabel>Centro de Custos <span className="text-slate-400 font-normal">(Opcional)</span></FormLabel>
                                            <CostCenterSelector
                                                value={costCenterId}
                                                onValueChange={setCostCenterId}
                                                placeholder="Selecione um centro de custos"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Para despesas recorrentes (ex: Operacional, Estoque)
                                            </p>
                                        </FormItem>

                                        <FormItem>
                                            <FormLabel>Projeto <span className="text-slate-400 font-normal">(Opcional)</span></FormLabel>
                                            <ProjectSelector
                                                value={projectId}
                                                onValueChange={setProjectId}
                                                placeholder="Selecione um projeto"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Para investimentos pontuais (ex: Expansão, Reforma)
                                            </p>
                                        </FormItem>
                                    </div>

                                    {/* Itens */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-semibold text-slate-700">Itens da Compra</Label>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="rounded-xl h-8 text-xs gap-1.5"
                                                onClick={() => append({ productId: "", quantity: 1, unitCost: 0 })}
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                                Adicionar Item
                                            </Button>
                                        </div>
                                        <div className="space-y-2">
                                            {fields.map((field, index) => (
                                                <PurchaseItemRow
                                                    key={field.id}
                                                    index={index}
                                                    form={form}
                                                    products={products}
                                                    remove={remove}
                                                    fieldsCount={fields.length}
                                                />
                                            ))}
                                        </div>
                                        <div className="flex justify-end">
                                            <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-5 py-3 text-right">
                                                <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide">Total da Compra</p>
                                                <p className="text-2xl font-bold text-emerald-700 mt-0.5">
                                                    {brl(grandTotal)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Seção de Pagamento */}
                                    <div className="space-y-3">
                                        <Label className="text-sm font-semibold text-slate-700">Pagamento</Label>

                                        {/* Toggle Pago Agora / A Prazo */}
                                        <div className="flex rounded-xl border border-border p-1 bg-slate-100 gap-1">
                                            <button
                                                type="button"
                                                onClick={() => setIsPaid(true)}
                                                className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
                                                    isPaid
                                                        ? 'bg-white text-emerald-700 shadow-sm border border-emerald-100'
                                                        : 'text-slate-500 hover:text-slate-700'
                                                }`}
                                            >
                                                <CheckCircle2 className={`h-4 w-4 ${isPaid ? 'text-emerald-500' : 'text-slate-400'}`} />
                                                Pago Agora
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsPaid(false)}
                                                className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
                                                    !isPaid
                                                        ? 'bg-white text-amber-700 shadow-sm border border-amber-100'
                                                        : 'text-slate-500 hover:text-slate-700'
                                                }`}
                                            >
                                                <Clock className={`h-4 w-4 ${!isPaid ? 'text-amber-500' : 'text-slate-400'}`} />
                                                A Prazo
                                            </button>
                                        </div>

                                        {/* Pagamento Imediato */}
                                        {isPaid && (
                                            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-5 space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-7 w-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                                                        <CreditCard className="h-3.5 w-3.5 text-emerald-600" />
                                                    </div>
                                                    <p className="text-sm font-semibold text-emerald-800">Registrar saída no caixa</p>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="paymentMethod"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Forma de Pagamento</FormLabel>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger className="rounded-xl">
                                                                            <SelectValue placeholder="Selecione..." />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        <SelectItem value="CASH">Dinheiro</SelectItem>
                                                                        <SelectItem value="PIX">Pix</SelectItem>
                                                                        <SelectItem value="CARD">Cartão</SelectItem>
                                                                        <SelectItem value="TRANSFER">Transferência</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="paidAmount"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Valor Pago (R$)</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="number"
                                                                        step="0.01"
                                                                        className="rounded-xl"
                                                                        {...field}
                                                                        onChange={e => field.onChange(Number(e.target.value))}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <div className="md:col-span-2">
                                                        <FormItem>
                                                            <FormLabel>Conta de Origem <span className="text-red-500">*</span></FormLabel>
                                                            <AccountSelector
                                                                value={bankAccountId}
                                                                onValueChange={setBankAccountId}
                                                                placeholder="Selecione a conta"
                                                            />
                                                        </FormItem>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Pagamento a Prazo */}
                                        {!isPaid && (
                                            <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-5 space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-7 w-7 rounded-lg bg-amber-100 flex items-center justify-center">
                                                        <Calendar className="h-3.5 w-3.5 text-amber-600" />
                                                    </div>
                                                    <p className="text-sm font-semibold text-amber-800">Configurar vencimento</p>
                                                </div>

                                                {/* Toggle À Vista / Parcelado */}
                                                <div className="flex rounded-xl border border-amber-200 p-1 bg-amber-50 gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => setPaymentType('single')}
                                                        className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all ${
                                                            paymentType === 'single'
                                                                ? 'bg-white text-slate-800 shadow-sm'
                                                                : 'text-slate-500 hover:text-slate-600'
                                                        }`}
                                                    >
                                                        À Vista (1 vencimento)
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setPaymentType('installment')}
                                                        className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all ${
                                                            paymentType === 'installment'
                                                                ? 'bg-white text-slate-800 shadow-sm'
                                                                : 'text-slate-500 hover:text-slate-600'
                                                        }`}
                                                    >
                                                        Parcelado
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                        <Label className="text-xs font-medium text-slate-600">
                                                            {paymentType === 'single' ? 'Data de Vencimento' : '1º Vencimento'} <span className="text-red-500">*</span>
                                                        </Label>
                                                        <Input
                                                            type="date"
                                                            value={firstDueDate}
                                                            onChange={(e) => setFirstDueDate(e.target.value)}
                                                            className="mt-1 rounded-xl"
                                                        />
                                                    </div>

                                                    {paymentType === 'installment' && (
                                                        <>
                                                            <div>
                                                                <Label className="text-xs font-medium text-slate-600">Nº de Parcelas</Label>
                                                                <Input
                                                                    type="number"
                                                                    min="2"
                                                                    max="12"
                                                                    value={installmentsCount}
                                                                    onChange={(e) => setInstallmentsCount(Number(e.target.value))}
                                                                    className="mt-1 rounded-xl"
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label className="text-xs font-medium text-slate-600">Intervalo (dias)</Label>
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    value={installmentInterval}
                                                                    onChange={(e) => setInstallmentInterval(Number(e.target.value))}
                                                                    className="mt-1 rounded-xl"
                                                                />
                                                            </div>
                                                        </>
                                                    )}
                                                </div>

                                                {installments.length > 0 && (
                                                    <div className="bg-white rounded-xl border border-amber-100 overflow-hidden">
                                                        <div className="px-4 py-2.5 bg-amber-50/70 border-b border-amber-100">
                                                            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                                                                {installments.length} parcelas a criar
                                                            </p>
                                                        </div>
                                                        <div className="divide-y divide-slate-50">
                                                            {installments.map((inst, idx) => (
                                                                <div key={inst.number} className="flex items-center gap-3 px-4 py-2.5">
                                                                    <span className="text-xs font-semibold text-slate-400 w-10 shrink-0">
                                                                        {inst.number}/{inst.total}
                                                                    </span>
                                                                    <span className="text-sm font-bold text-slate-700 w-24 shrink-0">
                                                                        {brl(inst.value)}
                                                                    </span>
                                                                    <div className="flex items-center gap-1.5 ml-auto">
                                                                        <span className="text-xs text-slate-400">Venc.</span>
                                                                        <Input
                                                                            type="date"
                                                                            value={inst.dueDate}
                                                                            onChange={(e) => handleInstallmentDateChange(idx, e.target.value)}
                                                                            className="h-7 rounded-lg text-xs px-2 w-36 border-slate-200"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Observações */}
                                    <FormField
                                        control={form.control}
                                        name="notes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Observações <span className="text-slate-400 font-normal">(Opcional)</span></FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Observações adicionais..."
                                                        className="resize-none rounded-xl"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Footer */}
                                <div className="sticky bottom-0 flex items-center justify-between gap-3 px-6 py-4 border-t bg-white/95 backdrop-blur-sm">
                                    <div className="text-sm text-slate-500">
                                        Total: <span className="font-bold text-slate-800">{brl(grandTotal)}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" type="button" onClick={() => onOpenChange(false)} className="rounded-xl">
                                            Cancelar
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={form.formState.isSubmitting}
                                            className="rounded-xl px-6 bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg shadow-emerald-200 hover:shadow-emerald-300"
                                        >
                                            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Salvar Entrada
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </Form>
                    </ScrollArea>
                )}
            </DialogContent>
        </Dialog>
    );
}
