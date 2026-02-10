"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
import { CreateProductMovementSchema, CreateProductMovementInput, Product } from "@/core/domain/Product";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StockAdjustmentProps {
    product: Product;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: CreateProductMovementInput) => Promise<void>;
}

export function StockAdjustmentDialog({ product, open, onOpenChange, onSubmit }: StockAdjustmentProps) {
    const [submitting, setSubmitting] = useState(false);

    const form = useForm<CreateProductMovementInput>({
        resolver: zodResolver(CreateProductMovementSchema),
        defaultValues: {
            productId: product.id,
            type: "IN",
            quantity: 1,
            reason: "Ajuste de Estoque"
        },
    });

    useEffect(() => {
        if (open) {
            form.reset({
                productId: product.id,
                type: "IN",
                quantity: 1,
                reason: "Ajuste de Estoque"
            });
        }
    }, [open, product, form]);

    const handleSubmit = async (data: CreateProductMovementInput) => {
        setSubmitting(true);
        try {
            await onSubmit(data);
            toast.success("Estoque atualizado!");
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao atualizar estoque");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Ajuste de Estoque: {product.name}</DialogTitle>
                    <DialogDescription>
                        Registre entrada ou saída manual.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">
                            Tipo
                        </Label>
                        <Select
                            onValueChange={(val) => form.setValue("type", val as "IN" | "OUT")}
                            defaultValue={form.getValues("type")}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="IN">Entrada (+)</SelectItem>
                                <SelectItem value="OUT">Saída (-)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="quantity" className="text-right">
                            Quantidade
                        </Label>
                        <Input
                            id="quantity"
                            type="number"
                            min="1"
                            className="col-span-3"
                            {...form.register("quantity", { valueAsNumber: true })}
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="reason" className="text-right">
                            Motivo
                        </Label>
                        <Input
                            id="reason"
                            className="col-span-3"
                            {...form.register("reason")}
                        />
                    </div>
                </form>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button type="submit" onClick={form.handleSubmit(handleSubmit)} disabled={submitting}>
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirmar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
