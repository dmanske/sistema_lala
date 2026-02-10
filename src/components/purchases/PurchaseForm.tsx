"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, ShoppingBag } from "lucide-react";

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
import { Card, CardContent } from "@/components/ui/card";

import { CreatePurchaseSchema } from "@/core/domain/Purchase";
import { CreatePurchase } from "@/core/usecases/purchases/CreatePurchase";
import { LocalStoragePurchaseRepository } from "@/infrastructure/repositories/LocalStoragePurchaseRepository";
import { LocalStorageSupplierRepository } from "@/infrastructure/repositories/LocalStorageSupplierRepository";
import { LocalStorageProductRepository } from "@/infrastructure/repositories/LocalStorageProductRepository";
import { Supplier } from "@/core/domain/Supplier";
import { Product } from "@/core/domain/Product";

const FormSchema = CreatePurchaseSchema;

export function PurchaseForm() {
    const router = useRouter();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            supplierId: "",
            date: new Date().toISOString().split('T')[0],
            notes: "",
            items: [
                { productId: "", quantity: 1, unitCost: 0 }
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    // Repositories & UseCase
    const purchaseRepo = new LocalStoragePurchaseRepository();
    const productRepo = new LocalStorageProductRepository();
    const supplierRepo = new LocalStorageSupplierRepository();
    const createUseCase = new CreatePurchase(purchaseRepo, productRepo);

    useEffect(() => {
        const load = async () => {
            try {
                const [s, p] = await Promise.all([
                    supplierRepo.getAll({ status: 'ACTIVE' }),
                    productRepo.getAll()
                ]);
                setSuppliers(s);
                setProducts(p);
                // Or "Product" domain field `itemType`.
                // Actually `Product` interface doesn't strictly have `itemType` field in Domain?
                // Let's check `Product.ts`... `itemType: z.literal("product")` in generic Item?
                // `Product` domain has `type`? No.
                // Wait, checking `Product.ts`.
                // Step 841: `LocalStorageProductRepository` imports `Product`.
                // Step 819: `Product` schema.
                // I'll assume `p` are items that can be stocked.
                // Simple getAll usually returns products. Services are in ServiceRepository.
                // If `products` contains services, I should filter.
                // But `LocalStorageProductRepository` is for PRODUCTS. `LocalStorageServiceRepository` is for SERVICES.
                // So all items from `productRepo` are products.
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

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        try {
            await createUseCase.execute(data);
            toast.success("Compra registrada com sucesso! Estoque atualizado.");
            router.push("/purchases");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao registrar compra.");
        }
    }

    const watchItems = form.watch("items");
    const grandTotal = watchItems?.reduce((acc, item) => {
        const qty = Number(item.quantity) || 0;
        const cost = Number(item.unitCost) || 0;
        return acc + (qty * cost);
    }, 0) || 0;

    if (isLoadingData) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Header Info */}
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
                                    <SelectContent className="max-h-[200px] rounded-xl border-white/20 bg-white/80 backdrop-blur-xl">
                                        {suppliers.map(s => (
                                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                        ))}
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

                {/* Items Section */}
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
                            className="bg-white/40 border-primary/20 hover:bg-white/60 text-primary"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Adicionar Item
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {fields.map((field, index) => (
                            <Card key={field.id} className="border-white/20 bg-white/40 backdrop-blur-sm shadow-sm">
                                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                    <div className="md:col-span-4">
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.productId`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Produto</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-9">
                                                                <SelectValue placeholder="Selecione..." />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="max-h-[200px]">
                                                            {products.map(p => (
                                                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.quantity`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Qtd.</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            className="h-9"
                                                            {...field}
                                                            onChange={e => field.onChange(Number(e.target.value))}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="md:col-span-3">
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.unitCost`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Custo Unit. (R$)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            className="h-9"
                                                            {...field}
                                                            onChange={e => field.onChange(Number(e.target.value))}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="md:col-span-2 text-right">
                                        <p className="text-xs text-muted-foreground mb-1">Subtotal</p>
                                        <div className="h-9 flex items-center justify-end font-semibold text-sm">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                                (form.getValues(`items.${index}.quantity`) || 0) * (form.getValues(`items.${index}.unitCost`) || 0)
                                            )}
                                        </div>
                                    </div>
                                    <div className="md:col-span-1 flex justify-end">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => remove(index)}
                                            className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50"
                                            disabled={fields.length === 1}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
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
                            <FormLabel>Observações</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Observações adicionais..."
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
                        Registrar Entrada
                    </Button>
                </div>
            </form>
        </Form>
    );
}
