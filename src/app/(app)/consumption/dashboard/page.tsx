"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Droplets, Package, Users, TrendingUp, ArrowLeft,
    AlertTriangle, Clock, BarChart3, History,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUsageProducts } from "@/hooks/useUsageProducts";
import { UsageProductLog } from "@/core/domain/UsageProduct";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

function StatCard({ title, value, subtext, icon: Icon, color = "teal" }: {
    title: string; value: string | number; subtext?: string;
    icon: any; color?: string;
}) {
    const gradients: Record<string, string> = {
        teal: "from-teal-500/10 to-cyan-500/10 border-teal-100",
        violet: "from-violet-500/10 to-purple-500/10 border-violet-100",
        amber: "from-amber-500/10 to-orange-500/10 border-amber-100",
        rose: "from-rose-500/10 to-red-500/10 border-rose-100",
        emerald: "from-emerald-500/10 to-green-500/10 border-emerald-100",
    };
    const iconColors: Record<string, string> = {
        teal: "bg-teal-50 text-teal-600",
        violet: "bg-violet-50 text-violet-600",
        amber: "bg-amber-50 text-amber-600",
        rose: "bg-rose-50 text-rose-600",
        emerald: "bg-emerald-50 text-emerald-600",
    };
    return (
        <Card className={cn(
            "group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br border",
            gradients[color] || gradients.teal
        )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider">{title}</CardTitle>
                <div className={cn("p-2.5 rounded-xl shadow-sm", iconColors[color] || iconColors.teal)}>
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-slate-900 tracking-tight">{value}</div>
                {subtext && <p className="text-xs text-slate-600 mt-2 font-medium">{subtext}</p>}
            </CardContent>
        </Card>
    );
}

function SimpleBarChart({ data, color = "bg-teal-500" }: {
    data: { label: string; value: number; formattedValue: string }[];
    color?: string;
}) {
    const max = Math.max(...data.map(d => d.value));
    return (
        <div className="space-y-4 pt-4">
            {data.map((item, idx) => (
                <div key={idx} className="space-y-2 group">
                    <div className="flex justify-between text-sm">
                        <span className="font-medium text-slate-700">{item.label}</span>
                        <span className="text-slate-500 font-medium">{item.formattedValue}</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={cn("h-full rounded-full transition-all duration-1000 ease-out", color)}
                            style={{ width: `${max > 0 ? (item.value / max) * 100 : 0}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

type LogWithDetails = UsageProductLog & { clientName?: string; professionalName?: string };

export default function ConsumptionDashboardPage() {
    const router = useRouter();
    const { products, loading: productsLoading, getAllLogsWithDetails } = useUsageProducts();
    const [logs, setLogs] = useState<LogWithDetails[]>([]);
    const [logsLoading, setLogsLoading] = useState(true);
    const [activeProductTab, setActiveProductTab] = useState<string | null>(null);

    useEffect(() => {
        async function loadLogs() {
            try {
                const data = await getAllLogsWithDetails();
                setLogs(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLogsLoading(false);
            }
        }
        loadLogs();
    }, [getAllLogsWithDetails]);

    const loading = productsLoading || logsLoading;

    // Set first product as active tab when products load
    useEffect(() => {
        if (!loading && products.length > 0 && !activeProductTab) {
            setActiveProductTab(products[0].id);
        }
    }, [loading, products, activeProductTab]);

    const stats = useMemo(() => {
        if (loading) return null;

        const totalProducts = products.length;
        const totalStock = products.reduce((s, p) => s + (p.stockQuantity ?? 0), 0);
        const totalUnitsConsumed = products.reduce((s, p) => s + p.totalUnitsConsumed, 0);
        const totalLogs = logs.length;
        const distinctClients = new Set(logs.filter(l => l.clientId).map(l => l.clientId)).size;

        const outOfStock = products.filter(p => (p.stockQuantity ?? 0) === 0 && p.currentConsumed === 0);
        const almostEmpty = products.filter(p => {
            const pct = p.contentAmount > 0 ? (p.currentConsumed / p.contentAmount) * 100 : 0;
            return pct >= 80 && pct < 100;
        });

        const logsByProduct = new Map<string, { name: string; count: number; totalUsed: number; unit: string }>();
        logs.forEach(l => {
            const key = l.usageProductId;
            const existing = logsByProduct.get(key);
            if (existing) { existing.count++; existing.totalUsed += l.amountUsed; }
            else { logsByProduct.set(key, { name: l.productName || "Produto", count: 1, totalUsed: l.amountUsed, unit: l.measurementUnit || "g" }); }
        });

        const topByUsage = Array.from(logsByProduct.values())
            .sort((a, b) => b.count - a.count).slice(0, 5)
            .map(p => ({ label: p.name, value: p.count, formattedValue: `${p.count} usos — ${p.totalUsed.toFixed(0)}${p.unit}` }));

        const clientsByProduct = new Map<string, { name: string; clients: Set<string> }>();
        logs.forEach(l => {
            if (!l.clientId) return;
            const existing = clientsByProduct.get(l.usageProductId);
            if (existing) { existing.clients.add(l.clientId); }
            else { clientsByProduct.set(l.usageProductId, { name: l.productName || "Produto", clients: new Set([l.clientId]) }); }
        });

        const topByClients = Array.from(clientsByProduct.values())
            .sort((a, b) => b.clients.size - a.clients.size).slice(0, 5)
            .map(p => ({ label: p.name, value: p.clients.size, formattedValue: `${p.clients.size} cliente${p.clients.size !== 1 ? "s" : ""}` }));

        const productDetails = products.map(p => {
            const pct = p.contentAmount > 0 ? (p.currentConsumed / p.contentAmount) * 100 : 0;
            const productLogs = logs.filter(l => l.usageProductId === p.id);
            const firstUse = productLogs.length > 0 ? productLogs[productLogs.length - 1].createdAt : null;
            const lastUse = productLogs.length > 0 ? productLogs[0].createdAt : null;
            return { ...p, percentage: pct, logCount: productLogs.length, firstUse, lastUse };
        }).sort((a, b) => b.logCount - a.logCount);

        // Tube history grouped by product > tube_number
        const tubeHistoryByProduct = new Map<string, Map<number, LogWithDetails[]>>();
        for (const p of products) {
            const productLogs = logs.filter(l => l.usageProductId === p.id);
            const tubeMap = new Map<number, LogWithDetails[]>();
            for (const log of productLogs) {
                const tube = log.tubeNumber ?? 1;
                if (!tubeMap.has(tube)) tubeMap.set(tube, []);
                tubeMap.get(tube)!.push(log);
            }
            tubeHistoryByProduct.set(p.id, tubeMap);
        }

        return {
            totalProducts, totalStock, totalUnitsConsumed, totalLogs,
            distinctClients, outOfStock, almostEmpty,
            topByUsage, topByClients, productDetails, tubeHistoryByProduct,
        };
    }, [products, logs, loading]);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-16 bg-muted/30 rounded-lg animate-pulse" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 bg-muted/30 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (!stats) return null;

    const activeProduct = products.find(p => p.id === activeProductTab);
    const activeTubeHistory = activeProductTab ? stats.tubeHistoryByProduct.get(activeProductTab) : null;

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.push("/consumption")} className="rounded-xl">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight font-heading">Dashboard de Consumo</h1>
                        <p className="text-muted-foreground">Visão completa dos produtos de uso interno</p>
                    </div>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <StatCard title="Produtos Cadastrados" value={stats.totalProducts} subtext="produtos de consumo" icon={Package} color="teal" />
                <StatCard title="Estoque Total" value={`${stats.totalStock} un`} subtext={stats.outOfStock.length > 0 ? `${stats.outOfStock.length} sem estoque` : "estoque saudável"} icon={Droplets} color={stats.outOfStock.length > 0 ? "rose" : "emerald"} />
                <StatCard title="Unidades Consumidas" value={stats.totalUnitsConsumed} subtext={`${stats.totalLogs} registros de uso`} icon={TrendingUp} color="violet" />
                <StatCard title="Clientes Atendidos" value={stats.distinctClients} subtext="clientes distintos" icon={Users} color="amber" />
            </div>

            {/* Alertas de Estoque */}
            {(stats.outOfStock.length > 0 || stats.almostEmpty.length > 0) && (
                <Card className="border-rose-200 bg-rose-50/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-rose-700">
                            <AlertTriangle className="h-5 w-5" />
                            Alertas de Estoque
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {stats.outOfStock.map(p => (
                                <div key={p.id} className="flex items-center justify-between p-3 bg-rose-100/50 rounded-xl text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-rose-500" />
                                        <span className="font-medium text-rose-800">{p.name}</span>
                                    </div>
                                    <span className="text-rose-600 font-bold">Sem estoque</span>
                                </div>
                            ))}
                            {stats.almostEmpty.map(p => (
                                <div key={p.id} className="flex items-center justify-between p-3 bg-amber-100/50 rounded-xl text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                                        <span className="font-medium text-amber-800">{p.name}</span>
                                    </div>
                                    <span className="text-amber-600 font-bold">
                                        {((p.currentConsumed / p.contentAmount) * 100).toFixed(0)}% consumido
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Charts Row */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-teal-600" />
                            Mais Utilizados
                        </CardTitle>
                        <CardDescription>Produtos com mais registros de uso</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {stats.topByUsage.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                                <Droplets className="h-10 w-10 mb-2 text-teal-200" />
                                <p>Nenhum uso registrado</p>
                            </div>
                        ) : (
                            <SimpleBarChart data={stats.topByUsage} color="bg-gradient-to-r from-teal-500 to-cyan-500" />
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-violet-600" />
                            Por Clientes
                        </CardTitle>
                        <CardDescription>Produtos usados em mais clientes distintos</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {stats.topByClients.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                                <Users className="h-10 w-10 mb-2 text-violet-200" />
                                <p>Nenhum uso registrado</p>
                            </div>
                        ) : (
                            <SimpleBarChart data={stats.topByClients} color="bg-gradient-to-r from-violet-500 to-purple-500" />
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Detalhes por Produto */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-teal-600" />
                        Detalhes por Produto
                    </CardTitle>
                    <CardDescription>Visão individual de cada produto de consumo</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {stats.productDetails.map(p => {
                            const statusColor = p.percentage >= 90 ? "rose" : p.percentage >= 70 ? "amber" : p.percentage >= 50 ? "orange" : "emerald";
                            const bgColors: Record<string, string> = {
                                rose: "bg-rose-50 border-rose-200", amber: "bg-amber-50 border-amber-200",
                                orange: "bg-orange-50 border-orange-200", emerald: "bg-emerald-50 border-emerald-200",
                            };
                            const barColors: Record<string, string> = {
                                rose: "bg-rose-500", amber: "bg-amber-500", orange: "bg-orange-500", emerald: "bg-emerald-500",
                            };
                            return (
                                <div key={p.id} className={cn("p-4 rounded-xl border", bgColors[statusColor])}>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Droplets className="h-4 w-4 text-teal-600" />
                                                <span className="font-bold text-slate-800">{p.name}</span>
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {p.contentAmount}{p.measurementUnit} por {p.unitLabel}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                                            <div>
                                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Estoque</div>
                                                <div className={cn("text-lg font-bold", (p.stockQuantity ?? 0) === 0 ? "text-rose-600" : "text-slate-800")}>
                                                    {p.stockQuantity ?? 0}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Consumidos</div>
                                                <div className="text-lg font-bold text-slate-800">{p.totalUnitsConsumed}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Usos</div>
                                                <div className="text-lg font-bold text-violet-600">{p.logCount}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Clientes</div>
                                                <div className="text-lg font-bold text-violet-600">{p.distinctClients ?? 0}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-slate-600">{p.currentConsumed.toFixed(1)}{p.measurementUnit} / {p.contentAmount}{p.measurementUnit}</span>
                                            <span className="font-bold text-slate-600">{p.percentage.toFixed(0)}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-white/60 rounded-full overflow-hidden">
                                            <div className={cn("h-full rounded-full transition-all", barColors[statusColor])} style={{ width: `${p.percentage}%` }} />
                                        </div>
                                    </div>
                                    {p.lastUse && (
                                        <div className="mt-2 flex items-center gap-4 text-[11px] text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                Último uso: {format(new Date(p.lastUse), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                            </span>
                                            {p.firstUse && (
                                                <span>Primeiro uso: {format(new Date(p.firstUse), "dd/MM/yyyy", { locale: ptBR })}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Histórico por Tubo — com abas por produto */}
            {products.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5 text-teal-600" />
                            Histórico por Tubo
                        </CardTitle>
                        <CardDescription>Uso individual de cada tubo, separado por produto</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Abas de produtos */}
                        <div className="flex flex-wrap gap-2 mb-4 pb-3 border-b border-slate-100">
                            {products.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => setActiveProductTab(p.id)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                                        activeProductTab === p.id
                                            ? "bg-teal-100 text-teal-700 shadow-sm"
                                            : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                                    )}
                                >
                                    {p.name}
                                </button>
                            ))}
                        </div>

                        {/* Conteúdo do produto selecionado */}
                        {activeProduct && activeTubeHistory && (
                            <div className="space-y-3">
                                {activeTubeHistory.size === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                                        <Droplets className="h-10 w-10 mb-2 text-teal-200" />
                                        <p>Nenhum uso registrado para {activeProduct.name}</p>
                                    </div>
                                ) : (
                                    Array.from(activeTubeHistory.entries())
                                        .sort(([a], [b]) => b - a)
                                        .map(([tubeNum, tubeLogs]) => {
                                            const isCurrentTube = tubeNum === activeProduct.totalUnitsConsumed + 1;
                                            const totalUsed = tubeLogs.reduce((s, l) => s + l.amountUsed, 0);
                                            const clientNames = [...new Set(tubeLogs.filter(l => l.clientName).map(l => l.clientName!))];
                                            const pct = activeProduct.contentAmount > 0
                                                ? Math.min((totalUsed / activeProduct.contentAmount) * 100, 100)
                                                : 0;

                                            return (
                                                <div
                                                    key={tubeNum}
                                                    className={cn(
                                                        "p-4 rounded-xl border",
                                                        isCurrentTube
                                                            ? "bg-teal-50/50 border-teal-200"
                                                            : "bg-slate-50/50 border-slate-200"
                                                    )}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className={cn(
                                                                "text-xs font-bold px-2.5 py-1 rounded-full",
                                                                isCurrentTube
                                                                    ? "bg-teal-100 text-teal-700"
                                                                    : "bg-slate-200 text-slate-600"
                                                            )}>
                                                                {activeProduct.unitLabel} {tubeNum}
                                                                {isCurrentTube && " (atual)"}
                                                            </span>
                                                            <span className="text-xs text-slate-500">
                                                                {tubeLogs.length} uso{tubeLogs.length !== 1 ? "s" : ""}
                                                            </span>
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-700">
                                                            {totalUsed.toFixed(0)}{activeProduct.measurementUnit} / {activeProduct.contentAmount}{activeProduct.measurementUnit}
                                                        </span>
                                                    </div>

                                                    {/* Barra de progresso do tubo */}
                                                    <div className="h-1.5 w-full bg-white/60 rounded-full overflow-hidden mb-2">
                                                        <div
                                                            className={cn(
                                                                "h-full rounded-full transition-all",
                                                                isCurrentTube ? "bg-teal-500" : "bg-slate-400"
                                                            )}
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>

                                                    {/* Clientes */}
                                                    {clientNames.length > 0 && (
                                                        <p className="text-xs text-slate-600">
                                                            👤 {clientNames.join(", ")}
                                                        </p>
                                                    )}

                                                    {/* Detalhes de cada uso */}
                                                    <div className="mt-2 space-y-1">
                                                        {tubeLogs.map(log => (
                                                            <div key={log.id} className="flex items-center justify-between text-xs text-slate-500 py-1 border-t border-slate-100/50 first:border-0">
                                                                <span>
                                                                    {log.clientName || "Cliente"} — {log.amountUsed}{activeProduct.measurementUnit}
                                                                </span>
                                                                <span className="text-slate-400">
                                                                    {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
