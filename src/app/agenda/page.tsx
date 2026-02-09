"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Plus,
    ChevronLeft,
    ChevronRight,
    Clock,
    User,
} from "lucide-react";
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, addMonths, subMonths, startOfMonth, endOfMonth, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

import { Appointment, MOCK_PROFESSIONALS, MOCK_SERVICES } from "@/core/domain/Appointment";
import { AppointmentService } from "@/core/services/AppointmentService";
import { LocalStorageAppointmentRepository } from "@/infrastructure/repositories/LocalStorageAppointmentRepository";
import { LocalStorageClientRepository } from "@/infrastructure/repositories/LocalStorageClientRepository";
import { Client } from "@/core/domain/Client";
import { formatName } from "@/core/formatters/name";
import { AppointmentForm } from "@/components/agenda/AppointmentForm";
import { toast } from "sonner";

// Horários disponíveis (5h às 23h)
const HOURS = Array.from({ length: 19 }, (_, i) => i + 5); // 5, 6, 7... 23

// Cores dos cards baseado em status/serviço
const getCardColor = (status: string, index: number) => {
    const colors = [
        { bg: "bg-blue-100", border: "border-l-blue-500", text: "text-blue-700" },
        { bg: "bg-green-100", border: "border-l-green-500", text: "text-green-700" },
        { bg: "bg-amber-100", border: "border-l-amber-500", text: "text-amber-700" },
        { bg: "bg-purple-100", border: "border-l-purple-500", text: "text-purple-700" },
        { bg: "bg-rose-100", border: "border-l-rose-500", text: "text-rose-700" },
        { bg: "bg-cyan-100", border: "border-l-cyan-500", text: "text-cyan-700" },
    ];

    if (status === "CANCELED") {
        return { bg: "bg-slate-100", border: "border-l-slate-400", text: "text-slate-500" };
    }
    if (status === "DONE") {
        return { bg: "bg-emerald-100", border: "border-l-emerald-500", text: "text-emerald-700" };
    }

    return colors[index % colors.length];
};

