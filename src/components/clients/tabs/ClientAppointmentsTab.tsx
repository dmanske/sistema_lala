"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Save, Loader2, StickyNote, CreditCard, Droplets, ChevronDown, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment } from "@/core/domain/Appointment";
import { AppointmentService } from "@/core/services/AppointmentService";
import { ClientService } from "@/core/services/ClientService";
import { getAppointmentRepository, getClientRepository, getSaleRepository, getServiceRepository, getProfessionalRepository } from "@/infrastructure/repositories/factory";
import { Sale, PaymentMethod } from "@/core/domain/sales/types";
import { Service } from "@/core/domain/Service";
import { Professional } from "@/core/domain/Professional";
import { UsageProductLog } from "@/core/domain/UsageProduct";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUsageProducts } from "@/hooks/useUsageProducts";

interface ClientAppointmentsTabProps {
    clientId: string;
}

export function ClientAppointmentsTab({ clientId }: ClientAppointmentsTabProps) {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [appointmentSales, setAppointmentSales] = useState<Map<string, Sale>>(new Map());
    const [professionals, setProfessionals] = useState<Professional[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [usageLogs, setUsageLogs] = useState<UsageProductLog[]>([]);
    const { getLogsByClient } = useUsageProducts();

    // Notes
    const [clientNotes, setClientNotes] = useState("");
    const [isSavingNotes, setIsSavingNotes] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const appRepo = getAppointmentRepository();
            const appService = new AppointmentService(appRepo);

            const clientRepo = getClientRepository();
            const clientService = new ClientService(clientRepo);

            const saleRepo = getSaleRepository();
            const serviceRepo = getServiceRepository();
            const professionalRepo = getProfessionalRepository();

            const [appData, clientData, svcsData, profsData] = await Promise.all([
                appService.getAll({ clientId }),
                clientService.getById(clientId),
                serviceRepo.getAll(),
                professionalRepo.getAll()
            ]);

            // Sort appointment by date/time descending
            const sorted = appData.sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.startTime}`);
                const dateB = new Date(`${b.date}T${b.startTime}`);
                return dateB.getTime() - dateA.getTime();
            });
            setAppointments(sorted);
            setServices(svcsData);
            setProfessionals(profsData);

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

            // Fetch usage logs for this client
            try {
                const logs = await getLogsByClient(clientId);
                setUsageLogs(logs);
            } catch (e) {
                console.error("Error fetching usage logs:", e);
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
            const clientRepo = getClientRepository();
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
            case 'credit': return 'Crédito';
            case 'fiado': return 'Fiado';
            default: return method;
        }
    };

    const getStatusBadge = (status: Appointment["status"]) => {
        switch (status) {
            case "PENDING": return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pendente</Badge>;
            case "CONFIRMED": return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Confirmado</Badge>;
            case "DONE": return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Finalizado</Badge>;
            case "CANCELED": return <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">Apagar</Badge>;
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
                                placeholder="Escreva aqui observações importantes sobre o cliente (ex: alergias, histórico pessoal, informações relevantes)..."
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
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200/60 bg-slate-50/40">
                                        <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider w-8"></th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Data</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Serviço</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Profissional</th>
                                        <th className="text-center py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Status</th>
                                        <th className="text-right py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Valor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.map((apt) => {
                                        const sale = appointmentSales.get(apt.id);
                                        const aptLogs = usageLogs.filter(l => l.appointmentId === apt.id);
                                        const hasDetails = !!(apt.notes || aptLogs.length > 0);
                                        return (
                                            <AppointmentRow
                                                key={apt.id}
                                                apt={apt}
                                                sale={sale}
                                                aptLogs={aptLogs}
                                                hasDetails={hasDetails}
                                                services={services}
                                                professionals={professionals}
                                                getStatusBadge={getStatusBadge}
                                                getPaymentMethodLabel={getPaymentMethodLabel}
                                            />
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

/* Compact expandable row for each appointment */
function AppointmentRow({
    apt, sale, aptLogs, hasDetails, services, professionals, getStatusBadge, getPaymentMethodLabel
}: {
    apt: Appointment;
    sale: Sale | undefined;
    aptLogs: UsageProductLog[];
    hasDetails: boolean;
    services: Service[];
    professionals: Professional[];
    getStatusBadge: (s: Appointment["status"]) => React.ReactNode;
    getPaymentMethodLabel: (m: PaymentMethod) => string;
}) {
    const [open, setOpen] = useState(false);

    const serviceName = apt.status === 'DONE' && apt.finalizedServices
        ? apt.finalizedServices.map(s => s.name).join(", ")
        : apt.services.map(id => services.find(s => s.id === id)?.name || id).join(", ");

    const profName = professionals.find(p => p.id === apt.professionalId)?.name || '—';

    return (
        <>
            <tr
                className={`border-b border-slate-100/60 hover:bg-white/50 transition-colors ${hasDetails ? 'cursor-pointer' : ''}`}
                onClick={() => hasDetails && setOpen(!open)}
            >
                <td className="py-3 px-4 text-slate-400">
                    {hasDetails && (
                        open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                    )}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-800">{format(new Date(apt.date + 'T00:00:00'), 'dd/MM/yy', { locale: ptBR })}</div>
                    <div className="text-xs text-slate-400">{apt.startTime}</div>
                </td>
                <td className="py-3 px-4">
                    <span className="font-medium text-slate-700 line-clamp-1">{serviceName}</span>
                    {aptLogs.length > 0 && (
                        <span className="ml-1.5 inline-flex items-center">
                            <Droplets className="h-3 w-3 text-violet-400" />
                        </span>
                    )}
                </td>
                <td className="py-3 px-4 text-slate-600">{profName}</td>
                <td className="py-3 px-4 text-center">{getStatusBadge(apt.status)}</td>
                <td className="py-3 px-4 text-right whitespace-nowrap">
                    {sale ? (
                        <div>
                            <span className="font-semibold text-emerald-600">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.total)}
                            </span>
                            {sale.payments && sale.payments.length > 0 && (
                                <div className="text-[11px] text-slate-400 flex items-center gap-1 justify-end">
                                    <CreditCard className="h-3 w-3" />
                                    {getPaymentMethodLabel(sale.payments[0].method)}
                                </div>
                            )}
                        </div>
                    ) : (
                        <span className="text-slate-300">—</span>
                    )}
                </td>
            </tr>
            {open && hasDetails && (
                <tr className="bg-slate-50/30">
                    <td colSpan={6} className="px-6 py-3 space-y-2">
                        {apt.notes && (
                            <div className="text-sm bg-amber-50/60 border border-amber-100 p-2.5 rounded-lg text-slate-700">
                                <span className="font-semibold text-xs text-amber-600 uppercase tracking-wider mr-2">Obs:</span>
                                {apt.notes}
                            </div>
                        )}
                        {aptLogs.length > 0 && (
                            <div className="text-sm bg-violet-50/60 border border-violet-100 p-2.5 rounded-lg">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <Droplets className="h-3.5 w-3.5 text-violet-600" />
                                    <span className="text-xs font-semibold text-violet-800 uppercase tracking-wider">Fórmula</span>
                                </div>
                                <div className="pl-5 space-y-0.5">
                                    {aptLogs.map((log, i) => (
                                        <div key={i} className="text-violet-700">
                                            • {log.productName || "Produto"}: {log.amountUsed}{log.measurementUnit || 'g'}
                                            {log.notes && <span className="text-violet-500 ml-1">({log.notes})</span>}
                                        </div>
                                    ))}
                                    {aptLogs.find(l => l.formulaChangeReason) && (
                                        <div className="mt-1 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded px-2 py-1 inline-block">
                                            📝 {aptLogs.find(l => l.formulaChangeReason)?.formulaChangeReason}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </td>
                </tr>
            )}
        </>
    );
}
