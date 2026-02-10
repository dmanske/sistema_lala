"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Calendar, XCircle, CheckCircle2, Loader2, Scissors } from "lucide-react";
import { formatDateTime, formatDate } from "@/core/formatters/date";
import { getCustomerOverview, CustomerOverview } from "@/core/usecases/customers/getCustomerOverview";

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

    const { lastServices, metrics } = overview;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                        <CardTitle className="text-sm font-medium">Próximo Agendamento</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {metrics.nextAppointment ? (
                            <>
                                <div className="text-2xl font-bold">{metrics.nextAppointment.time}</div>
                                <p className="text-xs text-muted-foreground">
                                    {formatDate(metrics.nextAppointment.date)}
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="text-2xl font-bold">--</div>
                                <p className="text-xs text-muted-foreground">
                                    Nenhum agendamento futuro
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

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
        </div>
    );
}
