"use client";

import { useEffect, useMemo, useState } from "react";
import { format, subMonths, startOfMonth, endOfMonth, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    BarChart3,
    TrendingUp,
    DollarSign,
    Package,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Activity,
    Users,
    CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { getAppointmentRepository, getProductRepository, getServiceRepository, getClientRepository, getCashMovementRepository, getProfessionalRepository } from "@/infrastructure/repositories/factory";
import { Appointment } from "@/core/domain/Appointment";
import { Product } from "@/core/domain/Product";
import { Service } from "@/core/domain/Service";
import { Client } from "@/core/domain/Client";
import { CashMovement } from "@/core/domain/CashMovement";
import { Professional } from "@/core/domain/Professional";

// Helper Components
const StatCard = ({ title, value, subtext, icon: Icon, trend, color = "blue" }: any) => {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-emerald-50 text-emerald-600",
        purple: "bg-purple-50 text-purple-600",
        rose: "bg-rose-50 text-rose-600",
    } as Record<string, string>;

    return (
        <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <div className={cn("p-2 rounded-full", colorClasses[color] || colorClasses.blue)}>
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-slate-800">{value}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                    {trend === 'up' && <ArrowUpRight className="h-3 w-3 text-emerald-500 mr-1" />}
                    {trend === 'down' && <ArrowDownRight className="h-3 w-3 text-rose-500 mr-1" />}
                    {subtext}
                </div>
            </CardContent>
        </Card>
    );
}