export default function AgendaPage() {
    const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week");
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | undefined>();

    const service = new AppointmentService(new LocalStorageAppointmentRepository());
    const clientRepo = new LocalStorageClientRepository();

    // Calcular range de datas baseado no viewMode
    const dateRange = useMemo(() => {
        if (viewMode === "day") {
            return { start: currentDate, end: currentDate };
        } else if (viewMode === "week") {
            const start = startOfWeek(currentDate, { weekStartsOn: 1 });
            return { start, end: addDays(start, 6) };
        } else {
            const start = startOfMonth(currentDate);
            const end = endOfMonth(currentDate);
            return { start, end };
        }
    }, [currentDate, viewMode]);

    // Dias a exibir
    const displayDays = useMemo(() => {
        if (viewMode === "day") {
            return [currentDate];
        } else if (viewMode === "week") {
            const start = startOfWeek(currentDate, { weekStartsOn: 1 });
            return eachDayOfInterval({ start, end: addDays(start, 6) });
        } else {
            // Mês: pegar do primeiro ao último dia do mês
            return eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) });
        }
    }, [currentDate, viewMode]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [appointmentsData, clientsData] = await Promise.all([
                service.getAll({
                    startDate: format(dateRange.start, 'yyyy-MM-dd'),
                    endDate: format(dateRange.end, 'yyyy-MM-dd')
                }),
                clientRepo.getAll()
            ]);
            setAppointments(appointmentsData);
            setClients(clientsData);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentDate, viewMode]);

    // Navegação
    const handlePrev = () => {
        if (viewMode === "day") {
            setCurrentDate(addDays(currentDate, -1));
        } else if (viewMode === "week") {
            setCurrentDate(subWeeks(currentDate, 1));
        } else {
            setCurrentDate(subMonths(currentDate, 1));
        }
    };

    const handleNext = () => {
        if (viewMode === "day") {
            setCurrentDate(addDays(currentDate, 1));
        } else if (viewMode === "week") {
            setCurrentDate(addWeeks(currentDate, 1));
        } else {
            setCurrentDate(addMonths(currentDate, 1));
        }
    };

    const handleToday = () => setCurrentDate(new Date());

    const handleUpdateStatus = async (id: string, status: Appointment["status"]) => {
        try {
            await service.updateStatus(id, status);
            toast.success("Status atualizado!");
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao atualizar status");
        }
    };

    const handleEdit = (apt: Appointment) => {
        setEditingAppointment(apt);
        setIsFormOpen(true);
    };

    // Buscar agendamentos para um slot (dia + hora)
    const getAppointmentsForSlot = (date: Date, hour: number): Appointment[] => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return appointments.filter(apt => {
            if (apt.date !== dateStr) return false;
            const aptHour = parseInt(apt.startTime.split(':')[0]);
            return aptHour === hour;
        });
    };

    // Buscar todos agendamentos de um dia (para visão mensal)
    const getAppointmentsForDay = (date: Date): Appointment[] => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return appointments.filter(apt => apt.date === dateStr);
    };

    // Calcular posição vertical baseado nos minutos
    const getTopOffset = (startTime: string): number => {
        const minutes = parseInt(startTime.split(':')[1]);
        return (minutes / 60) * 100;
    };

    // Calcular altura baseado na duração
    const getHeight = (durationMinutes: number): number => {
        return (durationMinutes / 60) * 100;
    };

    const getClientName = (clientId: string) => {
        const client = clients.find(c => c.id === clientId);
        return client ? formatName(client.name) : "Cliente";
    };

    const getProfessionalName = (professionalId: string) => {
        const prof = MOCK_PROFESSIONALS.find(p => p.id === professionalId);
        return prof?.name || "Profissional";
    };

    const getServiceNames = (serviceIds: string[]) => {
        return serviceIds.map(id => {
            const svc = MOCK_SERVICES.find(s => s.id === id);
            return svc?.name || id;
        }).join(", ");
    };

    const getStatusBadge = (status: Appointment["status"]) => {
        switch (status) {
            case "PENDING": return <Badge className="bg-amber-500 text-white text-[10px] px-2 py-0.5">Pendente</Badge>;
            case "CONFIRMED": return <Badge className="bg-blue-500 text-white text-[10px] px-2 py-0.5">Confirmado</Badge>;
            case "DONE": return <Badge className="bg-emerald-500 text-white text-[10px] px-2 py-0.5">Finalizado</Badge>;
            case "CANCELED": return <Badge className="bg-slate-400 text-white text-[10px] px-2 py-0.5">Cancelado</Badge>;
            case "NO_SHOW": return <Badge className="bg-rose-500 text-white text-[10px] px-2 py-0.5">Faltou</Badge>;
            default: return null;
        }
    };

    // Renderizar card de agendamento
    const renderAppointmentCard = (apt: Appointment, index: number, totalInSlot: number, slotIndex: number) => {
        const colors = getCardColor(apt.status, index);
        const topOffset = getTopOffset(apt.startTime);
        const height = Math.max(getHeight(apt.durationMinutes), 50);

        // Calcular largura e posição horizontal para sobreposição
        const width = totalInSlot > 1 ? `${100 / totalInSlot}%` : '100%';
        const left = totalInSlot > 1 ? `${(slotIndex / totalInSlot) * 100}%` : '0';

        return (
            <Popover key={apt.id}>
                <PopoverTrigger asChild>
                    <div
                        className={cn(
                            "absolute rounded-lg border-l-4 p-2 cursor-pointer transition-all hover:shadow-md hover:z-20 overflow-hidden",
                            colors.bg,
                            colors.border
                        )}
                        style={{
                            top: `${topOffset}%`,
                            minHeight: `${height}%`,
                            left: left,
                            width: `calc(${width} - 4px)`,
                            marginLeft: '2px',
                            zIndex: 10 + slotIndex
                        }}
                    >
                        <div className="flex flex-col h-full">
                            <span className={cn("text-[10px] font-bold", colors.text)}>
                                #{apt.id.slice(0, 4).toUpperCase()}
                            </span>
                            <span className={cn("text-xs font-semibold truncate", colors.text)}>
                                {getServiceNames(apt.services).split(',')[0]}
                            </span>
                            {totalInSlot === 1 && (
                                <div className="flex items-center mt-auto pt-1">
                                    <div className="h-5 w-5 rounded-full bg-white/80 flex items-center justify-center border border-white">
                                        <span className="text-[8px] font-bold text-slate-600">
                                            {getClientName(apt.clientId).charAt(0)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 rounded-2xl shadow-xl z-50" align="start">
                    <div className="p-4 border-b border-slate-100">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-lg font-bold text-primary">
                                        {getClientName(apt.clientId).charAt(0)}
                                    </span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">
                                        {getClientName(apt.clientId)}
                                    </h4>
                                    <p className="text-xs text-slate-500">
                                        #{apt.id.slice(0, 8).toUpperCase()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500">Serviço</span>
                            <span className="text-sm font-medium text-right max-w-[180px] truncate">
                                {getServiceNames(apt.services)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500">Status</span>
                            {getStatusBadge(apt.status)}
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500 flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                Data
                            </span>
                            <span className="text-sm font-medium">
                                {format(new Date(apt.date + 'T00:00:00'), "dd/MM/yyyy")} {apt.startTime} - {
                                    (() => {
                                        const [h, m] = apt.startTime.split(':').map(Number);
                                        const endMinutes = h * 60 + m + apt.durationMinutes;
                                        const endH = Math.floor(endMinutes / 60);
                                        const endM = endMinutes % 60;
                                        return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
                                    })()
                                }
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500 flex items-center gap-1">
                                <User className="h-3.5 w-3.5" />
                                Profissional
                            </span>
                            <span className="text-sm font-medium">
                                {getProfessionalName(apt.professionalId)}
                            </span>
                        </div>
                    </div>
                    <div className="p-4 border-t border-slate-100 space-y-2">
                        {apt.status === "PENDING" && (
                            <Button
                                className="w-full rounded-xl"
                                onClick={() => handleUpdateStatus(apt.id, "CONFIRMED")}
                            >
                                Confirmar
                            </Button>
                        )}
                        {apt.status === "CONFIRMED" && (
                            <Button
                                className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600"
                                onClick={() => handleUpdateStatus(apt.id, "DONE")}
                            >
                                Finalizar
                            </Button>
                        )}
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1 rounded-xl"
                                onClick={() => handleEdit(apt)}
                            >
                                Editar
                            </Button>
                            {apt.status !== "CANCELED" && apt.status !== "DONE" && (
                                <Button
                                    variant="outline"
                                    className="flex-1 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                    onClick={() => handleUpdateStatus(apt.id, "CANCELED")}
                                >
                                    Cancelar
                                </Button>
                            )}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        );
    };

    // Número de colunas baseado no viewMode
    // Grid columns - visão dia com coluna hora menor
    const gridCols = viewMode === "day" ? "grid-cols-[60px_1fr]" : viewMode === "week" ? "grid-cols-[60px_repeat(7,1fr)]" : "";

    // Header de navegação com texto apropriado
    const getNavigationText = () => {
        if (viewMode === "day") {
            return format(currentDate, "dd 'de' MMMM, yyyy", { locale: ptBR });
        } else if (viewMode === "week") {
            const start = startOfWeek(currentDate, { weekStartsOn: 1 });
            return `${format(start, "dd/MM")} - ${format(addDays(start, 6), "dd/MM/yyyy")}`;
        } else {
            return format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
        }
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading capitalize">
                        {format(currentDate, "MMMM, yyyy", { locale: ptBR })}
                    </h1>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {/* View Toggle */}
                    <div className="flex items-center bg-white/60 border border-white/20 p-1 rounded-xl">
                        <Button
                            variant={viewMode === "day" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("day")}
                            className={cn("rounded-lg h-9 px-4", viewMode === "day" && "bg-white shadow-sm")}
                        >
                            Dia
                        </Button>
                        <Button
                            variant={viewMode === "week" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("week")}
                            className={cn("rounded-lg h-9 px-4", viewMode === "week" && "bg-white shadow-sm")}
                        >
                            Semana
                        </Button>
                        <Button
                            variant={viewMode === "month" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("month")}
                            className={cn("rounded-lg h-9 px-4", viewMode === "month" && "bg-white shadow-sm")}
                        >
                            Mês
                        </Button>
                    </div>

                    <Button
                        onClick={() => {
                            setEditingAppointment(undefined);
                            setIsFormOpen(true);
                        }}
                        className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Novo Agendamento</span>
                        <span className="sm:hidden">Novo</span>
                    </Button>
                </div>
            </div>

            {/* Calendar Grid */}
            <Card className="border-none bg-white/60 backdrop-blur-xl shadow-xl shadow-purple-500/5 overflow-hidden">
                <CardContent className="p-0">
                    {/* Navigation */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                        <Button variant="outline" size="sm" onClick={handleToday} className="rounded-lg">
                            Hoje
                        </Button>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={handlePrev} className="h-8 w-8">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-medium min-w-[200px] text-center">
                                {getNavigationText()}
                            </span>
                            <Button variant="ghost" size="icon" onClick={handleNext} className="h-8 w-8">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="w-[60px]" />
                    </div>

                    {/* Day/Week View */}
                    {(viewMode === "day" || viewMode === "week") && (
                        <>
                            {/* Week Header */}
                            <div className={cn("grid border-b border-slate-100", gridCols)}>
                                <div className="p-3 text-center border-r border-slate-100">
                                    {/* Empty - hora column */}
                                </div>
                                {displayDays.map((day, idx) => {
                                    const isToday = isSameDay(day, new Date());
                                    return (
                                        <div
                                            key={idx}
                                            className={cn(
                                                "p-3 text-center border-r border-slate-100 last:border-r-0",
                                                isToday && "bg-primary/5"
                                            )}
                                        >
                                            <div className={cn(
                                                "text-xs font-medium uppercase tracking-wider",
                                                isToday ? "text-primary" : "text-slate-500"
                                            )}>
                                                {format(day, "EEEEEE", { locale: ptBR })}
                                            </div>
                                            <div className={cn(
                                                "text-lg font-bold mt-1",
                                                isToday ? "text-primary" : "text-slate-800"
                                            )}>
                                                {format(day, "dd")}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Time Grid */}
                            <div className="max-h-[calc(100vh-320px)] min-h-[500px] overflow-y-auto">
                                {HOURS.map((hour) => (
                                    <div key={hour} className={cn("grid border-b border-slate-50 min-h-[70px]", gridCols)}>
                                        {/* Hora */}
                                        <div className="p-2 text-right border-r border-slate-100 text-sm text-slate-400 font-medium sticky left-0 bg-white/80">
                                            {hour.toString().padStart(2, '0')}:00
                                        </div>

                                        {/* Dias */}
                                        {displayDays.map((day, dayIdx) => {
                                            const slotAppointments = getAppointmentsForSlot(day, hour);
                                            const isToday = isSameDay(day, new Date());

                                            return (
                                                <div
                                                    key={dayIdx}
                                                    className={cn(
                                                        "relative border-r border-slate-50 last:border-r-0 min-h-[70px]",
                                                        isToday && "bg-primary/[0.02]"
                                                    )}
                                                >
                                                    {slotAppointments.map((apt, aptIdx) =>
                                                        renderAppointmentCard(apt, dayIdx * 10 + aptIdx, slotAppointments.length, aptIdx)
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Month View */}
                    {viewMode === "month" && (
                        <div className="p-4">
                            {/* Dias da semana */}
                            <div className="grid grid-cols-7 mb-2">
                                {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((d) => (
                                    <div key={d} className="text-center text-xs font-semibold text-slate-500 py-2">
                                        {d}
                                    </div>
                                ))}
                            </div>

                            {/* Calendário do mês */}
                            <div className="grid grid-cols-7 gap-1">
                                {/* Espaços vazios antes do primeiro dia */}
                                {Array.from({ length: (getDay(startOfMonth(currentDate)) + 6) % 7 }).map((_, i) => (
                                    <div key={`empty-${i}`} className="min-h-[140px] p-1" />
                                ))}

                                {/* Dias do mês */}
                                {displayDays.map((day, idx) => {
                                    const dayAppointments = getAppointmentsForDay(day);
                                    const isToday = isSameDay(day, new Date());

                                    return (
                                        <div
                                            key={idx}
                                            className={cn(
                                                "min-h-[140px] max-h-[280px] overflow-y-auto p-1.5 rounded-lg border border-slate-100",
                                                isToday && "bg-primary/5 border-primary/30"
                                            )}
                                        >
                                            <div className={cn(
                                                "text-sm font-semibold mb-1",
                                                isToday ? "text-primary" : "text-slate-700"
                                            )}>
                                                {format(day, "d")}
                                            </div>
                                            <div className="space-y-1">
                                                {dayAppointments.map((apt, aptIdx) => {
                                                    const colors = getCardColor(apt.status, aptIdx);
                                                    return (
                                                        <Popover key={apt.id}>
                                                            <PopoverTrigger asChild>
                                                                <div
                                                                    className={cn(
                                                                        "text-[10px] p-1 rounded truncate cursor-pointer hover:opacity-80",
                                                                        colors.bg,
                                                                        colors.text
                                                                    )}
                                                                >
                                                                    {apt.startTime} {getServiceNames(apt.services).split(',')[0]}
                                                                </div>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-72 p-0 rounded-xl shadow-lg z-50">
                                                                {/* Conteúdo resumido do popover */}
                                                                <div className="p-3 border-b">
                                                                    <div className="font-semibold">{getClientName(apt.clientId)}</div>
                                                                    <div className="text-xs text-slate-500">{getServiceNames(apt.services)}</div>
                                                                </div>
                                                                <div className="p-3 text-sm space-y-1">
                                                                    <div className="flex justify-between">
                                                                        <span>Horário:</span>
                                                                        <span className="font-medium">{apt.startTime}</span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span>Status:</span>
                                                                        {getStatusBadge(apt.status)}
                                                                    </div>
                                                                </div>
                                                                <div className="p-3 border-t flex gap-2">
                                                                    <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => handleEdit(apt)}>
                                                                        Editar
                                                                    </Button>
                                                                    {apt.status === "PENDING" && (
                                                                        <Button size="sm" className="flex-1 text-xs" onClick={() => handleUpdateStatus(apt.id, "CONFIRMED")}>
                                                                            Confirmar
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </PopoverContent>
                                                        </Popover>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Appointment Form Dialog */}
            <AppointmentForm
                isOpen={isFormOpen}
                onOpenChange={setIsFormOpen}
                initialData={editingAppointment}
                onSuccess={fetchData}
            />
        </div>
    );
}
