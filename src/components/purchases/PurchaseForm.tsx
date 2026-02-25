"use client";

import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, ShoppingBag, CreditCard } from "lucide-react";

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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { CreatePurchaseSchema } from "@/core/domain/Purchase";
import { CreatePurchaseWithInstallments } from "@/core/usecases/purchases/CreatePurchaseWithInstallments";
import { getPurchaseRepository, getSupplierRepository, getProductRepository, getAccountPayableRepository } from "@/infrastructure/repositories/factory";
import { Supplier } from "@/core/domain/Supplier";
import { Product } from "@/core/domain/Product";
import { PurchaseItemRow } from "./PurchaseItemRow";
import { AccountSelector } from "@/components/bank-accounts/AccountSelector";
import { CostCenterSelector } from "@/components/cost-centers/CostCenterSelector";
import { ProjectSelector } from "@/components/projects/ProjectSelector";

const FormSchema = CreatePurchaseSchema;

export function PurchaseForm() {
    const router = useRouter();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isPaid, setIsPaid] = useState(false);
    const [bankAccountId, setBankAccountId] = useState<string>("");
    const [costCenterId, setCostCenterId] = useState<string>("");
    const [projectId, setProjectId] = useState<string>("");

    // Installment states
    const [paymentType, setPaymentType] = useState<'single' | 'installment'>('single');
    const [installmentsCount, setInstallmentsCount] = useState(1);
    const [firstDueDate, setFirstDueDate] = useState<string>("");
    const [installmentInterval, setInstallmentInterval] = useState(30);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema) as any,
        defaultValues: {
            supplierId: "",
            date: new Date().toISOString().split('T')[0],
            notes: "",
            items: [{ productId: "", quantity: 1, unitCost: 0 }],
            paymentMethod: "CASH" as any,
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
    }, []);

    const watchItems = form.watch("items");
    const grandTotal = watchItems?.reduce((acc, item) => {
        const qty = Number(item.quantity) || 0;
        const cost = Number(item.unitCost) || 0;
        return acc + (qty * cost);
    }, 0) || 0;

    // Calculate installments preview
    const installmentsPreview = React.useMemo(() => {
        if (isPaid || !firstDueDate || paymentType === 'single') {
            return [];
        }

        const count = paymentType === 'installment' ? installmentsCount : 1;
        const installments = [];
        const baseValue = Math.floor((grandTotal / count) * 100) / 100;
        const remainder = grandTotal - (baseValue * count);

        for (let i = 0; i < count; i++) {
            const dueDate = new Date(firstDueDate);
            dueDate.setDate(dueDate.getDate() + (i * installmentInterval));

            const value = i === count - 1 ? baseValue + remainder : baseValue;

            installments.push({
                number: i + 1,
                total: count,
                value,
                dueDate: dueDate.toISOString().split('T')[0],
            });
        }

        return installments;
    }, [isPaid, firstDueDate, paymentType, installmentsCount, grandTotal, installmentInterval]);

    useEffect(() => {
        if (isPaid && form.getValues("paidAmount") === 0) {
            form.setValue("paidAmount", grandTotal);
        }
    }, [isPaid, grandTotal, form]);

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        try {
            // Validate bank account if payment is being made
            if (isPaid && !bankAccountId) {
                toast.error("Selecione uma conta bancária para o pagamento");
                return;
            }

            // Validate installment fields if not paying immediately
            if (!isPaid && !firstDueDate) {
                toast.error("Informe a data de vencimento");
                return;
            }

            if (!isPaid && paymentType === 'installment' && installmentsCount < 2) {
                toast.error("Para parcelar, informe pelo menos 2 parcelas");
                return;
            }

            const input = {
                ...data,
                paymentMethod: isPaid ? data.paymentMethod : undefined,
                paidAmount: isPaid ? data.paidAmount : undefined,
                paidAt: isPaid ? new Date().toISOString() : undefined,
                bankAccountId: isPaid ? bankAccountId : undefined,
                costCenterId: costCenterId || undefined,
                projectId: projectId || undefined,
                // Installment data
                paymentType: (isPaid ? 'IMMEDIATE' : (paymentType === 'installment' ? 'INSTALLMENT' : 'SINGLE_DUE')) as "IMMEDIATE" | "SINGLE_DUE" | "INSTALLMENT",
                installmentsCount: !isPaid && paymentType === 'installment' ? installmentsCount : 1,
                firstDueDate: !isPaid ? firstDueDate : undefined,
                installmentInterval: !isPaid && paymentType === 'installment' ? installmentInterval : undefined,
            };

            await createUseCase.execute(input);
            toast.success("Compra registrada com sucesso!");
            router.push("/purchases");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao registrar compra.");
        }
    }

    if (isLoadingData) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="supplierId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-semibold text-slate-700">Fornecedor</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="h-11 rounded-xl bg-white/50 border-white/20">
                                            <SelectValue placeholder="Selecione o fornecedor" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="rounded-xl border-white/20 bg-white/80 backdrop-blur-xl">
                                        {suppliers.length === 0 ? (
                                            <div className="p-4 text-sm text-muted-foreground text-center">
                                                Nenhum fornecedor ativo encontrado.
                                                <br />
                                                <a href="/suppliers" className="text-primary underline">
                                                    Cadastre um fornecedor
                                                </a>
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
                                <FormLabel className="text-sm font-semibold text-slate-700">Data da Compra</FormLabel>
                                <FormControl>
                                    <Input type="date" className="h-11 rounded-xl bg-white/50 border-white/20 focus:bg-white" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-700">Centro de Custos (Opcional)</FormLabel>
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
                        <FormLabel className="text-sm font-semibold text-slate-700">Projeto (Opcional)</FormLabel>
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

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-heading font-semibold flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4 text-primary" />
                            Itens da Compra
                        </h3>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => append({ productId: "", quantity: 1, unitCost: 0 })}
                            className="bg-white/40 border-primary/20 text-primary"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Adicionar Item
                        </Button>
                    </div>
                    <div className="space-y-3">
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
                    <div className="flex justify-end pt-4 bg-white/20 p-4 rounded-xl border border-white/10">
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Total da Compra</p>
                            <p className="text-2xl font-bold text-primary">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(grandTotal)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base font-semibold flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-primary" />
                                Registrar Pagamento (Sair do Caixa)
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Se ativado, registrará uma saída imediata no livro de caixa.
                            </p>
                        </div>
                        <Checkbox
                            id="isPaid"
                            checked={isPaid}
                            onCheckedChange={(checked) => setIsPaid(checked === true)}
                        />
                    </div>

                    {isPaid && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <FormField
                                control={form.control}
                                name="paymentMethod"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Forma de Pagamento</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-10 rounded-xl">
                                                    <SelectValue placeholder="Selecione..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-xl">
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
                                        <FormLabel className="text-xs">Valor Pago (R$)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                className="h-10 rounded-xl"
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
                                    <FormLabel className="text-xs">Conta de Origem *</FormLabel>
                                    <AccountSelector
                                        value={bankAccountId}
                                        onValueChange={setBankAccountId}
                                        placeholder="Selecione a conta"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Selecione de onde o dinheiro será retirado
                                    </p>
                                </FormItem>
                            </div>
                        </div>
                    )}
                </div>

                {!isPaid && (
                    <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-200 space-y-6">
                        <div className="space-y-0.5">
                            <Label className="text-base font-semibold flex items-center gap-2">
                                📅 Pagamento a Prazo
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Configure como será o pagamento desta compra (boleto, prazo, parcelado, etc)
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="paymentType"
                                        checked={paymentType === 'single'}
                                        onChange={() => setPaymentType('single')}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm font-medium">À Vista (1 vencimento)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="paymentType"
                                        checked={paymentType === 'installment'}
                                        onChange={() => setPaymentType('installment')}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm font-medium">Parcelado</span>
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label className="text-xs">Data de Vencimento *</Label>
                                    <Input
                                        type="date"
                                        value={firstDueDate}
                                        onChange={(e) => setFirstDueDate(e.target.value)}
                                        className="h-10 rounded-xl mt-1"
                                    />
                                </div>

                                {paymentType === 'installment' && (
                                    <>
                                        <div>
                                            <Label className="text-xs">Número de Parcelas</Label>
                                            <Input
                                                type="number"
                                                min="2"
                                                max="12"
                                                value={installmentsCount}
                                                onChange={(e) => setInstallmentsCount(Number(e.target.value))}
                                                className="h-10 rounded-xl mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Intervalo (dias)</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={installmentInterval}
                                                onChange={(e) => setInstallmentInterval(Number(e.target.value))}
                                                className="h-10 rounded-xl mt-1"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            {installmentsPreview.length > 0 && (
                                <div className="bg-white p-4 rounded-xl border border-amber-200">
                                    <p className="text-sm font-semibold mb-3">Parcelas que serão criadas:</p>
                                    <div className="space-y-2">
                                        {installmentsPreview.map((inst) => (
                                            <div key={inst.number} className="flex justify-between items-center text-sm">
                                                <span className="text-muted-foreground">
                                                    {inst.number}/{inst.total}
                                                </span>
                                                <span className="font-medium">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(inst.value)}
                                                </span>
                                                <span className="text-muted-foreground">
                                                    Venc: {new Date(inst.dueDate).toLocaleDateString('pt-BR')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-semibold text-slate-700">Observações</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Observações adicionais..." className="resize-none rounded-xl" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <Button variant="ghost" type="button" onClick={() => router.back()} className="h-11 rounded-xl">
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={form.formState.isSubmitting} className="h-11 rounded-xl px-10 shadow-lg shadow-primary/20">
                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Compra
                    </Button>
                </div>
            </form>
        </Form>
    );
}
