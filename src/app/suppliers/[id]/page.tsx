"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    ArrowLeft, Pencil, Trash2, Phone, MessageCircle, Mail, Truck,
    ShoppingBag, Loader2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { DeleteSupplierDialog } from "@/components/suppliers/DeleteSupplierDialog";

import { Supplier } from "@/core/domain/Supplier";
import { Purchase } from "@/core/domain/Purchase";
import { LocalStorageSupplierRepository } from "@/infrastructure/repositories/LocalStorageSupplierRepository";
import { LocalStoragePurchaseRepository } from "@/infrastructure/repositories/LocalStoragePurchaseRepository";
import { formatDate } from "@/core/formatters/date";
import { formatPhone } from "@/core/formatters/phone";

export default function SupplierProfilePage() {
    const params = useParams();
    const router = useRouter();
    const [supplier, setSupplier] = useState<Supplier | null>(null);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const supplierRepo = new LocalStorageSupplierRepository();
    const purchaseRepo = new LocalStoragePurchaseRepository();

    useEffect(() => {
        const fetchData = async () => {
            if (!params.id) return;
            const supplierId = params.id as string;

            try {
                const s = await supplierRepo.getById(supplierId);
                const p = await purchaseRepo.getAll({ supplierId });

                if (!s) {
                    router.push("/suppliers");
                    return;
                }
                setSupplier(s);
                setPurchases(p);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [params.id]);

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    if (!supplier) return null;

    const totalSpent = purchases.reduce((acc, p) => acc + p.total, 0);

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight font-heading flex items-center gap-2">
                            {supplier.name}
                            <Badge variant={supplier.status === 'ACTIVE' ? 'default' : 'secondary'} className={supplier.status === 'ACTIVE' ? 'bg-green-500 hover:bg-green-600' : ''}>
                                {supplier.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                            </Badge>
                        </h1>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Truck className="h-3 w-3" /> Fornecedor desde {format(new Date(supplier.createdAt), "MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild className="rounded-xl border-white/20 bg-white/40 hover:bg-white/60">
                        <Link href={`/suppliers/${supplier.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                        </Link>
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)} className="rounded-xl">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Panel: Stats/Overview */}
                <Card className="md:col-span-1 border-white/20 bg-card/40 backdrop-blur-xl shadow-lg shadow-purple-500/5 h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg font-heading">Visão Geral</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <ShoppingBag className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total em Compras</p>
                                <p className="text-xl font-bold text-foreground">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalSpent)}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/10">
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Contatos</p>
                                <div className="space-y-2 text-sm">
                                    {supplier.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-primary/70" />
                                            <span>{formatPhone(supplier.phone)}</span>
                                        </div>
                                    )}
                                    {supplier.whatsapp && (
                                        <div className="flex items-center gap-2">
                                            <MessageCircle className="h-4 w-4 text-green-500/70" />
                                            <span>{formatPhone(supplier.whatsapp)}</span>
                                        </div>
                                    )}
                                    {supplier.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-blue-500/70" />
                                            <span className="truncate">{supplier.email}</span>
                                        </div>
                                    )}
                                    {!supplier.phone && !supplier.whatsapp && !supplier.email && (
                                        <span className="text-muted-foreground text-xs italic">Nenhum contato registrado</span>
                                    )}
                                </div>
                            </div>

                            {supplier.cnpj && (
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Dados Fiscais</p>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Badge variant="outline" className="font-mono text-xs">{supplier.cnpj}</Badge>
                                    </div>
                                </div>
                            )}

                            {supplier.notes && (
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Observações</p>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{supplier.notes}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Right Panel: Tabs */}
                <div className="md:col-span-2">
                    <Tabs defaultValue="purchases" className="w-full">
                        <TabsList className="bg-white/40 border border-white/20 backdrop-blur-xl mb-4 w-full justify-start rounded-xl p-1 h-12">
                            <TabsTrigger value="purchases" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg h-9 px-4">Histórico de Compras</TabsTrigger>
                        </TabsList>

                        <TabsContent value="purchases">
                            <Card className="border-white/20 bg-card/40 backdrop-blur-xl shadow-lg shadow-purple-500/5">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-lg font-heading">Compras Registradas</CardTitle>
                                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">{purchases.length} compras</Badge>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-xl border border-white/10 overflow-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-white/5 hover:bg-white/5 border-white/10">
                                                    <TableHead>Data</TableHead>
                                                    <TableHead>Ref</TableHead>
                                                    <TableHead className="text-right">Itens</TableHead>
                                                    <TableHead className="text-right">Total</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {purchases.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">Nenhuma compra registrada.</TableCell>
                                                    </TableRow>
                                                ) : (
                                                    purchases.map(purchase => (
                                                        <TableRow key={purchase.id} className="hover:bg-white/40 border-white/10 cursor-pointer" onClick={() => router.push(`/purchases/${purchase.id}`)}>
                                                            <TableCell>{purchase.date ? formatDate(purchase.date, 'UTC') : '-'}</TableCell>
                                                            <TableCell className="font-mono text-xs text-muted-foreground">#{purchase.id.slice(0, 8)}</TableCell>
                                                            <TableCell className="text-right">{purchase.items ? purchase.items.reduce((s, i) => s + i.quantity, 0) : 0}</TableCell>
                                                            <TableCell className="text-right font-medium">
                                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(purchase.total)}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            <DeleteSupplierDialog
                isOpen={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                supplierId={supplier.id}
                supplierName={supplier.name}
                onSuccess={() => router.push('/suppliers')}
            />
        </div>
    );
}
