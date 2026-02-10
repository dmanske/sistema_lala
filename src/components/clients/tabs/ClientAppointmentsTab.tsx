"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Save, Loader2, StickyNote, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment, MOCK_PROFESSIONALS, MOCK_SERVICES } from "@/core/domain/Appointment";
import { AppointmentService } from "@/core/services/AppointmentService";
import { LocalStorageAppointmentRepository } from "@/infrastructure/repositories/LocalStorageAppointmentRepository";
import { ClientService } from "@/core/services/ClientService";
import { LocalStorageClientRepository } from "@/infrastructure/repositories/LocalStorageClientRepository";
import { LocalStorageSaleRepository } from "@/infrastructure/repositories/sales/LocalStorageSaleRepository";
import { Sale, PaymentMethod } from "@/core/domain/sales/types";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

interface ClientAppointmentsTabProps {
    clientId: string;
}

export function ClientAppointmentsTab({ clientId }: ClientAppointmentsTabProps) {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [appointmentSales, setAppointmentSales] = useState<Map<string, Sale>>(new Map());
    const [loading, setLoading] = useState(true);

    // Notes
    const [clientNotes, setClientNotes] = useState("");
    const [isSavingNotes, setIsSavingNotes] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const appRepo = new LocalStorageAppointmentRepository();
            const appService = new AppointmentService(appRepo);

            const clientRepo = new LocalStorageClientRepository();
            const clientService = new ClientService(clientRepo);

            const saleRepo = new LocalStorageSaleRepository();

            const [appData, clientData] = await Promise.all([
                appService.getAll({ clientId }),
                clientService.getById(clientId)
            ]);

            // Sort appointment by date/time descending
            const sorted = appData.sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.startTime}`);
                const dateB = new Date(`${b.date}T${b.startTime}`);
                return dateB.getTime() - dateA.getTime();
            });
            setAppointments(sorted);

            // Fetch sales for each appointment
            const salesMap = new Map<string, Sale>();
            for (const apt of sorted) {
                const sale = await saleRepo.findByAppointmentId(apt.id);
                if (sale && sale.status === 'paid') {
                    salesMap.set(apt.id, sale);
                }
            }
            setAppointmentSales(salesMap);

            if (clientData) {
                setClientNotes(clientData.notes || "");
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [clientId]);

    const handleSaveNotes = async () => {
        setIsSavingNotes(true);
        try {
            const clientRepo = new LocalStorageClientRepository();
            const clientService = new ClientService(clientRepo);
            await clientService.update(clientId, { notes: clientNotes });
            toast.success("Observações salvas com sucesso!");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar observações.");
        } finally {
            setIsSavingNotes(false);
        }
    };

    const getPaymentMethodLabel = (method: PaymentMethod): string => {
        switch (method) {
            case 'pix': return 'PIX';
            case 'card': return 'Cartão';
            case 'cash': return 'Dinheiro';
            case 'transfer': return 'Transferência';
            default: return method;
        }
    };

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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Seção de Observações Gerais */}
            <Card className="border-none bg-white/60 backdrop-blur-xl shadow-xl shadow-purple-500/5 overflow-hidden">
                <CardHeader className="border-b border-white/20 pb-4">
                    <CardTitle className="text-xl font-bold font-heading flex items-center gap-2">
                        <StickyNote className="h-5 w-5 text-yellow-500" />
                        Observações Gerais do Cliente
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <div className="relative">
                            <Textarea
                                placeholder="Escreva aqui observações importantes sobre o cliente (ex: alergias, preferências, histórico pessoal)..."
                                className="min-h-[120px] bg-white/50 border-white/40 focus:bg-white resize-y text-base"
                                value={clientNotes}
                                onChange={(e) => setClientNotes(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button
                                onClick={handleSaveNotes}
                                disabled={isSavingNotes}
                                className="relative overflow-hidden"
                            >
                                {isSavingNotes ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Salvar Observações
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Lista de Agendamentos */}
            <Card className="border-none bg-white/60 backdrop-blur-xl shadow-xl shadow-purple-500/5 overflow-hidden">
                <CardHeader className="border-b border-white/20 pb-4">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-xl font-bold font-heading">Histórico de Agendamentos</CardTitle>
                        <Badge variant="secondary" className="rounded-full px-4">{appointments.length} registros</Badge>
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
                            {appointments.map((apt) => {
                                const sale = appointmentSales.get(apt.id);
                                return (
                                    <div key={apt.id} className="p-6 hover:bg-white/40 transition-colors group">
                                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                            <div className="flex flex-col items-center justify-center min-w-[70px] bg-white/50 border border-white/20 rounded-xl py-2 px-3 shadow-sm group-hover:bg-white group-hover:shadow-md transition-all">
                                                <span className="text-lg font-bold text-primary leading-none">{apt.startTime}</span>
                                                <span className="text-[10px] uppercase font-bold text-slate-400 mt-1">
                                                    {format(new Date(apt.date + 'T00:00:00'), 'dd/MM', { locale: ptBR })}
                                                </span>
                                            </div>

                                            <div className="flex-1 space-y-2 w-full">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-slate-800 font-heading text-lg">
                                                            {apt.status === 'DONE' && apt.finalizedServices
                                                                ? apt.finalizedServices.map(s => s.name).join(", ")
                                                                : apt.services.map(id => MOCK_SERVICES.find(s => s.id === id)?.name || id).join(", ")
                                                            }
                                                        </span>
                                                        {getStatusBadge(apt.status)}
                                                    </div>
                                                    {sale && (
                                                        <div className="text-right space-y-0.5">
                                                            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Total</span>
                                                            <span className="text-lg font-bold text-emerald-600">
                                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.total)}
                                                            </span>
                                                            {sale.payments && sale.payments.length > 0 && (
                                                                <div className="flex items-center gap-1 justify-end text-xs text-slate-600">
                                                                    <CreditCard className="h-3 w-3" />
                                                                    <span>{getPaymentMethodLabel(sale.payments[0].method)}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-500">
                                                    <div className="flex items-center gap-1.5 text-xs font-medium">
                                                        <User className="h-3.5 w-3.5 text-purple-500" />
                                                        <span>{MOCK_PROFESSIONALS.find(p => p.id === apt.professionalId)?.name || 'Profissional'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs font-medium">
                                                        <Clock className="h-3.5 w-3.5 text-blue-500" />
                                                        <span>{apt.durationMinutes} minutos</span>
                                                    </div>
                                                </div>

                                                {/* Observação do Agendamento */}
                                                {apt.notes && (
                                                    <div className="mt-3 text-sm bg-amber-50/50 border border-amber-100 p-3 rounded-xl text-slate-700 relative">
                                                        <div className="absolute top-3 left-3 w-1 h-1 rounded-full bg-amber-400"></div>
                                                        <span className="font-bold text-xs text-amber-600 uppercase tracking-wider block mb-1 pl-3">Observação do Agendamento</span>
                                                        <p className="pl-3 leading-relaxed">{apt.notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
