"use client";

import { useEffect, useMemo, useState } from "react";
import { startOfMonth, endOfMonth, isSameMonth, subMonths, startOfDay, endOfDay } from "date-fns";
import {
    DollarSign,
    TrendingUp,
    Package,
    Calendar,
    Activity,
    Users,
    CreditCard,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";
import { parseLocalDate } from "@/lib/utils/dateFormatters";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardAlerts, Alert } from "@/components/dashboard/DashboardAlerts";
import { BirthdayCard } from "@/components/dashboard/BirthdayCard";

import { getAppointmentRepository, getProductRepository, getServiceRepository, getClientRepository, getCashMovementRepository, getProfessionalRepository } from "@/infrastructure/repositories/factory";
import { Appointment } from "@/core/domain/Appointment";
import { Product } from "@/core/domain/Product";
import { Service } from "@/core/domain/Service";
import { Client } from "@/core/domain/Client";
import { CashMovement } from "@/core/domain/CashMovement";
import { Professional } from "@/core/domain/Professional";

// Helper Components
const StatCard = ({ title, value, subtext, icon: Icon, trend, color = "blue" }: any) => {
    const gradientClasses = {
        blue: "from-blue-500/10 to-cyan-500/10 border-blue-100",
        green: "from-emerald-500/10 to-green-500/10 border-emerald-100",
        purple: "from-purple-500/10 to-pink-500/10 border-purple-100",
        rose: "from-rose-500/10 to-orange-500/10 border-rose-100",
    } as Record<string, string>;

    const iconColorClasses = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-emerald-50 text-emerald-600",
        purple: "bg-purple-50 text-purple-600",
        rose: "bg-rose-50 text-rose-600",
    } as Record<string, string>;

    return (
        <Card className={cn(
            "group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br border",
            gradientClasses[color] || gradientClasses.blue
        )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider">{title}</CardTitle>
                <div className={cn("p-2.5 rounded-xl shadow-sm", iconColorClasses[color] || iconColorClasses.blue)}>
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-slate-900 tracking-tight">{value}</div>
                <div className="flex items-center text-xs text-slate-600 mt-2 font-medium">
                    {trend === 'up' && <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600 mr-1" />}
                    {trend === 'down' && <ArrowDownRight className="h-3.5 w-3.5 text-rose-600 mr-1" />}
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
                        <span className="font-medium text-slate-700">{item.label}</span>
                        <span className="text-slate-500 font-medium">{item.formattedValue}</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={cn("h-full rounded-full transition-all duration-1000 ease-out", color)}
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
    const [periodStart, setPeriodStart] = useState(startOfMonth(new Date()));
    const [periodEnd, setPeriodEnd] = useState(endOfDay(new Date()));
    const [activeTab, setActiveTab] = useState<'summary' | 'financial' | 'operational'>('summary');

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                const [apptData, prodData, servData, clientData, profData] = await Promise.all([
                    getAppointmentRepository().getAll(),
                    getProductRepository().getAll(),
                    getServiceRepository().getAll(),
                    getClientRepository().getAll(),
                    getProfessionalRepository().getAll()
                ]);

                const doneAppts = apptData.filter(a => a.status === 'DONE');
                setAppointments(doneAppts);
                setProducts(prodData);
                setServices(servData);
                setClients(clientData);
                setProfessionals(profData);

                const cashData = await getCashMovementRepository().list({
                    startDate: periodStart,
                    endDate: periodEnd
                });
                setCashMovements(cashData);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [periodStart, periodEnd]);

    const handlePeriodChange = (start: Date, end: Date) => {
        setPeriodStart(start);
        setPeriodEnd(end);
    };

    // Memoized Stats
    const stats = useMemo(() => {
        const filteredAppts = appointments.filter(a => {
            const d = parseLocalDate(a.date);
            if (!d) return false;
            return d >= periodStart && d <= periodEnd;
        });

        const totalServiceRevenue = filteredAppts.reduce((acc, a) => acc + (a.totalServiceValue || 0), 0);
        const totalProductRevenue = filteredAppts.reduce((acc, a) => acc + (a.totalProductValue || 0), 0);
        const totalRevenue = totalServiceRevenue + totalProductRevenue;

        let totalProductProfit = 0;
        let totalServiceProfit = 0;

        filteredAppts.forEach(apt => {
            apt.usedProducts?.forEach(p => {
                const profitPerUnit = (p.price || 0) - (p.cost || 0);
                totalProductProfit += profitPerUnit * p.quantity;
            });

            apt.finalizedServices?.forEach(s => {
                const def = services.find(sv => sv.id === s.serviceId);
                const cost = def?.cost || 0;
                const commission = def?.commission || 0;
                totalServiceProfit += (s.price - cost - commission);
            });
        });

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

        const criticalStock = products.filter(p => p.currentStock <= p.minStock);
        const ticketMedio = filteredAppts.length > 0 ? totalRevenue / filteredAppts.length : 0;
        const activeClients = clients.filter(c => c.status === 'ACTIVE').length;

        const now = new Date();
        const futureAppointments = appointments.filter(a => {
            const d = parseLocalDate(a.date);
            return (a.status === 'PENDING' || a.status === 'CONFIRMED') && d && d >= now;
        }).length;

        const totalIn = cashMovements.filter(m => m.type === 'IN').reduce((sum, m) => sum + m.amount, 0);
        const totalOut = cashMovements.filter(m => m.type === 'OUT').reduce((sum, m) => sum + m.amount, 0);
        const netCashFlow = totalIn - totalOut;

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
            activeClients,
            futureAppointments,
            totalIn,
            totalOut,
            netCashFlow,
            professionalStats
        };
    }, [appointments, products, services, clients, cashMovements, professionals, periodStart, periodEnd]);

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    // Generate alerts
    const alerts: Alert[] = useMemo(() => {
        const result: Alert[] = [];
        
        if (stats.criticalStock.length > 0) {
            result.push({
                id: 'critical-stock',
                type: 'error',
                title: 'Estoque Crítico',
                message: `${stats.criticalStock.length} produto(s) abaixo do estoque mínimo`,
                dismissible: true
            });
        }

        if (stats.netCashFlow < 0) {
            result.push({
                id: 'negative-cashflow',
                type: 'warning',
                title: 'Fluxo de Caixa Negativo',
                message: `Saídas superam entradas em ${formatCurrency(Math.abs(stats.netCashFlow))}`,
                dismissible: true
            });
        }

        return result;
    }, [stats]);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-20 bg-muted/30 rounded-lg animate-pulse" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 bg-muted/30 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Visão Geral</h1>
                    <p className="text-muted-foreground">Acompanhe métricas e resultados do seu negócio</p>
                </div>
            </div>

            {/* Main Stats */}
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

            {/* Alerts */}
            {alerts.length > 0 && <DashboardAlerts alerts={alerts} />}

            {/* Tabs */}
            <div className="flex items-center gap-2">
                <Button
                    variant={activeTab === 'summary' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('summary')}
                >
                    Resumo
                </Button>
                <Button
                    variant={activeTab === 'financial' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('financial')}
                >
                    Financeiro
                </Button>
                <Button
                    variant={activeTab === 'operational' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('operational')}
                >
                    Operacional
                </Button>
            </div>

            {/* Tab Content */}
            {activeTab === 'summary' && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <div className="col-span-3">
                        <BirthdayCard />
                    </div>

                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-purple-600" />
                                Top Profissionais
                            </CardTitle>
                            <CardDescription>Ranking por faturamento no período</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {stats.professionalStats.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                                    <Users className="h-10 w-10 mb-2" />
                                    <p>Nenhum atendimento no período</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {stats.professionalStats.map((prof, idx) => (
                                        <div key={prof.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm",
                                                    idx === 0 ? "bg-yellow-100 text-yellow-700" :
                                                    idx === 1 ? "bg-slate-100 text-slate-700" :
                                                    idx === 2 ? "bg-orange-100 text-orange-700" :
                                                    "bg-purple-50 text-purple-600"
                                                )}>
                                                    {idx + 1}º
                                                </div>
                                                <div>
                                                    <div className="font-semibold">{prof.name}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {prof.appointments} atendimento{prof.appointments !== 1 ? 's' : ''}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="font-bold">{formatCurrency(prof.revenue)}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === 'financial' && (
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-emerald-600" />
                                Fluxo de Caixa
                            </CardTitle>
                            <CardDescription>Entradas e saídas do período</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-xl">
                                    <span className="font-semibold">Entradas</span>
                                    <span className="font-bold text-emerald-600 text-xl">{formatCurrency(stats.totalIn)}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-rose-50 rounded-xl">
                                    <span className="font-semibold">Saídas</span>
                                    <span className="font-bold text-rose-600 text-xl">{formatCurrency(stats.totalOut)}</span>
                                </div>
                                <div className={cn(
                                    "flex justify-between items-center p-4 rounded-xl border-2",
                                    stats.netCashFlow >= 0 ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"
                                )}>
                                    <span className="font-bold">Saldo Líquido</span>
                                    <span className={cn(
                                        "font-bold text-2xl",
                                        stats.netCashFlow >= 0 ? "text-emerald-600" : "text-rose-600"
                                    )}>
                                        {formatCurrency(stats.netCashFlow)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Top Serviços (Receita)</CardTitle>
                            <CardDescription>Os 5 serviços que mais geraram faturamento</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SimpleBarChart data={stats.topRevenueServices} color="bg-gradient-to-r from-indigo-500 to-indigo-600" />
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === 'operational' && (
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-rose-600">
                                <Package className="h-5 w-5" />
                                Alertas de Reposição
                            </CardTitle>
                            <CardDescription>Produtos com estoque crítico</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {stats.criticalStock.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                                    <Package className="h-10 w-10 text-green-300 mb-2" />
                                    <p className="font-medium text-green-700">Estoque saudável!</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-[350px] overflow-y-auto">
                                    {stats.criticalStock.map(p => (
                                        <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <div className="font-medium">{p.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    Mínimo: {p.minStock} | Atual: {p.currentStock}
                                                </div>
                                            </div>
                                            <div className="text-rose-600 font-bold">{p.currentStock} un</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Mais Populares</CardTitle>
                            <CardDescription>Serviços mais realizados por volume</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SimpleBarChart data={stats.topServices} color="bg-gradient-to-r from-blue-500 to-blue-600" />
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
