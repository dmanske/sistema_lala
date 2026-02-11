"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
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
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/core/domain/Product";
import { UseFormReturn } from "react-hook-form";

interface PurchaseItemRowProps {
    index: number;
    form: UseFormReturn<any>;
    products: Product[];
    remove: (index: number) => void;
    fieldsCount: number;
}

export function PurchaseItemRow({ index, form, products, remove, fieldsCount }: PurchaseItemRowProps) {
    return (
        <Card className="border-white/20 bg-white/40 backdrop-blur-sm shadow-sm">
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
                            (form.watch(`items.${index}.quantity`) || 0) * (form.watch(`items.${index}.unitCost`) || 0)
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
                        disabled={fieldsCount === 1}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
