"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    Plus, Search, ShoppingBag, Package,
    TrendingDown, Clock, CheckCircle2,
    AlertCircle, ChevronRight, ChevronLeft, X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { NewPurchaseDialog } from "@/components/purchases/NewPurchaseDialog";
import { Purchase, calculatePaymentSummary } from "@/core/domain/Purchase";
import { getPurchaseRepository, getSupplierRepository } from "@/infrastructure/repositories/factory";
import { formatDate, parseLocalDate } from "@/lib/utils/dateFormatters";
import { cn } from "@/lib/utils";
import {
    format, startOfMonth, endOfMonth, isSameMonth, addYears, subYears,
} from "date-fns";
import { ptBR } from "date-fns/locale";

const brl = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

const statusConfig = {
    PAID:    { label: 'Pago',     icon: CheckCircle2, className: 'bg-emerald-50 text-emerald-600 border-emerald-200', iconClass: 'text-emerald-400' },
    PARTIAL: { label: 'Parcial',  icon: AlertCircle,  className: 'bg-amber-50 text-amber-600 border-amber-200',     iconClass: 'text-amber-400'  },
    PENDING: { label: 'Pendente', icon: Clock,        className: 'bg-red-50 text-red-500 border-red-200',           iconClass: 'text-red-400'    },
} as const;

type TabId = 'all' | 'pending' | 'paid';

const TABS: { id: TabId; label: string; activeClass: string }[] = [
    { id: 'all',     label: 'Todas',     activeClass: 'border-emerald-500 text-emerald-700 bg-emerald-50/50' },
    { id: 'pending', label: 'Pendentes', activeClass: 'border-amber-500 text-amber-700 bg-amber-50/50' },
    { id: 'paid',    label: 'Pagas',     activeClass: 'border-emerald-600 text-emerald-700 bg-emerald-50/50' },
];

