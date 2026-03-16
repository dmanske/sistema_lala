"use client";

import { UsageProduct } from "@/core/domain/UsageProduct";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Droplets, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface UsageProductCardProps {
    product: UsageProduct;
    onEdit: (product: UsageProduct) => void;
    onDelete: (id: string, name: string) => void;
    onReset: (product: UsageProduct) => void;
}

export function UsageProductCard({ product, onEdit, onDelete, onReset }: UsageProductCardProps) {
    const percentage = product.contentAmount > 0
        ? Math.min((product.currentConsumed / product.contentAmount) * 100, 100)
        : 0;

    const remaining = Math.max(product.contentAmount - product.currentConsumed, 0);

    const getStatusColor = () => {
        if (percentage >= 90) return { bg: "bg-red-500", light: "bg-red-100", text: "text-red-700", border: "border-red-200" };
        if (percentage >= 70) return { bg: "bg-orange-500", light: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" };
        if (percentage >= 50) return { bg: "bg-amber-500", light: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" };
        return { bg: "bg-emerald-500", light: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" };
    };

    const status = getStatusColor();

    return (
        <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-white border-slate-100 rounded-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-400 via-cyan-500 to-teal-400 bg-[length:200%_100%]" />

            <CardHeader className="p-4 pb-2 relative">
                <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-xl flex items-center justify-center ring-2 bg-gradient-to-br from-teal-500 to-cyan-600 ring-teal-100 group-hover:ring-teal-200 transition-all">
                        <Droplets className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base text-slate-800 line-clamp-2 break-words tracking-tight mb-0.5 group-hover:text-teal-600 transition-colors">
                            {product.name}
                        </h3>
                        <p className="text-xs text-slate-500">
                            {product.contentAmount}{product.measurementUnit} por {product.unitLabel}
                        </p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-2 space-y-3 relative">
                {/* Barra de progresso */}
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                        <span className={cn("font-bold", status.text)}>
                            {product.currentConsumed.toFixed(1)}{product.measurementUnit} / {product.contentAmount}{product.measurementUnit}
                        </span>
                        <span className="text-slate-500 font-medium">{percentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={cn("h-full rounded-full transition-all duration-500", status.bg)}
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                    <p className="text-[11px] text-slate-500">
                        {remaining > 0
                            ? `Faltam ${remaining.toFixed(1)}${product.measurementUnit} para acabar o ${product.unitLabel}`
                            : `${product.unitLabel} acabou!`
                        }
                    </p>
                </div>

                {/* Info */}
                <div className="grid grid-cols-3 gap-2">
                    <div className={cn("flex items-center gap-2 p-2 rounded-lg border", status.light, status.border)}>
                        <div className="flex-1">
                            <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'inherit' }}>
                                Em estoque
                            </div>
                            <div className="text-sm font-bold text-slate-700">
                                {product.stockQuantity ?? 0} {product.unitLabel}{(product.stockQuantity ?? 0) !== 1 ? 's' : ''}
                            </div>
                        </div>
                    </div>
                    <div className={cn("flex items-center gap-2 p-2 rounded-lg border", status.light, status.border)}>
                        <div className="flex-1">
                            <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'inherit' }}>
                                Consumidos
                            </div>
                            <div className="text-sm font-bold text-slate-700">
                                {product.totalUnitsConsumed} {product.unitLabel}{product.totalUnitsConsumed !== 1 ? 's' : ''}
                            </div>
                        </div>
                    </div>
                    <div className={cn("flex items-center gap-2 p-2 rounded-lg border bg-violet-50 border-violet-200")}>
                        <div className="flex-1">
                            <div className="text-[9px] font-bold uppercase tracking-wider text-violet-600">
                                Clientes
                            </div>
                            <div className="text-sm font-bold text-slate-700">
                                {product.distinctClients ?? 0}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ações */}
                <div className="pt-1 flex items-center justify-end gap-2">
                    {product.currentConsumed > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg"
                            onClick={(e) => { e.stopPropagation(); onReset(product); }}
                        >
                            <RotateCcw className="h-3.5 w-3.5 mr-1" />
                            Novo {product.unitLabel}
                        </Button>
                    )}
                    <Button
                        variant="ghost" size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg"
                        onClick={(e) => { e.stopPropagation(); onEdit(product); }}
                    >
                        <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost" size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        onClick={(e) => { e.stopPropagation(); onDelete(product.id, product.name); }}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
