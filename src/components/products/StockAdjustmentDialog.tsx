"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowUpCircle, ArrowDownCircle, AlertCircle } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StockAdjustmentProps {
    product: Product;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: CreateProductMovementInput) => Promise<void>;
}

const MOVEMENT_REASONS = {
    IN: [
        { value: "Compra/Reposição", label: "Compra / Reposição" },
        { value: "Devolução de Cliente", label: "Devolução de Cliente" },
        { value: "Ajuste de Inventário", label: "Ajuste de Inventário (+)" },
        { value: "Outro", label: "Outro (especificar)" },
    ],
    OUT: [
        { value: "Uso em Atendimento", label: "Uso em Atendimento" },
        { value: "Perda/Avaria", label: "Perda / Avaria" },
        { value: "Ajuste de Inventário", label: "Ajuste de Inventário (-)" },
        { value: "Outro", label: "Outro (especificar)" },
    ],
};

export function StockAdjustmentDialog({ product, open, onOpenChange, onSubmit }: StockAdjustmentProps) {
    const [submitting, setSubmitting] = useState(false);
    const [movementType, setMovementType] = useState<"IN" | "OUT">("IN");
    const [selectedReason, setSelectedReason] = useState("Compra/Reposição");
    const [customReason, setCustomReason] = useState("");

    const form = useForm<CreateProductMovementInput>({
        resolver: zodResolver(CreateProductMovementSchema) as any,
        defaultValues: {
            productId: product.id,
            type: "IN",
            quantity: 1,
            reason: "Compra/Reposição"
        },
    });

    useEffect(() => {
        if (open) {
            setMovementType("IN");
            setSelectedReason("Compra/Reposição");
            setCustomReason("");
            form.reset({
                productId: product.id,
                type: "IN",
                quantity: 1,
                reason: "Compra/Reposição"
            });
        }
    }, [open, product, form]);

    const handleTypeChange = (val: "IN" | "OUT") => {
        setMovementType(val);
        form.setValue("type", val);
        const defaultReason = val === "IN" ? "Compra/Reposição" : "Uso em Atendimento";
        setSelectedReason(defaultReason);
        setCustomReason("");
        form.setValue("reason", defaultReason);
    };

    const handleReasonChange = (val: string) => {
        setSelectedReason(val);
        if (val !== "Outro") {
            form.setValue("reason", val);
            setCustomReason("");
        } else {
            // Set a placeholder so zod validation passes; will be replaced in handleSubmit
            form.setValue("reason", customReason || "Outro");
        }
    };

    const handleSubmit = async (data: CreateProductMovementInput) => {
        // Validar motivo
        const finalReason = selectedReason === "Outro" ? customReason.trim() : selectedReason;
        if (!finalReason) {
            toast.error("Motivo é obrigatório para movimentações de estoque.");
            return;
        }
        data.reason = finalReason;

        // Validar estoque para saídas
        if (data.type === "OUT" && data.quantity > product.currentStock) {
            toast.error(`Estoque insuficiente. Disponível: ${product.currentStock} un.`);
            return;
        }

        setSubmitting(true);
        try {
            await onSubmit(data);
            toast.success(
                data.type === "IN"
                    ? `+${data.quantity} un adicionada(s) ao estoque`
                    : `-${data.quantity} un removida(s) do estoque`
            );
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao registrar movimentação");
        } finally {
            setSubmitting(false);
        }
    };

    const quantity = form.watch("quantity") || 0;
    const newStock = movementType === "IN"
        ? product.currentStock + quantity
        : product.currentStock - quantity;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-slate-50/95 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="text-lg font-heading flex items-center gap-2">
                        {movementType === "IN" ? (
                            <ArrowUpCircle className="h-5 w-5 text-emerald-500" />
                        ) : (
                            <ArrowDownCircle className="h-5 w-5 text-red-500" />
                        )}
                        Movimentação de Estoque
                    </DialogTitle>
                    <DialogDescription>
                        <span className="font-medium text-slate-700">{product.name}</span>
                        <span className="mx-2">•</span>
                        Estoque atual: <Badge variant="outline" className="ml-1">{product.currentStock} un</Badge>
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
                    {/* Tipo de Movimentação */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => handleTypeChange("IN")}
                            className={cn(
                                "flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all font-medium",
                                movementType === "IN"
                                    ? "border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm"
                                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                            )}
                        >
                            <ArrowUpCircle className="h-5 w-5" />
                            Entrada (+)
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTypeChange("OUT")}
                            className={cn(
                                "flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all font-medium",
                                movementType === "OUT"
                                    ? "border-red-400 bg-red-50 text-red-700 shadow-sm"
                                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                            )}
                        >
                            <ArrowDownCircle className="h-5 w-5" />
                            Saída (-)
                        </button>
                    </div>

                    {/* Quantidade */}
                    <div className="space-y-2">
                        <Label htmlFor="quantity" className="font-medium">Quantidade</Label>
                        <Input
                            id="quantity"
                            type="number"
                            min="1"
                            className="h-12 text-lg font-bold text-center bg-white border-slate-200"
                            {...form.register("quantity", { valueAsNumber: true })}
                        />
                    </div>

                    {/* Motivo */}
                    <div className="space-y-2">
                        <Label className="font-medium flex items-center gap-1">
                            Motivo <span className="text-red-500">*</span>
                        </Label>
                        <Select value={selectedReason} onValueChange={handleReasonChange}>
                            <SelectTrigger className="bg-white border-slate-200">
                                <SelectValue placeholder="Selecione o motivo..." />
                            </SelectTrigger>
                            <SelectContent>
                                {MOVEMENT_REASONS[movementType].map(r => (
                                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {selectedReason === "Outro" && (
                            <Input
                                placeholder="Descreva o motivo..."
                                value={customReason}
                                onChange={(e) => {
                                    setCustomReason(e.target.value);
                                    form.setValue("reason", e.target.value || "Outro");
                                }}
                                className="bg-white border-slate-200"
                                autoFocus
                            />
                        )}
                    </div>

                    {/* Preview */}
                    <div className={cn(
                        "p-4 rounded-xl border-2 border-dashed",
                        newStock <= product.minStock
                            ? "border-amber-300 bg-amber-50/50"
                            : "border-slate-200 bg-white/50"
                    )}>
                        <div className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">
                            Prévia do Estoque
                        </div>
                        <div className="flex items-center justify-center gap-4">
                            <div className="text-center">
                                <div className="text-sm text-slate-500">Atual</div>
                                <div className="text-2xl font-bold text-slate-700">{product.currentStock}</div>
                            </div>
                            <div className={cn(
                                "text-xl font-bold",
                                movementType === "IN" ? "text-emerald-500" : "text-red-500"
                            )}>
                                {movementType === "IN" ? "+" : "-"}{quantity}
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-slate-500">Novo</div>
                                <div className={cn(
                                    "text-2xl font-bold",
                                    newStock <= product.minStock ? "text-amber-600" : "text-emerald-600"
                                )}>{newStock}</div>
                            </div>
                        </div>
                        {newStock <= product.minStock && newStock > 0 && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-amber-600 justify-center">
                                <AlertCircle className="h-3 w-3" />
                                Estoque ficará abaixo do mínimo ({product.minStock})
                            </div>
                        )}
                        {newStock < 0 && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-red-600 justify-center font-bold">
                                <AlertCircle className="h-3 w-3" />
                                Estoque ficará NEGATIVO!
                            </div>
                        )}
                    </div>
                </form>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="hover:bg-slate-100">
                        Cancelar
                    </Button>
                    <Button
                        onClick={form.handleSubmit(handleSubmit)}
                        disabled={submitting}
                        className={cn(
                            "text-white shadow-md",
                            movementType === "IN"
                                ? "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                                : "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
                        )}
                    >
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirmar Movimentação
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