export default function PurchasesPage() {
    const router = useRouter();
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [suppliers, setSuppliers] = useState<Map<string, string>>(new Map());
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Filters
    const [activeTab, setActiveTab] = useState<TabId>('all');
    const [searchText, setSearchText] = useState('');

    // Month navigation
    const [periodStart, setPeriodStart] = useState(startOfMonth(new Date()));
    const [periodEnd, setPeriodEnd] = useState(endOfMonth(new Date()));

    const purchaseRepo = getPurchaseRepository();
    const supplierRepo = getSupplierRepository();

    const loadData = async () => {
        try {
            const [pList, sList] = await Promise.all([
                purchaseRepo.getAll(),
                supplierRepo.getAll(),
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

    // Month nav helpers
    const months = useMemo(() => {
        const year = periodStart.getFullYear();
        return Array.from({ length: 12 }, (_, i) => {
            const date = new Date(year, i, 1);
            return {
                date,
                start: startOfMonth(date),
                end: endOfMonth(date),
                label: format(date, 'MMM', { locale: ptBR }),
                fullLabel: format(date, 'MMMM yyyy', { locale: ptBR }),
                isActive: isSameMonth(date, periodStart),
            };
        });
    }, [periodStart]);

    const handleMonthClick = (start: Date, end: Date) => {
        setPeriodStart(start);
        setPeriodEnd(end);
    };

    // Filter by period
    const periodFiltered = useMemo(() => {
        return purchases.filter(p => {
            const date = parseLocalDate(p.date);
            if (!date) return false;
            return date >= periodStart && date <= periodEnd;
        });
    }, [purchases, periodStart, periodEnd]);

    // Tab counts
    const tabCounts = useMemo(() => ({
        all:     periodFiltered.length,
        pending: periodFiltered.filter(p => p.paymentStatus === 'PENDING' || p.paymentStatus === 'PARTIAL').length,
        paid:    periodFiltered.filter(p => p.paymentStatus === 'PAID').length,
    }), [periodFiltered]);

    // Period stats
    const periodStats = useMemo(() => {
        const total = periodFiltered.reduce((s, p) => s + p.total, 0);
        const pendingList = periodFiltered.filter(p => p.paymentStatus !== 'PAID');
        const pendingValue = pendingList.reduce((s, p) => s + calculatePaymentSummary(p).remaining, 0);
        const paidValue = periodFiltered.filter(p => p.paymentStatus === 'PAID').reduce((s, p) => s + p.total, 0);
        return { total, count: periodFiltered.length, pendingCount: pendingList.length, pendingValue, paidValue };
    }, [periodFiltered]);

    // Apply tab + search
    const filteredPurchases = useMemo(() => {
        let result = periodFiltered;
        if (activeTab === 'pending') result = result.filter(p => p.paymentStatus === 'PENDING' || p.paymentStatus === 'PARTIAL');
        if (activeTab === 'paid')    result = result.filter(p => p.paymentStatus === 'PAID');
        if (searchText.trim()) {
            const s = searchText.toLowerCase();
            result = result.filter(p => {
                const name = suppliers.get(p.supplierId)?.toLowerCase() || '';
                return name.includes(s) || p.id.toLowerCase().includes(s);
            });
        }
        return result;
    }, [periodFiltered, activeTab, searchText, suppliers]);

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

            {/* Stats do período */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Entradas no Período</span>
                        <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                            <ShoppingBag className="h-4 w-4 text-emerald-500" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{periodStats.count}</p>
                    <p className="text-xs text-slate-400 mt-1">{brl(periodStats.total)} em compras</p>
                </div>

                <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Valor Pago</span>
                        <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                            <TrendingDown className="h-4 w-4 text-emerald-500" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-emerald-600">{brl(periodStats.paidValue)}</p>
                    <p className="text-xs text-slate-400 mt-1">Compras quitadas</p>
                </div>

                <div className="bg-card rounded-2xl border border-amber-100 shadow-sm p-5 col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Pendente</span>
                        <div className="h-8 w-8 rounded-xl bg-amber-50 flex items-center justify-center">
                            <Clock className="h-4 w-4 text-amber-500" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-amber-600">{brl(periodStats.pendingValue)}</p>
                    <p className="text-xs text-slate-400 mt-1">{periodStats.pendingCount} compra(s) em aberto</p>
                </div>
            </div>

            {/* Month nav bar */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-3 flex items-center gap-3">
                {/* Year nav */}
                <div className="flex items-center gap-1 shrink-0">
                    <button
                        onClick={() => { const d = subYears(periodStart, 1); handleMonthClick(startOfMonth(d), endOfMonth(d)); }}
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-semibold text-slate-700 min-w-[44px] text-center">
                        {periodStart.getFullYear()}
                    </span>
                    <button
                        onClick={() => { const d = addYears(periodStart, 1); handleMonthClick(startOfMonth(d), endOfMonth(d)); }}
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4 rotate-180" />
                    </button>
                </div>

                <div className="h-6 w-px bg-border shrink-0" />

                {/* Month tabs */}
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide flex-1">
                    {months.map(m => (
                        <button
                            key={m.date.toISOString()}
                            onClick={() => handleMonthClick(m.start, m.end)}
                            title={m.fullLabel}
                            className={cn(
                                'h-8 px-3 rounded-lg capitalize shrink-0 text-xs font-medium transition-all',
                                m.isActive ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
                            )}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>

                <div className="h-6 w-px bg-border shrink-0" />

                {/* Search */}
                <div className="relative w-[200px] shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar fornecedor..."
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        className="h-8 w-full pl-8 pr-8 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    />
                    {searchText && (
                        <button
                            onClick={() => setSearchText('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs + List */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">

                {/* Tab header */}
                <div className="px-6 pt-4 pb-0 border-b border-slate-100">
                    <div className="flex items-center gap-1">
                        {TABS.map(tab => {
                            const count = tabCounts[tab.id];
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        'flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium border-b-2 transition-all',
                                        isActive
                                            ? tab.activeClass
                                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                    )}
                                >
                                    {tab.label}
                                    {count > 0 && (
                                        <span className={cn(
                                            'rounded-full px-1.5 py-0.5 text-xs font-bold min-w-[18px] text-center',
                                            isActive ? 'bg-white/60 text-inherit' : 'bg-slate-100 text-slate-500'
                                        )}>
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="divide-y divide-slate-50">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4 px-5 py-4">
                                <div className="h-10 w-10 rounded-xl bg-slate-100 animate-pulse shrink-0" />
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
                        <h3 className="text-base font-semibold text-slate-600 mb-1">Nenhuma entrada encontrada</h3>
                        <p className="text-sm text-slate-400 mb-5 max-w-xs">
                            {searchText ? 'Tente buscar com outros termos' : 'Nenhuma compra registrada neste período'}
                        </p>
                        {!searchText && (
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
                                    <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 text-sm font-bold text-emerald-600">
                                        {getInitials(supplierName)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-700 truncate">{supplierName}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <p className="text-xs text-slate-400">{formatDate(purchase.date)}</p>
                                            <span className="text-slate-200">·</span>
                                            <Package className="h-3 w-3 text-slate-300 shrink-0" />
                                            <p className="text-xs text-slate-400">{itemCount} {itemCount === 1 ? 'item' : 'itens'}</p>
                                        </div>
                                    </div>

                                    {paymentSummary.remaining > 0 && (
                                        <div className="hidden sm:block text-right shrink-0">
                                            <p className="text-xs text-slate-400">Saldo</p>
                                            <p className="text-sm font-semibold text-red-500">{brl(paymentSummary.remaining)}</p>
                                        </div>
                                    )}

                                    <p className="text-sm font-bold text-slate-700 shrink-0 w-24 text-right">
                                        {brl(purchase.total)}
                                    </p>

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
    );
}
