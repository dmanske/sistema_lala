"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Scissors, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment, MOCK_PROFESSIONALS } from "@/core/domain/Appointment";
import { AppointmentService } from "@/core/services/AppointmentService";
import { LocalStorageAppointmentRepository } from "@/infrastructure/repositories/LocalStorageAppointmentRepository";
import { cn } from "@/lib/utils";

interface ClientAppointmentsTabProps {
    clientId: string;
}

export function ClientAppointmentsTab({ clientId }: ClientAppointmentsTabProps) {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const repo = new LocalStorageAppointmentRepository();
            const service = new AppointmentService(repo);
            const data = await service.getAll({ clientId });
            // Sort by date/time descending
            const sorted = data.sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.startTime}`);
                const dateB = new Date(`${b.date}T${b.startTime}`);
                return dateB.getTime() - dateA.getTime();
            });
            setAppointments(sorted);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [clientId]);

    const getStatusBadge = (status: Appointment["status"]) => {
        switch (status) {
            case "PENDING": return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pendente</Badge>;
            case "CONFIRMED": return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Confirmado</Badge>;
            case "DONE": return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Finalizado</Badge>;
            case "CANCELED": return <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">Cancelado</Badge>;
            case "NO_SHOW": return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">Faltou</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <Card className="border-none bg-white/60 backdrop-blur-xl shadow-xl shadow-purple-500/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="border-b border-white/20 pb-4">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-bold font-heading">Histórico de Agendamentos</CardTitle>
                    <Badge variant="secondary" className="rounded-full px-4">{appointments.length} atendimentos</Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {appointments.length === 0 ? (
                    <div className="text-center py-16 px-4">
                        <div className="bg-slate-100/50 h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Calendar className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800">Nenhum agendamento</h3>
                        <p className="text-sm text-muted-foreground mt-1 max-w-[250px] mx-auto text-balance">
                            Este cliente ainda não possui agendamentos cadastrados.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/20">
                        {appointments.map((apt) => (
                            <div key={apt.id} className="p-6 hover:bg-white/40 transition-colors">
                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                    <div className="flex flex-col items-center justify-center min-w-[70px] bg-white/50 border border-white/20 rounded-xl py-2 px-3 shadow-sm">
                                        <span className="text-lg font-bold text-primary leading-none">{apt.startTime}</span>
                                        <span className="text-[10px] uppercase font-bold text-slate-400 mt-1">
                                            {format(new Date(apt.date + 'T00:00:00'), 'dd/MM', { locale: ptBR })}
                                        </span>
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-800 font-heading">
                                                {apt.services.join(", ")}
                                            </span>
                                            {getStatusBadge(apt.status)}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500">
                                            <div className="flex items-center gap-1.5 text-xs">
                                                <User className="h-3.5 w-3.5 text-purple-500/70" />
                                                <span>{MOCK_PROFESSIONALS.find(p => p.id === apt.professionalId)?.name || 'Profissional'}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs">
                                                <Clock className="h-3.5 w-3.5 text-blue-500/70" />
                                                <span>{apt.durationMinutes} minutos</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
