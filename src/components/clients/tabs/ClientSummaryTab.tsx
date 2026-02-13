"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Activity, Calendar, XCircle, CheckCircle2, Loader2, Scissors, TrendingUp, Clock, DollarSign, ShoppingBag, AlertTriangle, Info, AlertCircle } from "lucide-react";
import { formatDateTime, formatDate } from "@/core/formatters/date";
import { getCustomerOverview, CustomerOverview, CustomerAlert } from "@/core/usecases/customers/getCustomerOverview";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ClientSummaryTabProps {
    clientId: string;
}

export function ClientSummaryTab({ clientId }: ClientSummaryTabProps) {
    const [overview, setOverview] = useState<CustomerOverview | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOverview = async () => {
            setLoading(true);
            try {
                const data = await getCustomerOverview(clientId);
                setOverview(data);
            } catch (error) {
                console.error("Error fetching customer overview:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOverview();
    }, [clientId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!overview) {
        return (
            <div className="text-center py-20 text-muted-foreground">
                Erro ao carregar dados do cliente.
            </div>
        );
    }

    const { lastServices, metrics, alerts, charts } = overview;

    // Calcular dias como cliente
    const daysSinceFirstVisit = metrics.customerSince
        ? Math.floor((new Date().getTime() - new Date(metrics.customerSince).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    // Formatar dados para o gráfico de gastos por mês
    const spendingChartData = charts.spendingByMonth.map(item => ({
        mes: new Date(item.month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        valor: item.total
    }));

    // Formatar tooltip de moeda
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    // Função para renderizar ícone do alerta
    const getAlertIcon = (alert: CustomerAlert) => {
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

    // Função para obter classe de cor do alerta
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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
            {/* Primeira linha: Métricas principais */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-card/40 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.totalSpent)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Lifetime value
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Visitas</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.totalVisits}</div>
                        <p className="text-xs text-muted-foreground">
                            Atendimentos finalizados
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.averageTicket)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Valor médio por visita
                        </p>
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
                            {metrics.averageFrequency > 0 ? 'Dias entre visitas' : 'Sem dados suficientes'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Segunda linha: Métricas secundárias */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-card/40 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Gasto em Produtos</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.totalSpentOnProducts)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Total em produtos
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cancelamentos</CardTitle>
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.totalCancellations}</div>
                        <p className="text-xs text-muted-foreground">
                            Faltas e cancelamentos
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cliente Desde</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{daysSinceFirstVisit}</div>
                        <p className="text-xs text-muted-foreground">
                            {daysSinceFirstVisit === 1 ? 'Dia como cliente' : 'Dias como cliente'}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Última Visita</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {metrics.lastVisit ? (
                            <>
                                <div className="text-2xl font-bold">
                                    {Math.max(0, Math.floor((new Date().getTime() - new Date(metrics.lastVisit).getTime()) / (1000 * 60 * 60 * 24)))}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {Math.floor((new Date().getTime() - new Date(metrics.lastVisit).getTime()) / (1000 * 60 * 60 * 24)) === 0 
                                        ? `Hoje (${formatDate(metrics.lastVisit)})`
                                        : `dias atrás (${formatDate(metrics.lastVisit)})`
                                    }
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="text-2xl font-bold">--</div>
                                <p className="text-xs text-muted-foreground">
                                    Nenhuma visita registrada
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Terceira linha: Próximo agendamento (destaque) */}
            {metrics.nextAppointment && (
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Próximo Agendamento</CardTitle>
                        <Calendar className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">{metrics.nextAppointment.time}</div>
                        <p className="text-xs text-muted-foreground">
                            {formatDate(metrics.nextAppointment.date)}
                        </p>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Scissors className="h-5 w-5 text-primary" />
                            Últimos Serviços
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {lastServices.length === 0 ? (
                            <div className="text-sm text-muted-foreground text-center py-8">
                                Nenhum serviço registrado.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {lastServices.map((service) => (
                                    <div
                                        key={service.id}
                                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50/50 transition-colors border border-transparent hover:border-slate-100"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-800">{service.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(service.date)}
                                            </p>
                                        </div>
                                        <span className="font-bold text-primary ml-4">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.value)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Gráficos */}
            {spendingChartData.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Evolução de Gastos (Últimos 6 Meses)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={spendingChartData}>
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
                                    formatter={(value: number | undefined) => [formatCurrency(value || 0), 'Gasto']}
                                    contentStyle={{
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                    labelStyle={{ color: '#1e293b', fontWeight: 600 }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="valor" 
                                    stroke="#8b5cf6" 
                                    strokeWidth={3}
                                    dot={{ fill: '#8b5cf6', r: 5, strokeWidth: 2, stroke: '#ffffff' }}
                                    activeDot={{ r: 7, strokeWidth: 2, stroke: '#ffffff' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                {/* Gráfico de Serviços */}
                {charts.topServices.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Scissors className="h-5 w-5 text-primary" />
                                Serviços Mais Consumidos
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={charts.topServices} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis 
                                        type="number"
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                    />
                                    <YAxis 
                                        type="category"
                                        dataKey="name" 
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
                                        formatter={(value: number | undefined, name: string | undefined) => {
                                            if (name === 'count') return [value || 0, 'Vezes'];
                                            return [formatCurrency(value || 0), 'Total'];
                                        }}
                                        contentStyle={{
                                            backgroundColor: '#ffffff',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                        labelStyle={{ color: '#1e293b', fontWeight: 600 }}
                                        cursor={{ fill: '#f1f5f9' }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Bar 
                                        dataKey="count" 
                                        fill="#8b5cf6" 
                                        name="Vezes" 
                                        radius={[0, 8, 8, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}

                {/* Gráfico de Produtos */}
                {charts.topProducts.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShoppingBag className="h-5 w-5 text-primary" />
                                Produtos Mais Comprados
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
                                        dataKey="name" 
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
                                        formatter={(value: number | undefined, name: string | undefined) => {
                                            if (name === 'quantity') return [value || 0, 'Unidades'];
                                            return [formatCurrency(value || 0), 'Total'];
                                        }}
                                        contentStyle={{
                                            backgroundColor: '#ffffff',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                        labelStyle={{ color: '#1e293b', fontWeight: 600 }}
                                        cursor={{ fill: '#f1f5f9' }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Bar 
                                        dataKey="quantity" 
                                        fill="#06b6d4" 
                                        name="Unidades" 
                                        radius={[0, 8, 8, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
