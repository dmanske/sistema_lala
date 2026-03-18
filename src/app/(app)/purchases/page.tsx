"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Plus, Search, ShoppingBag, Calendar, Package,
    ArrowRight, Filter, TrendingDown, Clock, CheckCircle2,
    AlertCircle, ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { NewPurchaseDialog } from "@/components/purchases/NewPurchaseDialog";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { Purchase, calculatePaymentSummary } from "@/core/domain/Purchase";
import { getPurchaseRepository, getSupplierRepository } from "@/infrastructure/repositories/factory";
import { formatDate, parseLocalDate } from "@/lib/utils/dateFormatters";

const brl = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

const statusConfig = {
    PAID: {
        label: 'Pago',
        icon: CheckCircle2,
        className: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        iconClass: 'text-emerald-400',
        dot: 'bg-emerald-400',
    },
    PARTIAL: {
        label: 'Parcial',
        icon: AlertCircle,
        className: 'bg-amber-50 text-amber-600 border-amber-200',
        iconClass: 'text-amber-400',
        dot: 'bg-amber-400',
    },
    PENDING: {
        label: 'Pendente',
        icon: Clock,
        className: 'bg-red-50 text-red-500 border-red-200',
        iconClass: 'text-red-400',
        dot: 'bg-red-400',
    },
} as const;

