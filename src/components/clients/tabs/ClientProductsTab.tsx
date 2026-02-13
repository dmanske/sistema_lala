"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, TrendingUp, Package, Star } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getSaleRepository } from "@/infrastructure/repositories/factory";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SaleItem } from "@/core/domain/sales/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ClientProductsTabProps {
    clientId: string;
}

interface ProductAggregate {
    productId: string;
    productName: string;
    totalQuantity: number;
    totalSpent: number;
    lastPurchase: Date;
    purchaseCount: number;
}

export function ClientProductsTab({ clientId }: ClientProductsTabProps) {
    const [aggregates, setAggregates] = useState<ProductAggregate[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<'quantity' | 'spent' | 'recent'>('quantity');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const saleRepo = getSaleRepository();
                const sales = await saleRepo.findByCustomerId(clientId);

                // Aggregate products
                const productMap = new Map<string, ProductAggregate>();

                sales.forEach(sale => {
                    if (sale.status !== 'canceled' && sale.items) {
                        sale.items.filter((i: SaleItem) => i.itemType === 'product').forEach(item => {
                            const existing = productMap.get(item.productId || item.name);
                            const itemTotal = item.unitPrice * item.qty;
                            const saleDate = new Date(sale.createdAt);

                            if (existing) {
                                existing.totalQuantity += item.qty;
                                existing.totalSpent += itemTotal;
                                existing.purchaseCount += 1;
                                if (saleDate > existing.lastPurchase) {
                                    existing.lastPurchase = saleDate;
                                }
                            } else {
                                productMap.set(item.productId || item.name, {
                                    productId: item.productId || item.name,
                                    productName: item.name,
                                    totalQuantity: item.qty,
                                    totalSpent: itemTotal,
                                    lastPurchase: saleDate,
                                    purchaseCount: 1
                                });
                            }
                        });
                    }
                });

                setAggregates(Array.from(productMap.values()));
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [clientId]);

    const sortedAggregates = [...aggregates].sort((a, b) => {
        switch (sortBy) {
            case 'quantity':
                return b.totalQuantity - a.totalQuantity;
            case 'spent':
                return b.totalSpent - a.totalSpent;
            case 'recent':
                return b.lastPurchase.getTime() - a.lastPurchase.getTime();
            default:
                return 0;
        }
    });

    const totalProducts = aggregates.length;
    const totalSpent = aggregates.reduce((sum, p) => sum + p.totalSpent, 0);
    const favoriteProduct = aggregates.length > 0 
        ? aggregates.reduce((max, p) => p.totalQuantity > max.totalQuantity ? p : max)
        : null;

    if (loading) return <div className="p-4 text-center text-muted-foreground">Carregando histórico...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-none shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-purple-100 flex items-center">
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            Total Gasto
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalSpent)}
                        </div>
                        <p className="text-xs text-purple-200 mt-1">
                            Em produtos
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-none shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-100 flex items-center">
                            <Package className="h-4 w-4 mr-2" />
                            Produtos Diferentes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{totalProducts}</div>
                        <p className="text-xs text-blue-200 mt-1">
                            Tipos comprados
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-none shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-amber-100 flex items-center">
                            <Star className="h-4 w-4 mr-2" />
                            Produto Favorito
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold truncate">
                            {favoriteProduct?.productName || '-'}
                        </div>
                        <p className="text-xs text-amber-200 mt-1">
                            {favoriteProduct ? `${favoriteProduct.totalQuantity} unidades` : 'Nenhuma compra'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Products Table */}
            <Card className="border-none bg-white/60 backdrop-blur-xl shadow-xl shadow-purple-500/5">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <CardTitle className="text-xl font-bold font-heading">Histórico de Produtos</CardTitle>
                        <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                            <SelectTrigger className="w-[200px] bg-white/50">
                                <SelectValue placeholder="Ordenar por" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="quantity">Mais Comprado</SelectItem>
                                <SelectItem value="spent">Maior Gasto</SelectItem>
                                <SelectItem value="recent">Mais Recente</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Produto</TableHead>
                                <TableHead className="text-center">Qtd Total</TableHead>
                                <TableHead className="text-center">Compras</TableHead>
                                <TableHead className="text-right">Última Compra</TableHead>
                                <TableHead className="text-right">Total Gasto</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedAggregates.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        Nenhuma compra de produto registrada.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sortedAggregates.map((product, idx) => (
                                    <TableRow key={product.productId} className="group hover:bg-slate-50/50">
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                {idx === 0 && sortBy === 'quantity' && (
                                                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                                )}
                                                {product.productName}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary" className="font-mono">
                                                {product.totalQuantity}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className="font-mono">
                                                {product.purchaseCount}x
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground text-sm">
                                            {format(product.lastPurchase, "dd/MM/yyyy", { locale: ptBR })}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold text-primary">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.totalSpent)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
