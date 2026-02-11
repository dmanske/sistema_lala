
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getSaleRepository } from "@/infrastructure/repositories/factory";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SaleItem } from "@/core/domain/sales/types";

interface ClientProductsTabProps {
    clientId: string;
}

interface ProductHistoryItem {
    id: string;
    date: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    origin: 'Atendimento' | 'Avulso';
    saleId: string;
}

export function ClientProductsTab({ clientId }: ClientProductsTabProps) {
    const [history, setHistory] = useState<ProductHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalSpent, setTotalSpent] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const saleRepo = getSaleRepository();
                const sales = await saleRepo.findByCustomerId(clientId);

                let items: ProductHistoryItem[] = [];
                let total = 0;

                sales.forEach(sale => {
                    if (sale.status !== 'canceled' && sale.items) {
                        sale.items.filter((i: SaleItem) => i.itemType === 'product').forEach(item => {
                            const itemTotal = item.unitPrice * item.qty;
                            total += itemTotal;
                            items.push({
                                id: item.id || crypto.randomUUID(),
                                date: sale.createdAt,
                                productName: item.name,
                                quantity: item.qty,
                                unitPrice: item.unitPrice,
                                totalPrice: itemTotal,
                                origin: sale.appointmentId ? 'Atendimento' : 'Avulso',
                                saleId: sale.id
                            });
                        });
                    }
                });

                // Sort by date desc
                items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setHistory(items);
                setTotalSpent(total);

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [clientId]);

    if (loading) return <div className="p-4 text-center text-muted-foreground">Carregando histórico...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Summary Card */}
            <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-none shadow-lg">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-purple-100 flex items-center">
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Total Gasto em Produtos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalSpent)}
                    </div>
                    <p className="text-xs text-purple-200 mt-1">
                        {history.length} itens comprados
                    </p>
                </CardContent>
            </Card>

            <Card className="border-none bg-white/60 backdrop-blur-xl shadow-xl shadow-purple-500/5">
                <CardHeader>
                    <CardTitle className="text-xl font-bold font-heading">Histórico de Compras</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Produto</TableHead>
                                <TableHead className="text-center">Qtd</TableHead>
                                <TableHead className="text-right">Valor Total</TableHead>
                                <TableHead className="text-right">Origem</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        Nenhuma compra registrada.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                history.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="text-muted-foreground">
                                            {format(new Date(item.date), "dd/MM/yyyy", { locale: ptBR })}
                                        </TableCell>
                                        <TableCell className="font-medium">{item.productName}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary" className="font-mono">{item.quantity}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.totalPrice)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant={item.origin === 'Atendimento' ? 'default' : 'outline'}>
                                                {item.origin}
                                            </Badge>
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
