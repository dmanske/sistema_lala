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
    const [sales, setSales] = useState<any[]>([]);
    const [accountsPayable, setAccountsPayable] = useState<any[]>([]);
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

                // Manter TODOS os agendamentos para calcular futuros também
                setAppointments(apptData);
                setProducts(prodData);
                setServices(servData);
                setClients(clientData);
                setProfessionals(profData);

                const cashData = await getCashMovementRepository().list({
                    startDate: periodStart,
                    endDate: periodEnd
                });
                setCashMovements(cashData);

                // Buscar vendas pagas do período
                const { getSaleRepository } = await import('@/infrastructure/repositories/factory');
                const salesData = await getSaleRepository().findAll();
                const paidSales = salesData.filter(s => s.status === 'paid');
                setSales(paidSales);

                // Buscar contas a pagar
                const { getAccountPayableRepository } = await import('@/infrastructure/repositories/factory');
                const accountsPayableData = await getAccountPayableRepository().list();
                setAccountsPayable(accountsPayableData);
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
        // Filtrar vendas pagas do período
        const filteredSales = sales.filter(s => {
            const d = parseLocalDate(s.createdAt);
            if (!d) return false;
            return d >= periodStart && d <= periodEnd;
        });

        // Calcular receita total das vendas
        const totalRevenue = filteredSales.reduce((acc, s) => acc + (s.total || 0), 0);
        
        // Contar atendimentos finalizados (vendas com appointment_id)
        const appointmentsCount = filteredSales.filter(s => s.appointmentId).length;

        // Ticket médio
        const ticketMedio = appointmentsCount > 0 ? totalRevenue / appointmentsCount : 0;

        // Para lucro, vamos calcular baseado nos itens das vendas
        let totalProductProfit = 0;
        let totalServiceProfit = 0;

        filteredSales.forEach(sale => {
            // Calcular lucro de produtos
            sale.items?.forEach((item: any) => {
                if (item.type === 'product') {
                    const product = products.find(p => p.id === item.productId);
                    const cost = product?.cost || 0;
                    const profitPerUnit = item.price - cost;
                    totalProductProfit += profitPerUnit * item.quantity;
                }
                // Calcular lucro de serviços
                if (item.type === 'service') {
                    const service = services.find(s => s.id === item.serviceId);
                    const cost = service?.cost || 0;
                    const commission = service?.commission || 0;
                    totalServiceProfit += (item.price - cost - commission);
                }
            });
        });

        const serviceCounts: Record<string, number> = {};
        const serviceRevenue: Record<string, number> = {};

        filteredSales.forEach(sale => {
            sale.items?.forEach((item: any) => {
                if (item.type === 'service') {
                    const serviceName = item.name || 'Serviço';
                    serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;
                    serviceRevenue[serviceName] = (serviceRevenue[serviceName] || 0) + item.price;
                }
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
        const activeClients = clients.filter(c => c.status === 'ACTIVE').length;

        const now = new Date();
        const futureAppointments = appointments.filter(a => {
            const d = parseLocalDate(a.date);
            return (a.status === 'PENDING' || a.status === 'CONFIRMED') && d && d >= now;
        }).length;

        // === NOVAS MÉTRICAS DE NEGÓCIO ===
        
        // 1. Taxa de Ocupação (simplificado - baseado em agendamentos vs dias úteis)
        const daysInPeriod = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
        const totalAppointments = appointments.filter(a => {
            const d = parseLocalDate(a.date);
            return d && d >= periodStart && d <= periodEnd;
        }).length;
        const occupancyRate = daysInPeriod > 0 ? (totalAppointments / (daysInPeriod * professionals.length * 8)) * 100 : 0; // 8 slots por dia

        // 2. Taxa de Retorno - clientes que voltaram no período
        const clientsInPeriod = new Set(filteredSales.filter(s => s.appointmentId).map(s => {
            const appt = appointments.find(a => a.id === s.appointmentId);
            return appt?.clientId;
        }).filter(Boolean));
        
        const returningClients = Array.from(clientsInPeriod).filter(clientId => {
            const clientSales = sales.filter(s => {
                const appt = appointments.find(a => a.id === s.appointmentId);
                return appt?.clientId === clientId && s.status === 'paid';
            });
            return clientSales.length > 1;
        }).length;
        
        const returnRate = clientsInPeriod.size > 0 ? (returningClients / clientsInPeriod.size) * 100 : 0;

        // 3. Tempo Médio entre Visitas
        const clientVisits: Record<string, Date[]> = {};
        sales.filter(s => s.status === 'paid' && s.appointmentId).forEach(s => {
            const appt = appointments.find(a => a.id === s.appointmentId);
            if (appt?.clientId) {
                const date = parseLocalDate(appt.date);
                if (date) {
                    if (!clientVisits[appt.clientId]) clientVisits[appt.clientId] = [];
                    clientVisits[appt.clientId].push(date);
                }
            }
        });
        
        let totalDaysBetweenVisits = 0;
        let visitPairs = 0;
        Object.values(clientVisits).forEach(dates => {
            const sorted = dates.sort((a, b) => a.getTime() - b.getTime());
            for (let i = 1; i < sorted.length; i++) {
                const days = (sorted[i].getTime() - sorted[i-1].getTime()) / (1000 * 60 * 60 * 24);
                totalDaysBetweenVisits += days;
                visitPairs++;
            }
        });
        const avgDaysBetweenVisits = visitPairs > 0 ? totalDaysBetweenVisits / visitPairs : 0;

        // 4. Novos Clientes no período
        const newClients = clients.filter(c => {
            const d = c.createdAt ? new Date(c.createdAt) : null;
            return d && d >= periodStart && d <= periodEnd;
        }).length;

        // 5. Taxa de Cancelamento
        const canceledAppointments = appointments.filter(a => {
            const d = parseLocalDate(a.date);
            return a.status === 'CANCELLED' && d && d >= periodStart && d <= periodEnd;
        }).length;
        const totalScheduled = totalAppointments + canceledAppointments;
        const cancellationRate = totalScheduled > 0 ? (canceledAppointments / totalScheduled) * 100 : 0;

        // === MÉTRICAS FINANCEIRAS ===
        
        // 6. Contas a Receber Vencidas
        const overdueReceivables = 0; // TODO: implementar quando tiver contas a receber

        // 7. Contas a Pagar Vencidas
        const overduePayables = accountsPayable.filter(ap => {
            const dueDate = parseLocalDate(ap.dueDate);
            return ap.status === 'pending' && dueDate && dueDate < now;
        }).reduce((sum, ap) => sum + (ap.amount || 0), 0);

        // 8. Previsão de Receita (baseado em agendamentos futuros)
        const forecastRevenue = futureAppointments * ticketMedio;

        // 9. Despesas do Mês
        const monthExpenses = cashMovements.filter(m => m.type === 'OUT').reduce((sum, m) => sum + m.amount, 0);

        // 10. Margem de Lucro Real
        const realProfit = totalRevenue - monthExpenses;
        const profitMargin = totalRevenue > 0 ? (realProfit / totalRevenue) * 100 : 0;

        // === MÉTRICAS OPERACIONAIS ===
        
        // 11. Produtos Mais Vendidos
        const productSales: Record<string, { name: string, quantity: number, revenue: number }> = {};
        filteredSales.forEach(sale => {
            sale.items?.forEach((item: any) => {
                if (item.type === 'product') {
                    const key = item.productId || item.name;
                    if (!productSales[key]) {
                        productSales[key] = { name: item.name, quantity: 0, revenue: 0 };
                    }
                    productSales[key].quantity += item.quantity;
                    productSales[key].revenue += item.price * item.quantity;
                }
            });
        });
        const topProducts = Object.values(productSales)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5)
            .map(p => ({
                label: p.name,
                value: p.quantity,
                formattedValue: `${p.quantity} un - ${formatCurrency(p.revenue)}`
            }));

        // 12. Taxa de No-Show
        const noShowAppointments = appointments.filter(a => {
            const d = parseLocalDate(a.date);
            return a.status === 'NO_SHOW' && d && d >= periodStart && d <= periodEnd;
        }).length;
        const noShowRate = totalScheduled > 0 ? (noShowAppointments / totalScheduled) * 100 : 0;

        // 13. Horários Mais Populares (simplificado)
        const hourCounts: Record<number, number> = {};
        appointments.filter(a => {
            const d = parseLocalDate(a.date);
            return d && d >= periodStart && d <= periodEnd;
        }).forEach(a => {
            // Assumindo que temos hora no agendamento (se não tiver, usar 9h como padrão)
            const hour = 9; // TODO: extrair hora real quando disponível
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });
        const popularHours = Object.entries(hourCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([hour, count]) => ({
                label: `${hour}:00`,
                value: count,
                formattedValue: `${count} agendamentos`
            }));

        // 14. Clientes Inativos (mais de 60 dias sem visita)
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        const activeClientIds = new Set(
            sales.filter(s => {
                const appt = appointments.find(a => a.id === s.appointmentId);
                const date = appt ? parseLocalDate(appt.date) : null;
                return date && date >= sixtyDaysAgo;
            }).map(s => {
                const appt = appointments.find(a => a.id === s.appointmentId);
                return appt?.clientId;
            }).filter(Boolean)
        );
        const inactiveClients = clients.filter(c => 
            c.status === 'ACTIVE' && !activeClientIds.has(c.id)
        ).length;

        // Agendamentos de Hoje
        const today = startOfDay(new Date());
        const todayAppointments = appointments.filter(a => {
            const d = parseLocalDate(a.date);
            return d && isSameMonth(d, today) && d.getDate() === today.getDate();
        });

        const totalIn = cashMovements.filter(m => m.type === 'IN').reduce((sum, m) => sum + m.amount, 0);
        const totalOut = cashMovements.filter(m => m.type === 'OUT').reduce((sum, m) => sum + m.amount, 0);
        const netCashFlow = totalIn - totalOut;

        const professionalStats = professionals.map(prof => {
            const profSales = filteredSales.filter(s => {
                const appt = appointments.find(a => a.id === s.appointmentId);
                return appt?.professionalId === prof.id;
            });
            const revenue = profSales.reduce((sum, s) => sum + (s.total || 0), 0);
            return {
                id: prof.id,
                name: prof.name,
                appointments: profSales.length,
                revenue
            };
        }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

        return {
            totalRevenue,
            totalProductProfit,
            totalServiceProfit,
            ticketMedio,
            topServices,
            topRevenueServices,
            criticalStock,
            appointmentsCount,
            activeClients,
            futureAppointments,
            totalIn,
            totalOut,
            netCashFlow,
            professionalStats,
            // Novas métricas de negócio
            occupancyRate,
            returnRate,
            avgDaysBetweenVisits,
            newClients,
            cancellationRate,
            // Novas métricas financeiras
            overdueReceivables,
            overduePayables,
            forecastRevenue,
            monthExpenses,
            profitMargin,
            realProfit,
            // Novas métricas operacionais
            topProducts,
            noShowRate,
            popularHours,
            inactiveClients,
            todayAppointments
        };
    }, [appointments, products, services, clients, cashMovements, professionals, sales, accountsPayable, periodStart, periodEnd]);

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
                    {/* Cards de Métricas de Negócio */}
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-blue-600" />
                                Métricas de Negócio
                            </CardTitle>
                            <CardDescription>Indicadores operacionais do período</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <div className="text-xs text-muted-foreground">Taxa de Ocupação</div>
                                    <div className="text-2xl font-bold text-blue-600">{stats.occupancyRate.toFixed(1)}%</div>
                                </div>
                                <div className="p-3 bg-green-50 rounded-lg">
                                    <div className="text-xs text-muted-foreground">Taxa de Retorno</div>
                                    <div className="text-2xl font-bold text-green-600">{stats.returnRate.toFixed(1)}%</div>
                                </div>
                                <div className="p-3 bg-purple-50 rounded-lg">
                                    <div className="text-xs text-muted-foreground">Tempo Médio entre Visitas</div>
                                    <div className="text-2xl font-bold text-purple-600">{stats.avgDaysBetweenVisits.toFixed(0)} dias</div>
                                </div>
                                <div className="p-3 bg-orange-50 rounded-lg">
                                    <div className="text-xs text-muted-foreground">Novos Clientes</div>
                                    <div className="text-2xl font-bold text-orange-600">{stats.newClients}</div>
                                </div>
                                <div className="p-3 bg-rose-50 rounded-lg">
                                    <div className="text-xs text-muted-foreground">Taxa de Cancelamento</div>
                                    <div className="text-2xl font-bold text-rose-600">{stats.cancellationRate.toFixed(1)}%</div>
                                </div>
                                <div className="p-3 bg-amber-50 rounded-lg">
                                    <div className="text-xs text-muted-foreground">Taxa de No-Show</div>
                                    <div className="text-2xl font-bold text-amber-600">{stats.noShowRate.toFixed(1)}%</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Agendamentos de Hoje */}
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-indigo-600" />
                                Agendamentos de Hoje
                            </CardTitle>
                            <CardDescription>{stats.todayAppointments.length} agendamento(s)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {stats.todayAppointments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                                    <Calendar className="h-10 w-10 mb-2" />
                                    <p>Nenhum agendamento para hoje</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                    {stats.todayAppointments.map((appt: any) => {
                                        const client = clients.find(c => c.id === appt.clientId);
                                        const prof = professionals.find(p => p.id === appt.professionalId);
                                        return (
                                            <div key={appt.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg text-sm">
                                                <div>
                                                    <div className="font-medium">{client?.name || 'Cliente'}</div>
                                                    <div className="text-xs text-muted-foreground">{prof?.name || 'Profissional'}</div>
                                                </div>
                                                <div className={cn(
                                                    "px-2 py-1 rounded text-xs font-medium",
                                                    appt.status === 'CONFIRMED' ? "bg-green-100 text-green-700" :
                                                    appt.status === 'PENDING' ? "bg-yellow-100 text-yellow-700" :
                                                    appt.status === 'DONE' ? "bg-blue-100 text-blue-700" :
                                                    "bg-gray-100 text-gray-700"
                                                )}>
                                                    {appt.status}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

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
                    {/* Métricas Financeiras Expandidas */}
                    <Card className="col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-emerald-600" />
                                Indicadores Financeiros
                            </CardTitle>
                            <CardDescription>Visão consolidada das finanças</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                <div className="p-3 bg-rose-50 rounded-lg">
                                    <div className="text-xs text-muted-foreground">Contas a Pagar Vencidas</div>
                                    <div className="text-xl font-bold text-rose-600">{formatCurrency(stats.overduePayables)}</div>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <div className="text-xs text-muted-foreground">Previsão de Receita</div>
                                    <div className="text-xl font-bold text-blue-600">{formatCurrency(stats.forecastRevenue)}</div>
                                </div>
                                <div className="p-3 bg-orange-50 rounded-lg">
                                    <div className="text-xs text-muted-foreground">Despesas do Mês</div>
                                    <div className="text-xl font-bold text-orange-600">{formatCurrency(stats.monthExpenses)}</div>
                                </div>
                                <div className="p-3 bg-purple-50 rounded-lg">
                                    <div className="text-xs text-muted-foreground">Margem de Lucro</div>
                                    <div className="text-xl font-bold text-purple-600">{stats.profitMargin.toFixed(1)}%</div>
                                </div>
                                <div className={cn(
                                    "p-3 rounded-lg",
                                    stats.realProfit >= 0 ? "bg-emerald-50" : "bg-rose-50"
                                )}>
                                    <div className="text-xs text-muted-foreground">Lucro Real</div>
                                    <div className={cn(
                                        "text-xl font-bold",
                                        stats.realProfit >= 0 ? "text-emerald-600" : "text-rose-600"
                                    )}>{formatCurrency(stats.realProfit)}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

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
                    {/* Produtos Mais Vendidos */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-blue-600" />
                                Produtos Mais Vendidos
                            </CardTitle>
                            <CardDescription>Top 5 produtos por quantidade</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {stats.topProducts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                                    <Package className="h-10 w-10 mb-2" />
                                    <p>Nenhuma venda de produto no período</p>
                                </div>
                            ) : (
                                <SimpleBarChart data={stats.topProducts} color="bg-gradient-to-r from-blue-500 to-blue-600" />
                            )}
                        </CardContent>
                    </Card>

                    {/* Clientes Inativos */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-amber-600" />
                                Clientes Inativos
                            </CardTitle>
                            <CardDescription>Sem visita há mais de 60 dias</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center h-48">
                                <div className="text-6xl font-bold text-amber-600">{stats.inactiveClients}</div>
                                <p className="text-muted-foreground mt-2">clientes inativos</p>
                                {stats.inactiveClients > 0 && (
                                    <p className="text-xs text-muted-foreground mt-4 text-center">
                                        Considere criar uma campanha de reativação
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Estoque Crítico */}
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

                    {/* Serviços Mais Populares */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Mais Populares</CardTitle>
                            <CardDescription>Serviços mais realizados por volume</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SimpleBarChart data={stats.topServices} color="bg-gradient-to-r from-purple-500 to-purple-600" />
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