export default function PurchasesPage() {
    const router = useRouter();
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [suppliers, setSuppliers] = useState<Map<string, string>>(new Map());
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const purchaseRepo = getPurchaseRepository();
    const supplierRepo = getSupplierRepository();

    const loadData = async () => {
        try {
            const [pList, sList] = await Promise.all([
                purchaseRepo.getAll(),
                supplierRepo.getAll()
            ]);
            const sMap = new Map<string, string>();
            sList.forEach(s => sMap.set(s.id, s.name));
            setSuppliers(sMap);
            const sorted = pList.sort((a, b) => {
                const dateA = parseLocalDate(a.date)?.getTime() || 0;
                const dateB = parseLocalDate(b.date)?.getTime() || 0;
                return dateB - dateA;
            });
            setPurchases(sorted);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const filteredPurchases = purchases.filter(p => {
        const supplierName = suppliers.get(p.supplierId)?.toLowerCase() || "";
        const searchMatch = p.id.toLowerCase().includes(search.toLowerCase()) || supplierName.includes(search.toLowerCase());
        const statusMatch = statusFilter === "ALL" || p.paymentStatus === statusFilter;
        return searchMatch && statusMatch;
    });

    const totalValue = purchases.reduce((sum, p) => sum + p.total, 0);
    const pending = purchases.filter(p => p.paymentStatus === 'PENDING' || p.paymentStatus === 'PARTIAL');
    const pendingValue = pending.reduce((sum, p) => sum + calculatePaymentSummary(p).remaining, 0);
    const lastPurchase = purchases[0];

    return (
        <div className="space-y-6 pb-10">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                        <Package className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Entradas de Estoque</h1>
                        <p className="text-sm text-slate-500">Histórico de compras e entradas de produtos</p>
                    </div>
                </div>
                <Button
                    onClick={() => setIsDialogOpen(true)}
                    className="rounded-xl h-10 px-5 bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-shadow"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Entrada
                </Button>
            </div>

            <NewPurchaseDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSuccess={() => { loadData(); router.refresh(); }}
            />

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card rounded-2xl border border-border shadow-sm p-5 border-t-2 border-t-purple-400">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total de Compras</span>
                        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
                            <ShoppingBag className="h-4 w-4 text-purple-500" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{purchases.length}</p>
                    <p className="text-xs text-slate-400 mt-1">Entradas registradas</p>
                </div>

                <div className="bg-card rounded-2xl border border-border shadow-sm p-5 border-t-2 border-t-emerald-400">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Valor Total</span>
                        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
                            <TrendingDown className="h-4 w-4 text-emerald-500" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{brl(totalValue)}</p>
                    <p className="text-xs text-slate-400 mt-1">Investido em estoque</p>
                </div>

                <div className="bg-card rounded-2xl border border-border shadow-sm p-5 border-t-2 border-t-blue-400">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Última Compra</span>
                        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-blue-500" />
                        </div>
                    </div>
                    <p className="text-base font-bold text-slate-800 truncate">
                        {lastPurchase ? (suppliers.get(lastPurchase.supplierId) || 'N/A') : '—'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                        {lastPurchase ? formatDate(lastPurchase.date) : 'Sem compras'}
                    </p>
                </div>

                <div className="bg-card rounded-2xl border border-border shadow-sm p-5 border-t-2 border-t-amber-400">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pendente</span>
                        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center">
                            <Clock className="h-4 w-4 text-amber-500" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-amber-600">{pending.length}</p>
                    <p className="text-xs text-slate-400 mt-1">{brl(pendingValue)} em aberto</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Buscar por fornecedor..."
                        className="pl-9 rounded-xl border-slate-200 bg-slate-50 focus:bg-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px] rounded-xl border-slate-200 bg-slate-50">
                        <Filter className="h-4 w-4 mr-2 text-slate-400" />
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Todos os Status</SelectItem>
                        <SelectItem value="PENDING">Pendente</SelectItem>
                        <SelectItem value="PARTIAL">Parcial</SelectItem>
                        <SelectItem value="PAID">Pago</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* List */}
            <div className="space-y-3">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                    {filteredPurchases.length} {filteredPurchases.length === 1 ? 'entrada' : 'entradas'}
                </h2>

                <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="divide-y divide-slate-50">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-4 px-5 py-4">
                                    <div className="h-9 w-9 rounded-xl bg-slate-100 animate-pulse shrink-0" />
                                    <div className="flex-1 space-y-1.5">
                                        <div className="h-3.5 w-32 bg-slate-100 rounded animate-pulse" />
                                        <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
                                    </div>
                                    <div className="h-3.5 w-20 bg-slate-100 rounded animate-pulse" />
                                </div>
                            ))}
                        </div>
                    ) : filteredPurchases.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="h-16 w-16 rounded-3xl bg-slate-100 flex items-center justify-center mb-4">
                                <ShoppingBag className="h-8 w-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-700 mb-1">Nenhuma entrada encontrada</h3>
                            <p className="text-sm text-slate-400 mb-6 max-w-xs">
                                {statusFilter !== "ALL" || search
                                    ? "Tente alterar os filtros de busca"
                                    : "Registre sua primeira entrada de estoque"}
                            </p>
                            {!search && statusFilter === "ALL" && (
                                <Button
                                    onClick={() => setIsDialogOpen(true)}
                                    className="rounded-xl h-10 px-6 bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg shadow-emerald-200"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Nova Entrada
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {filteredPurchases.map((purchase) => {
                                const supplierName = suppliers.get(purchase.supplierId) || "Fornecedor desconhecido";
                                const paymentSummary = calculatePaymentSummary(purchase);
                                const status = statusConfig[purchase.paymentStatus as keyof typeof statusConfig] ?? statusConfig.PENDING;
                                const StatusIcon = status.icon;
                                const itemCount = purchase.items ? purchase.items.reduce((s, i) => s + i.quantity, 0) : 0;

                                return (
                                    <div
                                        key={purchase.id}
                                        className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/60 cursor-pointer transition-colors group"
                                        onClick={() => router.push(`/purchases/${purchase.id}`)}
                                    >
                                        {/* Avatar */}
                                        <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 text-sm font-bold text-emerald-600">
                                            {getInitials(supplierName)}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-700 truncate">{supplierName}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Calendar className="h-3 w-3 text-slate-300 shrink-0" />
                                                <p className="text-xs text-slate-400">{formatDate(purchase.date)}</p>
                                                <span className="text-slate-200">·</span>
                                                <Package className="h-3 w-3 text-slate-300 shrink-0" />
                                                <p className="text-xs text-slate-400">{itemCount} {itemCount === 1 ? 'item' : 'itens'}</p>
                                            </div>
                                        </div>

                                        {/* Remaining */}
                                        {paymentSummary.remaining > 0 && (
                                            <div className="hidden sm:block text-right shrink-0">
                                                <p className="text-xs text-slate-400">Saldo</p>
                                                <p className="text-sm font-semibold text-red-500">{brl(paymentSummary.remaining)}</p>
                                            </div>
                                        )}

                                        {/* Total */}
                                        <p className="text-sm font-bold text-slate-700 shrink-0 w-24 text-right">
                                            {brl(purchase.total)}
                                        </p>

                                        {/* Status */}
                                        <span className={`hidden sm:inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border shrink-0 ${status.className}`}>
                                            <StatusIcon className={`h-3 w-3 ${status.iconClass}`} />
                                            {status.label}
                                        </span>

                                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 shrink-0 transition-colors" />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
