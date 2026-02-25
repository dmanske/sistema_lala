"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Plus, Search, ShoppingBag, Calendar, Package, ArrowRight,
    Loader2, Filter
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { Purchase, calculatePaymentSummary } from "@/core/domain/Purchase";
import { Supplier } from "@/core/domain/Supplier";
import { getPurchaseRepository, getSupplierRepository } from "@/infrastructure/repositories/factory";
import { formatDate, parseLocalDate } from "@/lib/utils/dateFormatters";
import { PaymentStatusBadge } from "@/components/purchases/PaymentStatusBadge";

export default function PurchasesPage() {
    const router = useRouter();
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [suppliers, setSuppliers] = useState<Map<string, string>>(new Map());
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");

    const purchaseRepo = getPurchaseRepository();
    const supplierRepo = getSupplierRepository();

    useEffect(() => {
        const load = async () => {
            try {
                const [pList, sList] = await Promise.all([
                    purchaseRepo.getAll(),
                    supplierRepo.getAll()
                ]);

                // Create Supplier Map
                const sMap = new Map<string, string>();
                sList.forEach(s => sMap.set(s.id, s.name));
                setSuppliers(sMap);

                // Sort by Date Desc
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
        load();
    }, []);

    const filteredPurchases = purchases.filter(p => {
        const supplierName = suppliers.get(p.supplierId)?.toLowerCase() || "";
        const idMatch = p.id.toLowerCase().includes(search.toLowerCase());
        const supplierMatch = supplierName.includes(search.toLowerCase());
        const searchMatch = idMatch || supplierMatch;
        
        const statusMatch = statusFilter === "ALL" || p.paymentStatus === statusFilter;
        
        return searchMatch && statusMatch;
    });

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="hidden md:flex justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">Entradas de Estoque</h1>
                    <p className="text-muted-foreground">
                        Histórico de compras e entradas de produtos.
                    </p>
                </div>
                <Button asChild className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                    <Link href="/purchases/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Entrada
                    </Link>
                </Button>
            </div>

            {/* Mobile Header */}
            <div className="md:hidden flex justify-between items-center">
                <h1 className="text-2xl font-bold font-heading">Compras</h1>
                <Button asChild size="sm" className="rounded-xl">
                    <Link href="/purchases/new">
                        <Plus className="h-4 w-4" />
                    </Link>
                </Button>
            </div>

            {/* Metrics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-100">
                    <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-white/40 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Total de Compras</p>
                                <p className="text-3xl font-bold text-slate-900 tracking-tight mt-2">{purchases.length}</p>
                                <p className="text-xs text-slate-600 mt-2 font-medium">Entradas registradas</p>
                            </div>
                            <div className="p-2.5 bg-purple-50 rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110">
                                <ShoppingBag className="h-4 w-4 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-100">
                    <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-white/40 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Valor Total</p>
                                <p className="text-3xl font-bold text-slate-900 tracking-tight mt-2">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                        purchases.reduce((sum, p) => sum + p.total, 0)
                                    )}
                                </p>
                                <p className="text-xs text-slate-600 mt-2 font-medium">Investido em estoque</p>
                            </div>
                            <div className="p-2.5 bg-emerald-50 rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110">
                                <Package className="h-4 w-4 text-emerald-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-100">
                    <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-white/40 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Última Compra</p>
                                <p className="text-xl font-bold text-slate-900 tracking-tight mt-2 truncate">
                                    {purchases.length > 0
                                        ? suppliers.get(purchases[0].supplierId) || "N/A"
                                        : "N/A"
                                    }
                                </p>
                                <p className="text-xs text-slate-600 mt-2 font-medium">
                                    {purchases.length > 0
                                        ? formatDate(purchases[0].date)
                                        : "Sem compras"
                                    }
                                </p>
                            </div>
                            <div className="p-2.5 bg-blue-50 rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110">
                                <Calendar className="h-4 w-4 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-100">
                    <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-white/40 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Pagamentos Pendentes</p>
                                <p className="text-3xl font-bold text-slate-900 tracking-tight mt-2">
                                    {purchases.filter(p => p.paymentStatus === 'PENDING' || p.paymentStatus === 'PARTIAL').length}
                                </p>
                                <p className="text-xs text-slate-600 mt-2 font-medium">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                        purchases
                                            .filter(p => p.paymentStatus === 'PENDING' || p.paymentStatus === 'PARTIAL')
                                            .reduce((sum, p) => sum + p.total, 0)
                                    )}
                                </p>
                            </div>
                            <div className="p-2.5 bg-orange-50 rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110">
                                <Loader2 className="h-4 w-4 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-card/50 backdrop-blur-xl p-4 sm:p-6 rounded-2xl border border-white/20 shadow-lg shadow-purple-500/5 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por fornecedor ou ID..."
                        className="pl-9 bg-white/40 border-white/20 focus:bg-white/60 rounded-xl"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[200px] bg-white/40 border-white/20 rounded-xl">
                        <Filter className="h-4 w-4 mr-2" />
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

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-slate-100 bg-slate-50/50">
                                <TableHead className="font-heading font-semibold text-slate-700">Data</TableHead>
                                <TableHead className="font-heading font-semibold text-slate-700">Fornecedor</TableHead>
                                <TableHead className="font-heading font-semibold text-slate-700 text-center">Itens</TableHead>
                                <TableHead className="font-heading font-semibold text-slate-700 text-right">Total</TableHead>
                                <TableHead className="font-heading font-semibold text-slate-700 text-right">Saldo</TableHead>
                                <TableHead className="font-heading font-semibold text-slate-700 text-center">Status</TableHead>
                                <TableHead className="font-heading font-semibold text-slate-700 w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="border-slate-100">
                                        <TableCell><div className="h-4 w-24 bg-slate-100 rounded animate-pulse" /></TableCell>
                                        <TableCell><div className="h-4 w-32 bg-slate-100 rounded animate-pulse" /></TableCell>
                                        <TableCell><div className="h-4 w-12 bg-slate-100 rounded animate-pulse mx-auto" /></TableCell>
                                        <TableCell><div className="h-4 w-20 bg-slate-100 rounded animate-pulse ml-auto" /></TableCell>
                                        <TableCell><div className="h-4 w-20 bg-slate-100 rounded animate-pulse ml-auto" /></TableCell>
                                        <TableCell><div className="h-4 w-16 bg-slate-100 rounded animate-pulse mx-auto" /></TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredPurchases.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center border-slate-100">
                                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                                            <ShoppingBag className="h-10 w-10 text-slate-300 mb-2" />
                                            <p className="font-medium text-slate-600">Nenhuma compra encontrada</p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {statusFilter !== "ALL" 
                                                    ? "Tente alterar o filtro de status"
                                                    : "Registre sua primeira entrada de estoque"
                                                }
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredPurchases.map((purchase) => {
                                    const supplierName = suppliers.get(purchase.supplierId) || "Fornecedor desconhecido";
                                    const paymentSummary = calculatePaymentSummary(purchase);
                                    const remainingAmount = paymentSummary.remaining;
                                    
                                    return (
                                        <TableRow
                                            key={purchase.id}
                                            className="cursor-pointer group hover:bg-slate-50 border-slate-100 transition-colors"
                                            onClick={() => router.push(`/purchases/${purchase.id}`)}
                                        >
                                            <TableCell className="font-medium text-slate-700">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                    {formatDate(purchase.date)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-7 w-7 border border-slate-200">
                                                        <AvatarFallback className="text-[10px] bg-orange-50 text-orange-600 font-semibold">
                                                            {getInitials(supplierName)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium text-slate-700">{supplierName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-semibold">
                                                    {purchase.items ? purchase.items.reduce((s, i) => s + i.quantity, 0) : 0}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className="font-bold text-slate-900">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(purchase.total)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {remainingAmount > 0 ? (
                                                    <span className="font-semibold text-red-600">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(remainingAmount)}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-400">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <PaymentStatusBadge
                                                    status={purchase.paymentStatus}
                                                    totalAmount={paymentSummary.total}
                                                    paidAmount={paymentSummary.paid}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
