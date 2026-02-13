"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    ArrowLeft, Pencil, Trash2, Phone, MessageCircle, Mail, Truck,
    ShoppingBag, Loader2, TrendingUp, Package, DollarSign, Calendar,
    Clock, AlertTriangle, Info, AlertCircle, BarChart3
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { DeleteSupplierDialog } from "@/components/suppliers/DeleteSupplierDialog";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

import { Supplier } from "@/core/domain/Supplier";
import { Purchase } from "@/core/domain/Purchase";
import { getSupplierRepository, getPurchaseRepository } from "@/infrastructure/repositories/factory";
import { getSupplierOverview, SupplierOverview, SupplierAlert } from "@/core/usecases/suppliers/getSupplierOverview";
import { formatDate } from "@/core/formatters/date";
import { formatPhone } from "@/core/formatters/phone";

export default function SupplierProfilePage() {
    const params = useParams();
    const router = useRouter();
    const [supplier, setSupplier] = useState<Supplier | null>(null);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [overview, setOverview] = useState<SupplierOverview | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const supplierRepo = getSupplierRepository();
    const purchaseRepo = getPurchaseRepository();

    useEffect(() => {
        const fetchData = async () => {
            if (!params.id) return;
            const supplierId = params.id as string;

            try {
                const s = await supplierRepo.getById(supplierId);
                const p = await purchaseRepo.getAll({ supplierId });
                const o = await getSupplierOverview(supplierId);

                if (!s) {
                    router.push("/suppliers");
                    return;
                }
                setSupplier(s);
                setPurchases(p);
                setOverview(o);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [params.id]);

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    if (!supplier || !overview) return null;

    const { metrics, alerts, charts, products } = overview;

    // Calcular dias como fornecedor
    const daysSinceRegistration = metrics.supplierSince
        ? Math.floor((new Date().getTime() - new Date(metrics.supplierSince).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    // Formatar dados para gráficos
    const purchasesChartData = charts.purchasesByMonth.map(item => ({
        mes: new Date(item.month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        valor: item.total,
        compras: item.count
    }));

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const getAlertIcon = (alert: SupplierAlert) => {
        switch (alert.severity) {
            case 'error':
                return <AlertCircle className="h-4 w-4" />;
            case 'warning':
                return <AlertTriangle className="h-4 w-4" />;
            case 'info':
                return <Info className="h-4 w-4" />;
            default:
                return <Info className="h-4 w-4" />;
        }
    };

    const getAlertClass = (severity: string) => {
        switch (severity) {
            case 'error':
                return 'border-red-200 bg-red-50 text-red-900';
            case 'warning':
                return 'border-yellow-200 bg-yellow-50 text-yellow-900';
            case 'info':
                return 'border-blue-200 bg-blue-50 text-blue-900';
            default:
                return 'border-gray-200 bg-gray-50 text-gray-900';
        }
    };

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
            <div className="space-y-6">
                {/* Alertas */}
                {alerts.length > 0 && (
                    <div className="space-y-2">
                        {alerts.map((alert, index) => (
                            <Alert key={index} className={getAlertClass(alert.severity)}>
                                <div className="flex items-center gap-2">
                                    {getAlertIcon(alert)}
                                    <AlertDescription className="font-medium">
                                        {alert.message}
                                    </AlertDescription>
                                </div>
                            </Alert>
                        ))}
                    </div>
                )}

                {/* Métricas Principais */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-card/40 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(metrics.totalSpent)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Valor total em compras
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/40 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total de Compras</CardTitle>
                            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.totalPurchases}</div>
                            <p className="text-xs text-muted-foreground">
                                Compras realizadas
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/40 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(metrics.averageTicket)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Valor médio por compra
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/40 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Produtos Diferentes</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.totalProducts}</div>
                            <p className="text-xs text-muted-foreground">
                                Produtos comprados
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Métricas Secundárias */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="bg-card/40 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Última Compra</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {metrics.lastPurchaseDate ? (
                                <>
                                    <div className="text-2xl font-bold">
                                        {Math.max(0, Math.floor((new Date().getTime() - new Date(metrics.lastPurchaseDate).getTime()) / (1000 * 60 * 60 * 24)))}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {Math.floor((new Date().getTime() - new Date(metrics.lastPurchaseDate).getTime()) / (1000 * 60 * 60 * 24)) === 0 
                                            ? `Hoje (${formatDate(metrics.lastPurchaseDate)})`
                                            : `dias atrás (${formatDate(metrics.lastPurchaseDate)})`
                                        }
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="text-2xl font-bold">--</div>
                                    <p className="text-xs text-muted-foreground">
                                        Nenhuma compra registrada
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-card/40 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Frequência Média</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {metrics.averageFrequency > 0 ? Math.round(metrics.averageFrequency) : '--'}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {metrics.averageFrequency > 0 ? 'Dias entre compras' : 'Sem dados suficientes'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/40 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Fornecedor Desde</CardTitle>
                            <Truck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{daysSinceRegistration}</div>
                            <p className="text-xs text-muted-foreground">
                                {daysSinceRegistration === 1 ? 'Dia como fornecedor' : 'Dias como fornecedor'}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Panel: Stats/Overview */}
                <Card className="md:col-span-1 border-white/20 bg-card/40 backdrop-blur-xl shadow-lg shadow-purple-500/5 h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg font-heading">Informações</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4 border-b border-white/10 pb-4">
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
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="bg-white/40 border border-white/20 backdrop-blur-xl mb-4 w-full justify-start rounded-xl p-1 h-12">
                            <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg h-9 px-4">Visão Geral</TabsTrigger>
                            <TabsTrigger value="products" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg h-9 px-4">Produtos</TabsTrigger>
                            <TabsTrigger value="purchases" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg h-9 px-4">Histórico</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4">
                            {/* Gráfico de Evolução */}
                            {purchasesChartData.length > 0 && (
                                <Card className="border-white/20 bg-card/40 backdrop-blur-xl shadow-lg shadow-purple-500/5">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <BarChart3 className="h-5 w-5 text-primary" />
                                            Evolução de Compras (Últimos 6 Meses)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={purchasesChartData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                <XAxis 
                                                    dataKey="mes" 
                                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                                />
                                                <YAxis 
                                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                                    tickFormatter={(value) => `R$ ${value}`}
                                                />
                                                <Tooltip 
                                                    formatter={(value: number | undefined, name: string | undefined) => {
                                                        if (!value) return ['0', name || ''];
                                                        if (name === 'valor') return [formatCurrency(value), 'Valor'];
                                                        return [value, 'Compras'];
                                                    }}
                                                    contentStyle={{
                                                        backgroundColor: '#ffffff',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                                    }}
                                                    labelStyle={{ color: '#1e293b', fontWeight: 600 }}
                                                />
                                                <Legend />
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="valor" 
                                                    stroke="#f97316" 
                                                    strokeWidth={3}
                                                    dot={{ fill: '#f97316', r: 5, strokeWidth: 2, stroke: '#ffffff' }}
                                                    activeDot={{ r: 7, strokeWidth: 2, stroke: '#ffffff' }}
                                                    name="Valor"
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Top Produtos */}
                            {charts.topProducts.length > 0 && (
                                <Card className="border-white/20 bg-card/40 backdrop-blur-xl shadow-lg shadow-purple-500/5">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Package className="h-5 w-5 text-primary" />
                                            Top 5 Produtos Mais Comprados
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={charts.topProducts} layout="vertical">
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                <XAxis 
                                                    type="number"
                                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                                />
                                                <YAxis 
                                                    type="category"
                                                    dataKey="productName" 
                                                    tick={{ fill: '#1e293b', fontSize: 12, fontWeight: 500 }}
                                                    width={150}
                                                    tickFormatter={(value) => {
                                                        if (value.length > 20) {
                                                            return value.substring(0, 20) + '...';
                                                        }
                                                        return value;
                                                    }}
                                                />
                                                <Tooltip 
                                                    formatter={(value: number | undefined) => [formatCurrency(value || 0), 'Total Gasto']}
                                                    contentStyle={{
                                                        backgroundColor: '#ffffff',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                                    }}
                                                    labelStyle={{ color: '#1e293b', fontWeight: 600 }}
                                                    cursor={{ fill: '#f1f5f9' }}
                                                />
                                                <Bar 
                                                    dataKey="totalSpent" 
                                                    fill="#f97316" 
                                                    radius={[0, 8, 8, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="products">
                            <Card className="border-white/20 bg-card/40 backdrop-blur-xl shadow-lg shadow-purple-500/5">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-lg font-heading">Produtos Fornecidos</CardTitle>
                                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">{products.length} produtos</Badge>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-xl border border-white/10 overflow-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-white/5 hover:bg-white/5 border-white/10">
                                                    <TableHead>Produto</TableHead>
                                                    <TableHead className="text-right">Qtd Total</TableHead>
                                                    <TableHead className="text-right">Preço Médio</TableHead>
                                                    <TableHead className="text-right">Última Compra</TableHead>
                                                    <TableHead className="text-right">Total Gasto</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {products.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Nenhum produto comprado.</TableCell>
                                                    </TableRow>
                                                ) : (
                                                    products.map(product => (
                                                        <TableRow key={product.productId} className="hover:bg-white/40 border-white/10">
                                                            <TableCell className="font-medium">{product.productName}</TableCell>
                                                            <TableCell className="text-right">{product.totalQuantity}</TableCell>
                                                            <TableCell className="text-right">{formatCurrency(product.averagePrice)}</TableCell>
                                                            <TableCell className="text-right text-sm text-muted-foreground">
                                                                {product.lastPurchaseDate ? formatDate(product.lastPurchaseDate) : '-'}
                                                            </TableCell>
                                                            <TableCell className="text-right font-medium text-primary">
                                                                {formatCurrency(product.totalSpent)}
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
                                                    <TableHead>Nº Compra</TableHead>
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
                                                    purchases.map((purchase, index) => (
                                                        <TableRow key={purchase.id} className="hover:bg-white/40 border-white/10 cursor-pointer" onClick={() => router.push(`/purchases/${purchase.id}`)}>
                                                            <TableCell>{purchase.date ? formatDate(purchase.date, 'UTC') : '-'}</TableCell>
                                                            <TableCell className="font-mono text-xs text-muted-foreground">#{(purchases.length - index).toString().padStart(3, '0')}</TableCell>
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
