"use client";

import { useState } from "react";
import { UsageProduct, UsageProductLog } from "@/core/domain/UsageProduct";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Droplets, RotateCcw, History, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type LogWithClient = UsageProductLog & { clientName?: string; professionalName?: string };

interface UsageProductCardProps {
    product: UsageProduct;
    onEdit: (product: UsageProduct) => void;
    onDelete: (id: string, name: string) => void;
    onReset: (product: UsageProduct) => void;
    onLoadHistory?: (productId: string) => Promise<LogWithClient[]>;
}

export function UsageProductCard({ product, onEdit, onDelete, onReset, onLoadHistory }: UsageProductCardProps) {
    const [showHistory, setShowHistory] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [tubeHistory, setTubeHistory] = useState<Map<number, LogWithClient[]> | null>(null);

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

    const handleToggleHistory = async () => {
        if (showHistory) {
            setShowHistory(false);
            return;
        }
        if (!tubeHistory && onLoadHistory) {
            setHistoryLoading(true);
            try {
                const logs = await onLoadHistory(product.id);
                const grouped = new Map<number, LogWithClient[]>();
                for (const log of logs) {
                    const tube = log.tubeNumber ?? 1;
                    if (!grouped.has(tube)) grouped.set(tube, []);
                    grouped.get(tube)!.push(log);
                }
                setTubeHistory(grouped);
            } catch (e) {
                console.error(e);
            } finally {
                setHistoryLoading(false);
            }
        }
        setShowHistory(true);
    };

    // Calcula o número do tubo atual
    const currentTubeNumber = product.totalUnitsConsumed + 1;

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
                                Clientes (tubo)
                            </div>
                            <div className="text-sm font-bold text-slate-700">
                                {product.currentTubeClients ?? 0}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ações */}
                <div className="pt-1 flex items-center justify-between gap-2">
                    <div>
                        {onLoadHistory && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg"
                                onClick={(e) => { e.stopPropagation(); handleToggleHistory(); }}
                                disabled={historyLoading}
                            >
                                {historyLoading ? (
                                    <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                                ) : (
                                    <History className="h-3.5 w-3.5 mr-1" />
                                )}
                                Histórico
                                {showHistory ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                            </Button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
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
                </div>

                {/* Histórico por Tubo */}
                {showHistory && tubeHistory && (
                    <div className="border-t border-slate-100 pt-3 space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Histórico por {product.unitLabel}
                        </p>
                        {Array.from(tubeHistory.entries())
                            .sort(([a], [b]) => b - a)
                            .map(([tubeNum, logs]) => {
                                const isCurrentTube = tubeNum === currentTubeNumber;
                                const totalUsed = logs.reduce((s, l) => s + l.amountUsed, 0);
                                const distinctClients = new Set(logs.filter(l => l.clientId).map(l => l.clientName || l.clientId)).size;
                                const clientNames = [...new Set(logs.filter(l => l.clientName).map(l => l.clientName!))];

                                return (
                                    <div
                                        key={tubeNum}
                                        className={cn(
                                            "p-3 rounded-xl border text-sm",
                                            isCurrentTube
                                                ? "bg-teal-50/50 border-teal-200"
                                                : "bg-slate-50/50 border-slate-200"
                                        )}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className={cn(
                                                    "text-xs font-bold px-2 py-0.5 rounded-full",
                                                    isCurrentTube
                                                        ? "bg-teal-100 text-teal-700"
                                                        : "bg-slate-200 text-slate-600"
                                                )}>
                                                    {product.unitLabel} {tubeNum}
                                                    {isCurrentTube && " (atual)"}
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                    {logs.length} uso{logs.length !== 1 ? "s" : ""}
                                                </span>
                                            </div>
                                            <span className="text-xs font-bold text-slate-600">
                                                {totalUsed.toFixed(0)}{product.measurementUnit}
                                            </span>
                                        </div>
                                        {clientNames.length > 0 && (
                                            <p className="text-xs text-slate-500 mt-1">
                                                👤 {clientNames.join(", ")}
                                            </p>
                                        )}
                                        {logs.length > 0 && (
                                            <p className="text-[10px] text-slate-400 mt-1">
                                                {format(new Date(logs[0].createdAt), "dd/MM/yyyy", { locale: ptBR })}
                                                {logs.length > 1 && ` — ${format(new Date(logs[logs.length - 1].createdAt), "dd/MM/yyyy", { locale: ptBR })}`}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        {tubeHistory.size === 0 && (
                            <p className="text-xs text-slate-400 text-center py-2">Nenhum uso registrado</p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
