"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Plus, Search, ShoppingBag, Calendar, Package, ArrowRight,
    Loader2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

import { Purchase } from "@/core/domain/Purchase";
import { Supplier } from "@/core/domain/Supplier";
import { getPurchaseRepository, getSupplierRepository } from "@/infrastructure/repositories/factory";

export default function PurchasesPage() {
    const router = useRouter();
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [suppliers, setSuppliers] = useState<Map<string, string>>(new Map());
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

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
                const sorted = pList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
        return idMatch || supplierMatch;
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
            </div>

            <div className="rounded-2xl border border-white/20 bg-card/40 backdrop-blur-xl shadow-lg shadow-purple-500/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-white/10">
                                <TableHead className="font-heading font-semibold text-primary/80">Data</TableHead>
                                <TableHead className="font-heading font-semibold text-primary/80">Fornecedor</TableHead>
                                <TableHead className="font-heading font-semibold text-primary/80 text-center">Itens</TableHead>
                                <TableHead className="font-heading font-semibold text-primary/80 text-right">Total</TableHead>
                                <TableHead className="font-heading font-semibold text-primary/80 w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="border-white/10">
                                        <TableCell><div className="h-4 w-24 bg-primary/10 rounded animate-pulse" /></TableCell>
                                        <TableCell><div className="h-4 w-32 bg-primary/10 rounded animate-pulse" /></TableCell>
                                        <TableCell><div className="h-4 w-12 bg-primary/10 rounded animate-pulse mx-auto" /></TableCell>
                                        <TableCell><div className="h-4 w-20 bg-primary/10 rounded animate-pulse ml-auto" /></TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredPurchases.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground border-white/10">
                                        Nenhuma compra encontrada.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredPurchases.map((purchase) => {
                                    const supplierName = suppliers.get(purchase.supplierId) || "Fornecedor desconhecido";
                                    return (
                                        <TableRow
                                            key={purchase.id}
                                            className="cursor-pointer group hover:bg-white/40 border-white/10 transition-colors"
                                            onClick={() => router.push(`/purchases/${purchase.id}`)}
                                        >
                                            <TableCell className="font-medium text-slate-700">
                                                {format(new Date(purchase.date), 'dd/MM/yyyy')}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6 border border-white/50">
                                                        <AvatarFallback className="text-[10px] bg-orange-100 text-orange-600">
                                                            {getInitials(supplierName)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium text-slate-700">{supplierName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="secondary" className="bg-white/50">{purchase.items ? purchase.items.reduce((s, i) => s + i.quantity, 0) : 0}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="font-bold text-slate-700">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(purchase.total)}
                                                    </span>
                                                    {purchase.paymentStatus === 'PENDING' && (
                                                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 text-xs">Pendente</Badge>
                                                    )}
                                                    {purchase.paymentStatus === 'PARTIAL' && (
                                                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">Parcial</Badge>
                                                    )}
                                                    {purchase.paymentStatus === 'PAID' && (
                                                        <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">Pago</Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
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
