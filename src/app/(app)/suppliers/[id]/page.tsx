"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    ArrowLeft, Pencil, Trash2, Phone, MessageCircle, Mail, Truck,
    ShoppingBag, Loader2, TrendingUp, Package, DollarSign, Calendar,
    Clock, AlertTriangle, Info, AlertCircle, BarChart3, TrendingDown,
    Activity, ChevronLeft, Edit2
} from "lucide-react";
import { cn } from "@/lib/utils";

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

    const handleEdit = () => {
        router.push(`/suppliers/${supplier?.id}/edit`);
    };

    if (isLoading || !supplier || !overview) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
                <Loader2 className="h-10 w-10 text-violet-600 animate-spin" />
                <p className="text-slate-500 font-medium animate-pulse">Carregando perfil do fornecedor...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Header / Banner Modernizado - Tema Violeta */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-800 p-8 text-white shadow-2xl shadow-purple-500/20 mb-8">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-3xl -mr-32 -mt-32 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-32 -mb-32" />

                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-5">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md h-12 w-12 rounded-2xl shadow-lg transition-all"
                            onClick={() => router.push("/suppliers")}
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md px-3 py-1 font-bold text-[10px] uppercase tracking-widest">
                                    Perfil do Fornecedor
                                </Badge>
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)] animate-pulse" title="Parceria Ativa" />
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold tracking-tight font-heading drop-shadow-sm">
                                {supplier.name}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center">
                        <Button
                            variant="outline"
                            onClick={handleEdit}
                            className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-md rounded-xl px-5 h-11 font-semibold transition-all hover:scale-105"
                        >
                            <Edit2 className="mr-2 h-4 w-4" />
                            Editar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => setIsDeleteDialogOpen(true)}
                            className="bg-rose-500 hover:bg-rose-600 text-white border-0 rounded-xl px-5 h-11 font-semibold shadow-lg shadow-rose-500/20 transition-all hover:scale-105"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
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
                    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-100 border">
                        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-white/40 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Total Gasto</CardTitle>
                            <div className="p-2.5 rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110 bg-emerald-50 text-emerald-600 shadow-emerald-100">
                                <DollarSign className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900 tracking-tight">{formatCurrency(metrics.totalSpent)}</div>
                            <p className="text-xs text-slate-600 mt-2 font-medium">Valor total em compras</p>
                        </CardContent>
                    </Card>

                    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-100 border">
                        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-white/40 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Total de Compras</CardTitle>
                            <div className="p-2.5 rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110 bg-blue-50 text-blue-600 shadow-blue-100">
                                <ShoppingBag className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900 tracking-tight">{metrics.totalPurchases}</div>
                            <p className="text-xs text-slate-600 mt-2 font-medium">Compras realizadas</p>
                        </CardContent>
                    </Card>

                    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-100 border">
                        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-white/40 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Ticket Médio</CardTitle>
                            <div className="p-2.5 rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110 bg-purple-50 text-purple-600 shadow-purple-100">
                                <TrendingUp className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900 tracking-tight">{formatCurrency(metrics.averageTicket)}</div>
                            <p className="text-xs text-slate-600 mt-2 font-medium">Valor médio por compra</p>
                        </CardContent>
                    </Card>

                    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-100 border">
                        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-white/40 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Produtos</CardTitle>
                            <div className="p-2.5 rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110 bg-orange-50 text-orange-600 shadow-orange-100">
                                <Package className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900 tracking-tight">{metrics.totalProducts}</div>
                            <p className="text-xs text-slate-600 mt-2 font-medium">Itens diferentes catalogados</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Métricas Secundárias */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-slate-500/5 to-slate-500/10 border-slate-200 border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Última Compra</CardTitle>
                            <div className="p-2.5 rounded-xl shadow-sm bg-slate-100 text-slate-600">
                                <Clock className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {metrics.lastPurchaseDate ? (
                                <>
                                    <div className="text-3xl font-bold text-slate-900 tracking-tight">
                                        {Math.max(0, Math.floor((new Date().getTime() - new Date(metrics.lastPurchaseDate).getTime()) / (1000 * 60 * 60 * 24)))}
                                    </div>
                                    <p className="text-xs text-slate-600 mt-2 font-medium">
                                        {Math.floor((new Date().getTime() - new Date(metrics.lastPurchaseDate).getTime()) / (1000 * 60 * 60 * 24)) === 0
                                            ? `Hoje (${formatDate(metrics.lastPurchaseDate)})`
                                            : `dias atrás (${formatDate(metrics.lastPurchaseDate)})`
                                        }
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="text-3xl font-bold text-slate-400">--</div>
                                    <p className="text-xs text-slate-500 mt-2">Nenhuma compra registrada</p>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-indigo-500/5 to-indigo-500/10 border-indigo-100 border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Frequência</CardTitle>
                            <div className="p-2.5 rounded-xl shadow-sm bg-indigo-50 text-indigo-600 shadow-indigo-100">
                                <Activity className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900 tracking-tight">
                                {metrics.averageFrequency > 0 ? Math.round(metrics.averageFrequency) : '--'}
                            </div>
                            <p className="text-xs text-slate-600 mt-2 font-medium">
                                {metrics.averageFrequency > 0 ? 'Média de dias entre compras' : 'Sem dados suficientes'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-100 border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Tempo de Casa</CardTitle>
                            <div className="p-2.5 rounded-xl shadow-sm bg-amber-50 text-amber-600 shadow-amber-100">
                                <Calendar className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900 tracking-tight">{daysSinceRegistration}</div>
                            <p className="text-xs text-slate-600 mt-2 font-medium">
                                {daysSinceRegistration === 1 ? 'Dia de parceria' : 'Dias de parceria ativa'}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Panel: Stats/Overview */}
                <Card className="md:col-span-1 border-slate-200 bg-white shadow-lg shadow-orange-500/5 h-fit overflow-hidden rounded-2xl transition-all hover:shadow-orange-500/10 hover:-translate-y-1">
                    <div className="h-2 bg-gradient-to-r from-orange-400 to-amber-500" />
                    <CardHeader>
                        <CardTitle className="text-xl font-heading flex items-center gap-2">
                            <Info className="h-5 w-5 text-orange-500" />
                            Informações
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-6">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Contatos Principais</p>
                                <div className="space-y-3">
                                    {supplier.phone && (
                                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 group transition-all hover:bg-white hover:border-orange-200 hover:shadow-sm">
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                                                <Phone className="h-4 w-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs text-slate-400 font-medium">Telefone</span>
                                                <span className="text-sm font-semibold text-slate-700">{formatPhone(supplier.phone)}</span>
                                            </div>
                                        </div>
                                    )}
                                    {supplier.whatsapp && (
                                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 group transition-all hover:bg-white hover:border-emerald-200 hover:shadow-sm">
                                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100 transition-colors">
                                                <MessageCircle className="h-4 w-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs text-slate-400 font-medium">WhatsApp</span>
                                                <span className="text-sm font-semibold text-slate-700">{formatPhone(supplier.whatsapp)}</span>
                                            </div>
                                        </div>
                                    )}
                                    {supplier.email && (
                                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 group transition-all hover:bg-white hover:border-blue-200 hover:shadow-sm">
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                                                <Mail className="h-4 w-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs text-slate-400 font-medium">E-mail</span>
                                                <span className="text-sm font-semibold text-slate-700 truncate max-w-[180px]">{supplier.email}</span>
                                            </div>
                                        </div>
                                    )}
                                    {!supplier.phone && !supplier.whatsapp && !supplier.email && (
                                        <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                            <p className="text-xs text-slate-400 italic">Nenhum contato registrado</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {supplier.cnpj && (
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Dados Fiscais</p>
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-slate-400 font-medium">CNPJ</span>
                                            <span className="text-sm font-mono font-bold text-slate-700">{supplier.cnpj}</span>
                                        </div>
                                        <Badge variant="outline" className="bg-white text-[10px] text-slate-500 border-slate-200 uppercase tracking-tighter">Oficial</Badge>
                                    </div>
                                </div>
                            )}

                            {supplier.notes && (
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Observações Internas</p>
                                    <div className="p-3 bg-orange-50/30 rounded-xl border border-orange-100/50">
                                        <p className="text-sm text-slate-600 leading-relaxed italic">{supplier.notes}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Right Panel: Tabs */}
                <div className="md:col-span-2">
                    <Tabs defaultValue="overview" className="w-full space-y-6">
                        <TabsList className="bg-white border p-1 rounded-xl shadow-sm w-full md:w-auto grid grid-cols-3 md:inline-flex h-11">
                            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 transition-all font-medium">Visão Geral</TabsTrigger>
                            <TabsTrigger value="products" className="rounded-lg data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 transition-all font-medium">Produtos</TabsTrigger>
                            <TabsTrigger value="purchases" className="rounded-lg data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 transition-all font-medium">Histórico</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4">
                            {/* Gráfico de Evolução */}
                            {purchasesChartData.length > 0 && (
                                <Card className="border-slate-200 shadow-lg shadow-orange-500/5 rounded-2xl overflow-hidden transition-all hover:shadow-orange-500/10">
                                    <CardHeader className="pb-2 border-b border-slate-50 bg-slate-50/50">
                                        <CardTitle className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-lg">
                                                <div className="p-2 bg-orange-50 rounded-lg">
                                                    <TrendingUp className="h-5 w-5 text-orange-500" />
                                                </div>
                                                Evolução de Compras
                                            </div>
                                            <Badge variant="outline" className="bg-white text-slate-500 border-slate-200">Últimos 6 meses</Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={purchasesChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.1} />
                                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                                <XAxis
                                                    dataKey="mes"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                                                    dy={10}
                                                />
                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                                                    tickFormatter={(value) => `R$ ${value}`}
                                                    dx={-10}
                                                />
                                                <Tooltip
                                                    cursor={{ stroke: '#f97316', strokeWidth: 1, strokeDasharray: '4 4' }}
                                                    formatter={(value: number | undefined, name: string | undefined) => {
                                                        if (!value) return ['0', name || ''];
                                                        if (name === 'valor') return [formatCurrency(value), 'Investimento'];
                                                        return [value, 'Qtd. Compras'];
                                                    }}
                                                    contentStyle={{
                                                        backgroundColor: '#ffffff',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '12px',
                                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                                        padding: '12px'
                                                    }}
                                                    labelStyle={{ color: '#1e293b', fontWeight: 700, marginBottom: '4px' }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="valor"
                                                    stroke="#f97316"
                                                    strokeWidth={4}
                                                    dot={{ fill: '#f97316', r: 6, strokeWidth: 3, stroke: '#ffffff' }}
                                                    activeDot={{ r: 8, strokeWidth: 4, stroke: '#ffffff' }}
                                                    name="valor"
                                                    animationDuration={1500}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Top Produtos */}
                            {charts.topProducts.length > 0 && (
                                <Card className="border-slate-200 shadow-lg shadow-orange-500/5 rounded-2xl overflow-hidden transition-all hover:shadow-orange-500/10">
                                    <CardHeader className="pb-2 border-b border-slate-50 bg-slate-50/50">
                                        <CardTitle className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-lg">
                                                <div className="p-2 bg-blue-50 rounded-lg">
                                                    <Package className="h-5 w-5 text-blue-500" />
                                                </div>
                                                Produtos Mais Vendidos (Valor)
                                            </div>
                                            <Badge variant="outline" className="bg-white text-slate-500 border-slate-200">Por volume financeiro</Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={charts.topProducts} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                                <XAxis
                                                    type="number"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                                                    tickFormatter={(value) => `R$ ${value}`}
                                                />
                                                <YAxis
                                                    type="category"
                                                    dataKey="productName"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#334155', fontSize: 12, fontWeight: 600 }}
                                                    width={140}
                                                    tickFormatter={(value) => value.length > 18 ? value.substring(0, 18) + '...' : value}
                                                />
                                                <Tooltip
                                                    cursor={{ fill: '#f8fafc', radius: 4 }}
                                                    formatter={(value: number | undefined) => [formatCurrency(value || 0), 'Investimento Total']}
                                                    contentStyle={{
                                                        backgroundColor: '#ffffff',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '12px',
                                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                                    }}
                                                    labelStyle={{ color: '#1e293b', fontWeight: 700 }}
                                                />
                                                <Bar
                                                    dataKey="totalSpent"
                                                    fill="url(#barGradient)"
                                                    radius={[0, 6, 6, 0]}
                                                    barSize={32}
                                                    animationDuration={1500}
                                                >
                                                    {/* Gradient for Bars */}
                                                    <defs>
                                                        <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                                                            <stop offset="0%" stopColor="#3b82f6" />
                                                            <stop offset="100%" stopColor="#60a5fa" />
                                                        </linearGradient>
                                                    </defs>
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="products">
                            <Card className="border-slate-200 shadow-lg shadow-orange-500/5 rounded-2xl overflow-hidden transition-all hover:shadow-orange-500/10">
                                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 bg-slate-50/50 pb-4">
                                    <CardTitle className="text-xl font-heading flex items-center gap-2">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <Package className="h-5 w-5 text-blue-500" />
                                        </div>
                                        Produtos Fornecidos
                                    </CardTitle>
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100 font-bold px-3 py-1">{products.length} itens</Badge>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-slate-100">
                                                    <TableHead className="font-bold text-slate-700 h-12 px-6">Produto</TableHead>
                                                    <TableHead className="text-right font-bold text-slate-700 h-12">Qtd Total</TableHead>
                                                    <TableHead className="text-right font-bold text-slate-700 h-12">Preço Médio</TableHead>
                                                    <TableHead className="text-right font-bold text-slate-700 h-12">Última Compra</TableHead>
                                                    <TableHead className="text-right font-bold text-slate-700 h-12 px-6">Total Gasto</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {products.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="h-40 text-center text-slate-400 italic bg-white">
                                                            Nenhum produto comprado deste fornecedor.
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    products.map(product => (
                                                        <TableRow key={product.productId} className="hover:bg-slate-50/50 border-slate-100 transition-colors group">
                                                            <TableCell className="font-bold text-slate-900 py-4 px-6 group-hover:text-blue-600 transition-colors">{product.productName}</TableCell>
                                                            <TableCell className="text-right font-medium text-slate-600">{product.totalQuantity}</TableCell>
                                                            <TableCell className="text-right font-medium text-slate-600">{formatCurrency(product.averagePrice)}</TableCell>
                                                            <TableCell className="text-right text-sm text-slate-500">
                                                                {product.lastPurchaseDate ? formatDate(product.lastPurchaseDate) : '-'}
                                                            </TableCell>
                                                            <TableCell className="text-right font-bold text-emerald-600 px-6">
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
                            <Card className="border-slate-200 shadow-lg shadow-orange-500/5 rounded-2xl overflow-hidden transition-all hover:shadow-orange-500/10">
                                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 bg-slate-50/50 pb-4">
                                    <h3 className="text-xl font-heading font-bold flex items-center gap-2 text-slate-900">
                                        <div className="p-2 bg-orange-50 rounded-lg">
                                            <ShoppingBag className="h-5 w-5 text-orange-500" />
                                        </div>
                                        Histórico de Aquisições
                                    </h3>
                                    <Badge variant="secondary" className="bg-orange-50 text-orange-600 border-orange-100 font-bold px-3 py-1">{purchases.length} compras</Badge>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-slate-100">
                                                    <TableHead className="font-bold text-slate-700 h-12 px-6">Data</TableHead>
                                                    <TableHead className="font-bold text-slate-700 h-12">Ref. Compra</TableHead>
                                                    <TableHead className="text-right font-bold text-slate-700 h-12">Itens</TableHead>
                                                    <TableHead className="text-right font-bold text-slate-700 h-12 px-6">Investimento</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {purchases.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="h-40 text-center text-slate-400 italic bg-white">
                                                            Nenhuma compra registrada para este fornecedor.
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    purchases.map((purchase, index) => (
                                                        <TableRow
                                                            key={purchase.id}
                                                            className="hover:bg-slate-50/50 border-slate-100 cursor-pointer transition-colors group"
                                                            onClick={() => router.push(`/purchases/${purchase.id}`)}
                                                        >
                                                            <TableCell className="font-semibold text-slate-900 py-4 px-6">{purchase.date ? formatDate(purchase.date, 'UTC') : '-'}</TableCell>
                                                            <TableCell className="font-mono text-xs text-slate-500 bg-slate-50 m-2 rounded px-2 py-0.5 inline-block border border-slate-100">
                                                                #{(purchases.length - index).toString().padStart(3, '0')}
                                                            </TableCell>
                                                            <TableCell className="text-right font-medium text-slate-600">{purchase.items ? purchase.items.reduce((s, i) => s + i.quantity, 0) : 0}</TableCell>
                                                            <TableCell className="text-right font-bold text-slate-900 px-6 group-hover:text-orange-600 transition-colors">
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
        </div >
    );
}
