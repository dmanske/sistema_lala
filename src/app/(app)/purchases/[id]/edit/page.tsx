"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Plus, ShoppingBag, ArrowLeft } from "lucide-react";

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
import { Alert, AlertDescription } from "@/components/ui/alert";

import { UpdatePurchaseSchema, Purchase } from "@/core/domain/Purchase";
import { getPurchaseRepository, getSupplierRepository, getProductRepository } from "@/infrastructure/repositories/factory";
import { Supplier } from "@/core/domain/Supplier";
import { Product } from "@/core/domain/Product";
import { PurchaseItemRow } from "@/components/purchases/PurchaseItemRow";

const FormSchema = UpdatePurchaseSchema;

export default function EditPurchasePage() {
    const params = useParams();
    const router = useRouter();
    const [purchase, setPurchase] = useState<Purchase | null>(null);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            date: "",
            notes: "",
            items: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    const purchaseRepo = getPurchaseRepository();
    const productRepo = getProductRepository();
    const supplierRepo = getSupplierRepository();

    useEffect(() => {
        const load = async () => {
            if (!params.id) return;
            
            try {
                const [p, s, prods] = await Promise.all([
                    purchaseRepo.getById(params.id as string),
                    supplierRepo.getAll({ status: 'ACTIVE' }),
                    productRepo.getAll()
                ]);

                if (!p) {
                    toast.error("Compra não encontrada");
                    router.push("/purchases");
                    return;
                }

                // Check if has payments
                if (p.payments && p.payments.length > 0) {
                    toast.error("Não é possível editar compra com pagamentos registrados");
                    router.push(`/purchases/${params.id}`);
                    return;
                }

                setPurchase(p);
                setSuppliers(s);
                setProducts(prods);

                // Set form values
                form.reset({
                    date: p.date,
                    notes: p.notes || "",
                    items: p.items?.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        unitCost: item.unitCost,
                    })) || [],
                });
            } catch (err) {
                console.error(err);
                toast.error("Erro ao carregar dados");
            } finally {
                setIsLoadingData(false);
            }
        };
        load();
    }, [params.id]);

    const watchItems = form.watch("items");
    const grandTotal = watchItems?.reduce((acc, item) => {
        const qty = Number(item.quantity) || 0;
        const cost = Number(item.unitCost) || 0;
        return acc + (qty * cost);
    }, 0) || 0;

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        if (!params.id) return;

        try {
            await purchaseRepo.update(params.id as string, data);
            toast.success("Compra atualizada com sucesso!");
            router.push(`/purchases/${params.id}`);
            router.refresh();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Erro ao atualizar compra");
        }
    }

    if (isLoadingData) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    if (!purchase) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-heading">Editar Compra</h1>
                    <p className="text-muted-foreground">Atualize os dados da entrada de estoque</p>
                </div>
            </div>

            <Alert className="bg-yellow-50 border-yellow-200">
                <AlertDescription className="text-sm text-yellow-800">
                    <strong>Atenção:</strong> Ao editar os itens, o estoque será ajustado automaticamente. 
                    As quantidades antigas serão revertidas e as novas serão aplicadas.
                </AlertDescription>
            </Alert>

            <div className="bg-card/50 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-lg shadow-purple-500/5">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <FormLabel className="text-sm font-semibold text-slate-700">Fornecedor</FormLabel>
                                <div className="mt-2 p-3 bg-slate-100 rounded-xl">
                                    <p className="font-medium text-slate-700">
                                        {suppliers.find(s => s.id === purchase.supplierId)?.name || "Fornecedor não encontrado"}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">Não é possível alterar o fornecedor</p>
                                </div>
                            </div>
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
                                Salvar Alterações
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