const SimpleBarChart = ({ data, color = "bg-primary" }: { data: { label: string, value: number, formattedValue: string }[], color?: string }) => {
    const max = Math.max(...data.map(d => d.value));
    return (
        <div className="space-y-4 pt-4">
            {data.map((item, idx) => (
                <div key={idx} className="space-y-2 group">
                    <div className="flex justify-between text-sm">
                        <span className="font-medium text-slate-700 group-hover:text-primary transition-colors">{item.label}</span>
                        <span className="text-slate-500 font-medium">{item.formattedValue}</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={cn("h-full rounded-full transition-all duration-1000 ease-out group-hover:opacity-80", color)}
                            style={{ width: `${max > 0 ? (item.value / max) * 100 : 0}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default function DashboardPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [cashMovements, setCashMovements] = useState<CashMovement[]>([]);
    const [professionals, setProfessionals] = useState<Professional[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState("current_month");

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                // Parallel fetch
                const [apptData, prodData, servData, clientData, profData] = await Promise.all([
                    getAppointmentRepository().getAll(),
                    getProductRepository().getAll(),
                    getServiceRepository().getAll(),
                    getClientRepository().getAll(),
                    getProfessionalRepository().getAll()
                ]);

                // Filter only DONE for financial stats
                const doneAppts = apptData.filter(a => a.status === 'DONE');
                setAppointments(doneAppts);
                setProducts(prodData);
                setServices(servData);
                setClients(clientData);
                setProfessionals(profData);

                // Load cash movements for the period
                const now = new Date();
                let startDate = startOfMonth(now);
                let endDate = now;

                if (period === "last_month") {
                    const lastMonth = subMonths(now, 1);
                    startDate = startOfMonth(lastMonth);
                    endDate = endOfMonth(lastMonth);
                } else if (period === "all_time") {
                    startDate = new Date(2020, 0, 1); // Far past date
                }

                const cashData = await getCashMovementRepository().list({
                    startDate,
                    endDate
                });
                setCashMovements(cashData);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [period]);

    // Memoized Stats
    const stats = useMemo(() => {
        // Filter by Period
        let filteredAppts = appointments;
        const now = new Date();

        if (period === "current_month") {
            filteredAppts = appointments.filter(a => isSameMonth(new Date(a.date), now));
        } else if (period === "last_month") {
            const lastMonth = subMonths(now, 1);
            filteredAppts = appointments.filter(a => isSameMonth(new Date(a.date), lastMonth));
        }

        // Totals
        const totalServiceRevenue = filteredAppts.reduce((acc, a) => acc + (a.totalServiceValue || 0), 0);
        const totalProductRevenue = filteredAppts.reduce((acc, a) => acc + (a.totalProductValue || 0), 0);
        const totalRevenue = totalServiceRevenue + totalProductRevenue;

        // Approximate Profit
        let totalProductProfit = 0;
        let totalServiceProfit = 0;

        filteredAppts.forEach(apt => {
            // Products
            apt.usedProducts?.forEach(p => {
                const profitPerUnit = (p.price || 0) - (p.cost || 0);
                totalProductProfit += profitPerUnit * p.quantity;
            });

            // Services
            apt.finalizedServices?.forEach(s => {
                const def = services.find(sv => sv.id === s.serviceId);
                const cost = def?.cost || 0;
                const commission = def?.commission || 0;
                totalServiceProfit += (s.price - cost - commission);
            });
        });

        // Top Services
        const serviceCounts: Record<string, number> = {};
        const serviceRevenue: Record<string, number> = {};

        filteredAppts.forEach(apt => {
            apt.finalizedServices?.forEach(s => {
                serviceCounts[s.name] = (serviceCounts[s.name] || 0) + 1;
                serviceRevenue[s.name] = (serviceRevenue[s.name] || 0) + s.price;
            });
        });

        const topServices = Object.entries(serviceCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([label, value]) => ({
                label,
                value,
                formattedValue: `${value} execuções`
            }));

        const topRevenueServices = Object.entries(serviceRevenue)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([label, value]) => ({
                label,
                value,
                formattedValue: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
            }));

        // Stock Critical
        const criticalStock = products.filter(p => p.currentStock <= p.minStock);

        // Ticket Médio
        const ticketMedio = filteredAppts.length > 0 ? totalRevenue / filteredAppts.length : 0;

        // NEW METRICS - Client Stats
        const activeClients = clients.filter(c => c.status === 'ACTIVE').length;
        
        // New clients in period
        let newClients = 0;
        if (period === "current_month") {
            newClients = clients.filter(c => isSameMonth(new Date(c.createdAt), now)).length;
        } else if (period === "last_month") {
            const lastMonth = subMonths(now, 1);
            newClients = clients.filter(c => isSameMonth(new Date(c.createdAt), lastMonth)).length;
        } else {
            newClients = clients.length; // All time
        }

        // Clients with debt (negative balance)
        const clientsWithDebt = clients.filter(c => c.creditBalance < 0).length;

        // NEW METRICS - Agenda Stats
        // Future appointments (PENDING or CONFIRMED)
        const futureAppointments = appointments.filter(a => 
            (a.status === 'PENDING' || a.status === 'CONFIRMED') && 
            new Date(a.date) >= now
        ).length;

        // Occupancy rate (simplified - based on done appointments vs total slots)
        // Assuming 10 hours/day * 2 slots/hour * 30 days = 600 slots per month
        const totalSlotsPerMonth = 600;
        const occupancyRate = filteredAppts.length > 0 
            ? Math.min(100, (filteredAppts.length / totalSlotsPerMonth) * 100) 
            : 0;

        // NEW METRICS - Cash Flow
        const totalIn = cashMovements
            .filter(m => m.type === 'IN')
            .reduce((sum, m) => sum + m.amount, 0);
        
        const totalOut = cashMovements
            .filter(m => m.type === 'OUT')
            .reduce((sum, m) => sum + m.amount, 0);
        
        const netCashFlow = totalIn - totalOut;

        // NEW METRICS - Professional Ranking
        const professionalStats = professionals.map(prof => {
            const profAppts = filteredAppts.filter(a => a.professionalId === prof.id);
            const revenue = profAppts.reduce((sum, a) => 
                sum + (a.totalServiceValue || 0) + (a.totalProductValue || 0), 0
            );
            return { 
                id: prof.id,
                name: prof.name, 
                appointments: profAppts.length, 
                revenue 
            };
        }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

        return {
            totalRevenue,
            totalServiceRevenue,
            totalProductRevenue,
            totalProductProfit,
            totalServiceProfit,
            ticketMedio,
            topServices,
            topRevenueServices,
            criticalStock,
            appointmentsCount: filteredAppts.length,
            // New metrics
            activeClients,
            newClients,
            clientsWithDebt,
            futureAppointments,
            occupancyRate,
            totalIn,
            totalOut,
            netCashFlow,
            professionalStats
        };
    }, [appointments, products, services, clients, cashMovements, professionals, period]);

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className="container mx-auto p-4 space-y-4 bg-slate-50/50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">Visão Geral</h1>
                    <p className="text-muted-foreground mt-1">Acompanhe métricas, resultados e alertas do seu negócio.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-[180px] bg-white border-slate-200">
                            <Calendar className="mr-2 h-4 w-4 text-slate-500" />
                            <SelectValue placeholder="Período" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="current_month">Mês Atual</SelectItem>
                            <SelectItem value="last_month">Mês Anterior</SelectItem>
                            <SelectItem value="all_time">Todo o Período</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Faturamento Total"
                    value={formatCurrency(stats.totalRevenue)}
                    subtext={`${stats.appointmentsCount} atendimentos`}
                    icon={DollarSign}
                    trend="up"
                    color="green"
                />
                <StatCard
                    title="Ticket Médio"
                    value={formatCurrency(stats.ticketMedio)}
                    subtext="Por atendimento"
                    icon={CreditCard}
                    color="blue"
                />
                <StatCard
                    title="Lucro Estimado"
                    value={formatCurrency(stats.totalServiceProfit + stats.totalProductProfit)}
                    subtext={`Margem: ${stats.totalRevenue > 0 ? ((stats.totalServiceProfit + stats.totalProductProfit) / stats.totalRevenue * 100).toFixed(1) : 0}%`}
                    icon={TrendingUp}
                    color="purple"
                />
                <StatCard
                    title="Agendamentos Futuros"
                    value={stats.futureAppointments}
                    subtext="Confirmados e pendentes"
                    icon={Calendar}
                    color="blue"
                />
            </div>

            {/* Second Row - New Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Clientes Ativos"
                    value={stats.activeClients}
                    subtext={`${stats.newClients} novos no período`}
                    icon={Users}
                    trend={stats.newClients > 0 ? "up" : undefined}
                    color="blue"
                />
                <StatCard
                    title="Taxa de Ocupação"
                    value={`${stats.occupancyRate.toFixed(1)}%`}
                    subtext="Da agenda no período"
                    icon={Activity}
                    trend={stats.occupancyRate > 50 ? "up" : "down"}
                    color={stats.occupancyRate > 50 ? "green" : "rose"}
                />
                <StatCard
                    title="Fluxo de Caixa"
                    value={formatCurrency(stats.netCashFlow)}
                    subtext={`Entradas: ${formatCurrency(stats.totalIn)}`}
                    icon={TrendingUp}
                    trend={stats.netCashFlow > 0 ? "up" : "down"}
                    color={stats.netCashFlow > 0 ? "green" : "rose"}
                />
                <StatCard
                    title="Estoque Crítico"
                    value={stats.criticalStock.length}
                    subtext="Produtos abaixo do mínimo"
                    icon={Package}
                    trend={stats.criticalStock.length > 0 ? "down" : "up"}
                    color="rose"
                />
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-white border p-1 rounded-xl shadow-sm w-full md:w-auto grid grid-cols-3 md:inline-flex">
                    <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900">Visão Geral</TabsTrigger>
                    <TabsTrigger value="services" className="rounded-lg data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900">Serviços</TabsTrigger>
                    <TabsTrigger value="products" className="rounded-lg data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900">Estoque</TabsTrigger>
                </TabsList>

                {/* VISÃO GERAL TAB */}
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        {/* Cash Flow Card */}
                        <Card className="col-span-3 border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                                    Fluxo de Caixa
                                </CardTitle>
                                <CardDescription>Entradas e saídas do período selecionado.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                                        <span className="font-medium text-slate-700">Entradas</span>
                                        <span className="font-bold text-emerald-600 text-lg">{formatCurrency(stats.totalIn)}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-rose-50 p-4 rounded-lg border border-rose-100">
                                        <span className="font-medium text-slate-700">Saídas</span>
                                        <span className="font-bold text-rose-600 text-lg">{formatCurrency(stats.totalOut)}</span>
                                    </div>
                                    <div className={cn(
                                        "flex justify-between items-center p-4 rounded-lg border-2",
                                        stats.netCashFlow >= 0 
                                            ? "bg-emerald-50 border-emerald-200" 
                                            : "bg-rose-50 border-rose-200"
                                    )}>
                                        <span className="font-semibold text-slate-800">Saldo Líquido</span>
                                        <span className={cn(
                                            "font-bold text-xl",
                                            stats.netCashFlow >= 0 ? "text-emerald-600" : "text-rose-600"
                                        )}>
                                            {formatCurrency(stats.netCashFlow)}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Top Professionals Card */}
                        <Card className="col-span-4 border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-purple-500" />
                                    Top Profissionais
                                </CardTitle>
                                <CardDescription>Ranking por faturamento no período.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {stats.professionalStats.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground bg-slate-50 rounded-lg border">
                                        <Users className="h-10 w-10 text-slate-300 mb-2" />
                                        <p className="font-medium text-slate-600">Nenhum atendimento no período</p>
                                        <p className="text-xs">Finalize atendimentos para ver o ranking</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {stats.professionalStats.map((prof, idx) => (
                                            <div key={prof.id} className="flex items-center justify-between p-3 bg-white border rounded-lg hover:border-purple-200 transition-colors shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm",
                                                        idx === 0 ? "bg-yellow-100 text-yellow-700" :
                                                        idx === 1 ? "bg-slate-100 text-slate-700" :
                                                        idx === 2 ? "bg-orange-100 text-orange-700" :
                                                        "bg-purple-50 text-purple-600"
                                                    )}>
                                                        {idx + 1}º
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-slate-800">{prof.name}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {prof.appointments} atendimento{prof.appointments !== 1 ? 's' : ''}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-slate-900">{formatCurrency(prof.revenue)}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4 border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-indigo-500" />
                                    Top Serviços (Receita)
                                </CardTitle>
                                <CardDescription>Os 5 serviços que mais geraram faturamento no período.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <SimpleBarChart data={stats.topRevenueServices} color="bg-indigo-500" />
                            </CardContent>
                        </Card>

                        <Card className="col-span-3 border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-blue-500" />
                                    Mais Populares
                                </CardTitle>
                                <CardDescription>Serviços mais realizados por volume.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <SimpleBarChart data={stats.topServices} color="bg-blue-500" />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* SERVIÇOS TAB (Can be expanded later, currently reuse overview components for demo) */}
                <TabsContent value="services" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle>Detalhamento de Receita</CardTitle>
                                <CardDescription>Comparativo entre serviços e revenda de produtos.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                                        <span className="font-medium text-slate-700">Serviços (Mão de Obra)</span>
                                        <span className="font-bold text-slate-900">{formatCurrency(stats.totalServiceRevenue)}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                                        <span className="font-medium text-slate-700">Produtos (Revenda/Consumo)</span>
                                        <span className="font-bold text-slate-900">{formatCurrency(stats.totalProductRevenue)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>


                {/* PRODUTOS TAB */}
                <TabsContent value="products" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4 border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-rose-600">
                                    <Package className="h-5 w-5" />
                                    Alertas de Reposição
                                </CardTitle>
                                <CardDescription>Produtos com estoque igual ou abaixo do mínimo definido.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {stats.criticalStock.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground bg-green-50/50 rounded-lg border border-green-100">
                                        <Package className="h-10 w-10 text-green-300 mb-2" />
                                        <p className="font-medium text-green-700">Estoque saudável!</p>
                                        <p className="text-xs">Nenhum produto crítico no momento.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                        {stats.criticalStock.map(p => (
                                            <div key={p.id} className="flex items-center justify-between p-3 bg-white border rounded-lg hover:border-rose-200 transition-colors shadow-sm">
                                                <div>
                                                    <div className="font-medium text-slate-800">{p.name}</div>
                                                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                        <span>Mínimo: {p.minStock}</span>
                                                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                        <span>Atual: {p.currentStock}</span>
                                                    </div>
                                                </div>
                                                <div className="text-rose-600 font-bold bg-rose-50 px-3 py-1.5 rounded-md text-sm shadow-sm border border-rose-100">
                                                    {p.currentStock} un
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="col-span-3 border-none shadow-sm bg-gradient-to-br from-white to-slate-50">
                            <CardHeader>
                                <CardTitle>Economia de Produtos</CardTitle>
                                <CardDescription>Panorama da venda de produtos.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col gap-6 mt-2">
                                    <div className="space-y-1">
                                        <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Receita Bruta</span>
                                        <div className="text-3xl font-bold text-slate-900">{formatCurrency(stats.totalProductRevenue)}</div>
                                    </div>

                                    <div className="space-y-1">
                                        <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Lucro Líquido</span>
                                        <div className="text-3xl font-bold text-emerald-600">{formatCurrency(stats.totalProductProfit)}</div>
                                    </div>

                                    <div className="pt-4 border-t">
                                        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 p-3 rounded-lg text-sm">
                                            <Activity className="h-4 w-4" />
                                            <span>Margem média de <strong>{stats.totalProductRevenue > 0 ? ((stats.totalProductProfit / stats.totalProductRevenue) * 100).toFixed(1) : 0}%</strong></span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
