"use client";

import { useEffect, useMemo, useState } from "react";
import { format, subMonths, startOfMonth, endOfMonth, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    BarChart3,
    TrendingUp,
    DollarSign,
    Package,
    Scissors,
    Users,
    Calendar,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { getAppointmentRepository, getProductRepository, getServiceRepository } from "@/infrastructure/repositories/factory";
import { Appointment } from "@/core/domain/Appointment";
import { Product } from "@/core/domain/Product";
import { Service } from "@/core/domain/Service";

// Helper Components
const StatCard = ({ title, value, subtext, icon: Icon, trend }: any) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
                {trend === 'up' && <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />}
                {trend === 'down' && <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />}
                {subtext}
            </p>
        </CardContent>
    </Card>
);

const SimpleBarChart = ({ data, color = "bg-primary" }: { data: { label: string, value: number, formattedValue: string }[], color?: string }) => {
    const max = Math.max(...data.map(d => d.value));
    return (
        <div className="space-y-4 pt-4">
            {data.map((item, idx) => (
                <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-sm">
                        <span className="font-medium text-slate-700">{item.label}</span>
                        <span className="text-slate-500">{item.formattedValue}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={cn("h-full rounded-full transition-all duration-500", color)}
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
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState("current_month");

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                // Parallel fetch
                const [apptData, prodData, servData] = await Promise.all([
                    getAppointmentRepository().getAll(),
                    getProductRepository().getAll(),
                    getServiceRepository().getAll()
                ]);

                // Filter only DONE for financial stats
                const doneAppts = apptData.filter(a => a.status === 'DONE');
                setAppointments(doneAppts);
                setProducts(prodData);
                setServices(servData);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

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

        // Approximate Profit (Naive: Revenue - estimated cost if available in snapshot, else 0)
        // Ideally we use finalized snapshots. cost is stored in usedProducts.
        // For services, cost is stored in service definitions, but snapshot might allow better accuracy.
        // Here we sum (price - cost - commission) from snapshot or fallback.
        // Product Profit: Sum( (p.price - p.cost) * quantity )

        let totalProductProfit = 0;
        let totalServiceProfit = 0; // Requires cost snapshot on service which we didn't explicitly add to `FinalizedServiceSchema` yet (oops).
        // Wait, `FinalizedServiceSchema` has `price`, but not cost. Service definitions have cost.
        // I will use current service cost as fallback.

        filteredAppts.forEach(apt => {
            // Products
            apt.usedProducts?.forEach(p => {
                const profitPerUnit = (p.price || 0) - (p.cost || 0);
                totalProductProfit += profitPerUnit * p.quantity;
            });

            // Services (Fallback to current service cost if not snapshot)
            apt.finalizedServices?.forEach(s => {
                const def = services.find(sv => sv.id === s.serviceId);
                const cost = def?.cost || 0;
                const commission = def?.commission || 0;
                // Profit = Price - Cost - Commission
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
            appointmentsCount: filteredAppts.length
        };
    }, [appointments, products, services, period]);

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">Visão geral do desempenho do salão.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-[180px]">
                            <IconWrapper icon={Calendar} className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Período" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="current_month">Mês Atual</SelectItem>
                            <SelectItem value="last_month">Mês Anterior</SelectItem>
                            <SelectItem value="all_time">Todo Periodo</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Faturamento Total"
                    value={formatCurrency(stats.totalRevenue)}
                    subtext={`${stats.appointmentsCount} atendimentos`}
                    icon={DollarSign}
                    trend="up"
                />
                <StatCard
                    title="Ticket Médio"
                    value={formatCurrency(stats.ticketMedio)}
                    subtext="Por atendimento"
                    icon={TrendingUp}
                />
                <StatCard
                    title="Lucro Estimado"
                    value={formatCurrency(stats.totalServiceProfit + stats.totalProductProfit)}
                    subtext={`Margem: ${stats.totalRevenue > 0 ? ((stats.totalServiceProfit + stats.totalProductProfit) / stats.totalRevenue * 100).toFixed(1) : 0}%`}
                    icon={BarChart3}
                />
                <StatCard
                    title="Estoque Crítico"
                    value={stats.criticalStock.length}
                    subtext="Produtos abaixo do mínimo"
                    icon={Package}
                    trend={stats.criticalStock.length > 0 ? "down" : "up"}
                />
            </div>

            <Tabs defaultValue="services" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="services">Serviços</TabsTrigger>
                    <TabsTrigger value="products">Produtos</TabsTrigger>
                </TabsList>

                <TabsContent value="services" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Top Serviços (Faturamento)</CardTitle>
                                <CardDescription>Serviços que mais geraram receita no período.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <SimpleBarChart data={stats.topRevenueServices} color="bg-purple-500" />
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Mais Realizados</CardTitle>
                                <CardDescription>Serviços mais populares por volume.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <SimpleBarChart data={stats.topServices} color="bg-blue-500" />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="products" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Alertas de Estoque</CardTitle>
                                <CardDescription>Produtos que necessitam de reposição imediata.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {stats.criticalStock.length === 0 ? (
                                    <div className="flex items-center justify-center h-40 text-muted-foreground">Estoque saudável!</div>
                                ) : (
                                    <div className="space-y-4 max-h-[300px] overflow-y-auto">
                                        {stats.criticalStock.map(p => (
                                            <div key={p.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                                <div>
                                                    <div className="font-medium">{p.name}</div>
                                                    <div className="text-xs text-muted-foreground">Min: {p.minStock}</div>
                                                </div>
                                                <div className="text-red-600 font-bold bg-red-50 px-2 py-1 rounded text-sm">
                                                    {p.currentStock} un
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Faturamento com Produtos</CardTitle>
                                <CardDescription>Receita gerada por venda/consumo de produtos.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col gap-4 mt-4">
                                    <div className="flex justify-between items-end">
                                        <span className="text-muted-foreground">Receita Bruta</span>
                                        <span className="text-xl font-bold">{formatCurrency(stats.totalProductRevenue)}</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-muted-foreground">Lucro Líquido</span>
                                        <span className="text-xl font-bold text-green-600">{formatCurrency(stats.totalProductProfit)}</span>
                                    </div>
                                    <div className="h-px bg-slate-100 my-2" />
                                    <div className="text-xs text-muted-foreground text-center">
                                        Margem média de {stats.totalProductRevenue > 0 ? ((stats.totalProductProfit / stats.totalProductRevenue) * 100).toFixed(1) : 0}% em produtos.
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

// Simple Icon Wrapper to avoid type errors
const IconWrapper = ({ icon: Icon, className }: any) => <Icon className={className} />;
