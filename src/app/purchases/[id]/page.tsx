"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    ArrowLeft, Calendar, Package, ShoppingBag, Truck, Loader2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

import { Purchase } from "@/core/domain/Purchase";
import { Supplier } from "@/core/domain/Supplier";
import { Product } from "@/core/domain/Product";
import { LocalStoragePurchaseRepository } from "@/infrastructure/repositories/LocalStoragePurchaseRepository";
import { LocalStorageSupplierRepository } from "@/infrastructure/repositories/LocalStorageSupplierRepository";
import { LocalStorageProductRepository } from "@/infrastructure/repositories/LocalStorageProductRepository";
import { formatPhone } from "@/core/formatters/phone";

export default function PurchaseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [purchase, setPurchase] = useState<Purchase | null>(null);
    const [supplier, setSupplier] = useState<Supplier | null>(null);
    const [products, setProducts] = useState<Map<string, string>>(new Map());
    const [isLoading, setIsLoading] = useState(true);

    const purchaseRepo = new LocalStoragePurchaseRepository();
    const supplierRepo = new LocalStorageSupplierRepository();
    const productRepo = new LocalStorageProductRepository();

    useEffect(() => {
        const load = async () => {
            if (!params.id) return;
            try {
                const p = await purchaseRepo.getById(params.id as string);
                if (!p) {
                    router.push("/purchases");
                    return;
                }
                setPurchase(p);

                const [s, prodList] = await Promise.all([
                    supplierRepo.getById(p.supplierId),
                    productRepo.getAll()
                ]);

                if (s) setSupplier(s);

                const prodMap = new Map<string, string>();
                prodList.forEach(prod => prodMap.set(prod.id, prod.name));
                setProducts(prodMap);

            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [params.id]);

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    if (!purchase) return null;

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight font-heading">
                            Entrada #{purchase.id.slice(0, 8)}
                        </h1>
                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                            Concluída
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4" /> {format(new Date(purchase.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Details */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="border-white/20 bg-card/40 backdrop-blur-xl shadow-lg shadow-purple-500/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 font-heading">
                                <ShoppingBag className="h-5 w-5 text-primary" /> Itens da Compra
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-xl border border-white/10 overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-white/5 border-white/10 hover:bg-white/5">
                                            <TableHead>Produto</TableHead>
                                            <TableHead className="text-center">Qtd.</TableHead>
                                            <TableHead className="text-right">Custo Unit.</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {purchase.items?.map((item, index) => (
                                            <TableRow key={index} className="hover:bg-white/5 border-white/10">
                                                <TableCell className="font-medium text-slate-700">
                                                    {products.get(item.productId) || "Produto removido"}
                                                </TableCell>
                                                <TableCell className="text-center">{item.quantity}</TableCell>
                                                <TableCell className="text-right">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unitCost)}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.quantity * item.unitCost)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="flex justify-end pt-6">
                                <div className="text-right bg-primary/5 p-4 rounded-xl border border-primary/10 min-w-[200px]">
                                    <p className="text-sm text-muted-foreground mb-1">Total</p>
                                    <p className="text-3xl font-bold text-primary font-heading">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(purchase.total)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {purchase.notes && (
                        <Card className="border-white/20 bg-card/40 backdrop-blur-xl shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">Observações</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-700 whitespace-pre-wrap">{purchase.notes}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Supplier Info */}
                <div className="md:col-span-1">
                    <Card className="border-white/20 bg-card/40 backdrop-blur-xl shadow-lg shadow-purple-500/5 h-fit">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 font-heading text-lg">
                                <Truck className="h-5 w-5 text-muted-foreground" /> Fornecedor
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {supplier ? (
                                <div className="space-y-4">
                                    <div>
                                        <p className="font-bold text-lg text-slate-800">{supplier.name}</p>
                                        <Badge variant={supplier.status === 'ACTIVE' ? 'outline' : 'secondary'} className="mt-2 text-xs">
                                            {supplier.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                                        </Badge>
                                    </div>
                                    <Separator className="bg-white/10" />
                                    <div className="space-y-2 text-sm text-slate-600">
                                        {supplier.phone && <p>Tel: {formatPhone(supplier.phone)}</p>}
                                        {supplier.email && <p>Email: {supplier.email}</p>}
                                        {supplier.cnpj && <p>CNPJ: {supplier.cnpj}</p>}
                                    </div>
                                    <Button variant="outline" className="w-full bg-white/40 border-white/20" onClick={() => router.push(`/suppliers/${supplier.id}`)}>
                                        Ver Perfil
                                    </Button>
                                </div>
                            ) : (
                                <p className="text-muted-foreground italic">Fornecedor não encontrado ou removido.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
