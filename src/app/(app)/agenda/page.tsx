"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
    Plus,
    ChevronLeft,
    ChevronRight,
    Clock,
    User,
    Calendar as CalendarIcon,
    Search,
    Filter,
    ShoppingCart
} from "lucide-react";
import { useRouter } from "next/navigation";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Appointment } from "@/core/domain/Appointment";
import { AppointmentService } from "@/core/services/AppointmentService";
import { getAppointmentRepository, getClientRepository, getServiceRepository, getProfessionalRepository } from "@/infrastructure/repositories/factory";
import { Service } from "@/core/domain/Service";
import { Client } from "@/core/domain/Client";
import { Professional } from "@/core/domain/Professional";
import { formatName } from "@/core/formatters/name";
import { AppointmentForm } from "@/components/agenda/AppointmentForm";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";


// Horários disponíveis (5h às 23h)
// Horários disponíveis (5h às 23:30, intervalos de 30min)
const TIME_SLOTS = Array.from({ length: 38 }, (_, i) => {
    const totalMinutes = 5 * 60 + i * 30;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
});

// Tipo de retorno explicito para styles
type CardStyle = {
    bg: string;
    border: string;
    text: string;
    accent: string;
    shadow: string;
    opacity?: string;
    customStyle?: React.CSSProperties;
};

// Cores dos cards modernizadas (Glassmorphism + Gradients)
const getCardStyle = (status: string, index: number): CardStyle => {
    // Cores base para diferentes tipos de agendamento/status
    const styles: CardStyle[] = [
        {
            bg: "bg-gradient-to-br from-blue-50 to-blue-100/80 hover:from-blue-100 hover:to-blue-200",
            border: "border-blue-200/50",
            text: "text-blue-700",
            accent: "bg-blue-500",
            shadow: "hover:shadow-blue-500/10"
        },
        {
            bg: "bg-gradient-to-br from-purple-50 to-purple-100/80 hover:from-purple-100 hover:to-purple-200",
            border: "border-purple-200/50",
            text: "text-purple-700",
            accent: "bg-purple-500",
            shadow: "hover:shadow-purple-500/10"
        },
        {
            bg: "bg-gradient-to-br from-pink-50 to-pink-100/80 hover:from-pink-100 hover:to-pink-200",
            border: "border-pink-200/50",
            text: "text-pink-700",
            accent: "bg-pink-500",
            shadow: "hover:shadow-pink-500/10"
        },
        {
            bg: "bg-gradient-to-br from-orange-50 to-orange-100/80 hover:from-orange-100 hover:to-orange-200",
            border: "border-orange-200/50",
            text: "text-orange-700",
            accent: "bg-orange-500",
            shadow: "hover:shadow-orange-500/10"
        },
        {
            bg: "bg-gradient-to-br from-teal-50 to-teal-100/80 hover:from-teal-100 hover:to-teal-200",
            border: "border-teal-200/50",
            text: "text-teal-700",
            accent: "bg-teal-500",
            shadow: "hover:shadow-teal-500/10"
        },
    ];

    if (status === "CANCELED") {
        return {
            bg: "bg-slate-50 hover:bg-slate-100",
            border: "border-slate-200",
            text: "text-slate-500 decoration-slate-400/50", // line-through handled elsewhere if needed
            accent: "bg-slate-400",
            shadow: "hover:shadow-slate-500/5",
            opacity: "opacity-70"
        };
    }
    if (status === "DONE") {
        return {
            bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/80 hover:from-emerald-100 hover:to-emerald-200",
            border: "border-emerald-200/50",
            text: "text-emerald-800",
            accent: "bg-emerald-500",
            shadow: "hover:shadow-emerald-500/10"
        };
    }
    if (status === "NO_SHOW") {
        return {
            bg: "bg-rose-50 hover:bg-rose-100",
            border: "border-rose-200",
            text: "text-rose-700",
            accent: "bg-rose-500",
            shadow: "hover:shadow-rose-500/10"
        };
    }

    if (status === "BLOCKED") {
        return {
            bg: "bg-slate-100",
            border: "border-slate-300 border-dashed",
            text: "text-slate-500",
            accent: "bg-slate-400",
            shadow: "none",
            opacity: "opacity-90",
            customStyle: {
                backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, #f1f5f9 10px, #f1f5f9 20px)"
            }
        };
    }

    return styles[index % styles.length];
};

export default function AgendaPage() {
    const [currentTime, setCurrentTime] = useState<string>("");

    useEffect(() => {
        const updateTime = () => setCurrentTime(format(new Date(), 'HH:mm'));
        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, []);
    const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week");
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [professionals, setProfessionals] = useState<Professional[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | undefined>();
    const [selectedSlot, setSelectedSlot] = useState<{ date: string, time: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const router = useRouter();

    // ===== DRAG & DROP STATE =====
    const [draggingAppointment, setDraggingAppointment] = useState<Appointment | null>(null);
    const [dragGhost, setDragGhost] = useState<{ x: number; y: number } | null>(null);
    const [dropTarget, setDropTarget] = useState<{ date: string; time: string } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const draggingRef = useRef(false); // Sync ref for drag state (avoids stale closures)
    const draggingAptRef = useRef<Appointment | null>(null);
    const dragStartPos = useRef<{ x: number; y: number } | null>(null);
    const dragTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const dragThreshold = 5; // pixels before drag activates



    const service = new AppointmentService(getAppointmentRepository());
    const clientRepo = getClientRepository();
    const serviceRepo = getServiceRepository();
    const professionalRepo = getProfessionalRepository();

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
            return eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) });
        }
    }, [currentDate, viewMode]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [appointmentsData, clientsData, servicesData, professionalsData] = await Promise.all([
                service.getAll({
                    startDate: format(dateRange.start, 'yyyy-MM-dd'),
                    endDate: format(dateRange.end, 'yyyy-MM-dd')
                }),
                clientRepo.getAll(),
                serviceRepo.getAll(),
                professionalRepo.getAll()
            ]);
            setAppointments(appointmentsData);
            setClients(clientsData);
            setServices(servicesData);
            setProfessionals(professionalsData);
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
        setSelectedSlot(null); // Reseta slot selecionado
        setIsFormOpen(true);
    };

    const handleSlotClick = (date: Date, time: string) => {
        if (isDragging) return; // Don't open form if currently dragging
        const dateStr = format(date, 'yyyy-MM-dd');
        setSelectedSlot({ date: dateStr, time });
        setEditingAppointment(undefined);
        setIsFormOpen(true);
    };

    // ===== DRAG & DROP HANDLERS =====
    const getTimeFromY = useCallback((y: number): string => {
        if (!gridRef.current) return '05:00';
        const rect = gridRef.current.getBoundingClientRect();
        const scrollTop = gridRef.current.scrollTop;
        const relativeY = y - rect.top + scrollTop;
        const slotHeight = GRID_HOUR_HEIGHT / 2; // each slot = 30min
        const slotIndex = Math.max(0, Math.min(TIME_SLOTS.length - 1, Math.floor(relativeY / slotHeight)));
        return TIME_SLOTS[slotIndex];
    }, []);

    const getDayFromX = useCallback((x: number): Date | null => {
        if (!gridRef.current) return null;
        const rect = gridRef.current.getBoundingClientRect();
        const hourColumnWidth = 60;
        const relativeX = x - rect.left - hourColumnWidth;
        const dayColumnWidth = (rect.width - hourColumnWidth) / displayDays.length;
        const dayIndex = Math.floor(relativeX / dayColumnWidth);
        if (dayIndex < 0 || dayIndex >= displayDays.length) return null;
        return displayDays[dayIndex];
    }, [displayDays]);

    const handleDragStart = useCallback((e: React.MouseEvent, apt: Appointment) => {
        if (apt.status === 'DONE' || apt.status === 'CANCELED') return;
        e.preventDefault();
        e.stopPropagation();
        // Capture coords immediately (before setTimeout) to avoid stale synthetic event
        const startX = e.clientX;
        const startY = e.clientY;
        dragStartPos.current = { x: startX, y: startY };

        dragTimerRef.current = setTimeout(() => {
            draggingRef.current = true;
            draggingAptRef.current = apt;
            setDraggingAppointment(apt);
            setIsDragging(true);
            setDragGhost({ x: startX, y: startY });
            const day = getDayFromX(startX);
            const time = getTimeFromY(startY);
            if (day) {
                setDropTarget({ date: format(day, 'yyyy-MM-dd'), time });
            }
        }, 150);
    }, [getDayFromX, getTimeFromY]);

    const handleDragMove = useCallback((e: React.MouseEvent) => {
        // Use ref for synchronous check (state may lag behind)
        if (!draggingRef.current) {
            // Check if we should cancel the timer (moved too far before trigger)
            if (dragStartPos.current) {
                const dx = Math.abs(e.clientX - dragStartPos.current.x);
                const dy = Math.abs(e.clientY - dragStartPos.current.y);
                if (dx > dragThreshold || dy > dragThreshold) {
                    if (dragTimerRef.current) {
                        clearTimeout(dragTimerRef.current);
                        dragTimerRef.current = null;
                    }
                }
            }
            return;
        }
        e.preventDefault();
        setDragGhost({ x: e.clientX, y: e.clientY });
        const day = getDayFromX(e.clientX);
        const time = getTimeFromY(e.clientY);
        if (day) {
            setDropTarget({ date: format(day, 'yyyy-MM-dd'), time });
        }
    }, [getDayFromX, getTimeFromY]);

    const handleDragEnd = useCallback(async () => {
        if (dragTimerRef.current) {
            clearTimeout(dragTimerRef.current);
            dragTimerRef.current = null;
        }
        dragStartPos.current = null;

        if (!draggingAptRef.current || !dropTarget) {
            draggingRef.current = false;
            draggingAptRef.current = null;
            setDraggingAppointment(null);
            setDragGhost(null);
            setDropTarget(null);
            // Delay resetting isDragging to prevent click from firing
            setTimeout(() => setIsDragging(false), 100);
            return;
        }

        const apt = draggingAptRef.current!;
        const hasChanged = apt.date !== dropTarget.date || apt.startTime !== dropTarget.time;

        if (hasChanged) {
            try {
                await service.update(apt.id, {
                    date: dropTarget.date,
                    startTime: dropTarget.time,
                });
                toast.success(`Agendamento movido para ${dropTarget.time} em ${format(new Date(dropTarget.date + 'T00:00:00'), 'dd/MM')}`);
                fetchData();
            } catch (error) {
                console.error(error);
                toast.error("Erro ao mover agendamento");
            }
        }

        draggingRef.current = false;
        draggingAptRef.current = null;
        setDraggingAppointment(null);
        setDragGhost(null);
        setDropTarget(null);
        setTimeout(() => setIsDragging(false), 100);
    }, [draggingAppointment, dropTarget]);

    // Global mouse up listener for drag end
    useEffect(() => {
        const onMouseUp = () => {
            if (isDragging) handleDragEnd();
        };
        window.addEventListener('mouseup', onMouseUp);
        return () => window.removeEventListener('mouseup', onMouseUp);
    }, [isDragging, handleDragEnd]);

    // Filtros e buscas
    const getAppointmentsForDay = (date: Date): Appointment[] => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return appointments.filter(apt => {
            if (apt.date !== dateStr) return false;

            // Filtro por termo de busca (opcional)
            if (searchTerm) {
                const client = clients.find(c => c.id === apt.clientId);
                const clientName = client ? client.name.toLowerCase() : "";
                const serviceName = getServiceNames(apt.services).toLowerCase();
                if (apt.status === 'BLOCKED') return true; // Show blocked slots always if searching? Or filter? For now show.
                if (!clientName.includes(searchTerm.toLowerCase()) && !serviceName.includes(searchTerm.toLowerCase())) {
                    return false;
                }
            }
            return true;
        });
    };

    // Helpers visuais
    const GRID_HOUR_HEIGHT = 80; // Altura fixa por hora em pixels
    const START_HOUR = 5; // Hora inicial do grid

    const getTopOffsetPx = (startTime: string): number => {
        const [h, m] = startTime.split(':').map(Number);
        const totalMinutesFromStart = (h - START_HOUR) * 60 + m;
        return (totalMinutesFromStart / 60) * GRID_HOUR_HEIGHT;
    };

    const getCurrentTimeOffsetPx = (): number => {
        const now = new Date();
        const minutes = (now.getHours() - START_HOUR) * 60 + now.getMinutes();
        return (minutes / 60) * GRID_HOUR_HEIGHT;
    };

    const getHeightPx = (durationMinutes: number): number => {
        return (durationMinutes / 60) * GRID_HOUR_HEIGHT;
    };

    const getClientName = (clientId: string) => {
        if (!clientId) return "";
        const client = clients.find(c => c.id === clientId);
        return client ? formatName(client.name) : "Cliente";
    };

    const getClientInitial = (clientId: string) => {
        if (!clientId) return "?";
        const name = getClientName(clientId);
        return name.charAt(0).toUpperCase();
    };

    const getProfessionalName = (professionalId: string) => {
        const prof = professionals.find(p => p.id === professionalId);
        return prof?.name || "Profissional";
    };

    const getServiceNames = (serviceIds?: string[]) => {
        if (!serviceIds || serviceIds.length === 0) return "";
        return serviceIds.map(id => {
            const svc = services.find(s => s.id === id);
            return svc?.name || "Serviço Indisponível";
        }).join(", ");
    };

    const getStatusBadge = (status: Appointment["status"]) => {
        const labels: Record<string, string> = {
            PENDING: "Pendente",
            CONFIRMED: "Confirmado",
            DONE: "Finalizado",
            CANCELED: "Cancelado",
            NO_SHOW: "Não Compareceu",
            BLOCKED: "Bloqueado",
        };

        const badgeStyles: Record<string, string> = {
            PENDING: "bg-amber-100 text-amber-700 border-amber-200",
            CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200",
            DONE: "bg-emerald-100 text-emerald-700 border-emerald-200",
            CANCELED: "bg-slate-100 text-slate-700 border-slate-200",
            NO_SHOW: "bg-rose-100 text-rose-700 border-rose-200",
            BLOCKED: "bg-slate-200 text-slate-600 border-slate-300",
        };

        return (
            <Badge variant="outline" className={cn("border font-medium px-2 py-0.5 text-[10px] uppercase tracking-wide", badgeStyles[status] || "bg-slate-100")}>
                {labels[status] || status}
            </Badge>
        );
    };

    // Render Appointment Card
    const renderAppointmentCard = (apt: Appointment, index: number, totalInSlot: number, slotIndex: number) => {
        const style = getCardStyle(apt.status, index);
        const topPx = getTopOffsetPx(apt.startTime);
        const heightPx = Math.max(getHeightPx(apt.durationMinutes), 40); // Mínimo de 40px

        const width = totalInSlot > 1 ? `${100 / totalInSlot}%` : '100%';
        const left = totalInSlot > 1 ? `${(slotIndex / totalInSlot) * 100}%` : '0';

        const isBeingDragged = isDragging && draggingAppointment?.id === apt.id;
        const canDrag = apt.status !== 'DONE' && apt.status !== 'CANCELED';

        const cardContent = (
            <div
                className={cn(
                    "absolute rounded-xl border border-l-[3px] p-2 transition-all duration-200 hover:z-20 group overflow-hidden pointer-events-auto",
                    canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
                    style.bg,
                    style.border,
                    style.shadow,
                    style.opacity,
                    isBeingDragged && "opacity-30 ring-2 ring-indigo-400 ring-dashed"
                )}
                style={{
                    top: `${topPx}px`,
                    height: `${heightPx}px`,
                    left: left,
                    width: `calc(${width} - 4px)`,
                    marginLeft: '2px',
                    zIndex: isBeingDragged ? 5 : 10 + slotIndex,
                    borderLeftColor: style.accent.replace("bg-", ""),
                    ...(style as any).customStyle
                }}
                onMouseDown={canDrag ? (e) => handleDragStart(e, apt) : undefined}
            >
                {/* Accent Bar Left (Visual indicator) */}
                <div className={cn("absolute left-0 top-0 bottom-0 w-[3px]", style.accent)} />

                <div className="flex flex-col h-full pl-1">
                    {apt.status === "BLOCKED" ? (
                        <div className="flex items-center justify-center h-full gap-2 opacity-60">
                            <div className="h-4 w-4 bg-slate-200 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-slate-400 rounded-sm" />
                            </div>
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Bloqueado</span>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between gap-1 w-full">
                                <span className={cn("text-[10px] font-bold opacity-70", style.text)}>
                                    {apt.startTime}
                                </span>
                                {totalInSlot === 1 && (
                                    <Avatar className="h-5 w-5 border border-white/50">
                                        <AvatarFallback className="text-[8px] bg-white/80 text-slate-700 font-bold">
                                            {getClientInitial(apt.clientId || "")}
                                        </AvatarFallback>
                                    </Avatar>
                                )}
                            </div>

                            <span className={cn("text-xs font-semibold truncate mt-0.5 leading-tight", style.text)}>
                                {getClientName(apt.clientId || "")}
                            </span>

                            <span className={cn("text-[10px] truncate opacity-80", style.text)}>
                                {getServiceNames(apt.services).split(',')[0]}
                            </span>
                        </>
                    )}
                </div>
            </div>
        );

        // If dragging, don't wrap in Popover to avoid conflicts
        if (isDragging) {
            return <div key={apt.id}>{cardContent}</div>;
        }

        return (
            <Popover key={apt.id}>
                <PopoverTrigger asChild>
                    {cardContent}
                </PopoverTrigger>

                {/* Popover Detalhes */}
                <PopoverContent className="w-80 p-0 rounded-2xl shadow-xl z-50 border-slate-100 bg-white/80 backdrop-blur-xl" align="start" sideOffset={5}>
                    {apt.status === "BLOCKED" ? (
                        /* ===== BLOCKED SLOT POPOVER ===== */
                        <div>
                            <div className="p-4 border-b border-slate-100 bg-slate-50/80">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center">
                                        <Clock className="h-6 w-6 text-slate-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-700 text-lg">Horário Bloqueado</h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Badge variant="outline" className="bg-slate-200 text-slate-600 border-slate-300 text-[10px] uppercase tracking-wide font-medium px-2 py-0.5">
                                                Bloqueado
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="px-5 py-3 space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Data</span>
                                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                            <CalendarIcon className="h-4 w-4 text-slate-400" />
                                            {format(new Date(apt.date + 'T00:00:00'), "dd/MM")}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Horário</span>
                                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                            <Clock className="h-4 w-4 text-slate-400" />
                                            {apt.startTime} - {
                                                (() => {
                                                    const [h, m] = apt.startTime.split(':').map(Number);
                                                    const endMinutes = h * 60 + m + apt.durationMinutes;
                                                    const endH = Math.floor(endMinutes / 60);
                                                    const endM = endMinutes % 60;
                                                    return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
                                                })()
                                            }
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Profissional</span>
                                    <div className="text-sm font-medium text-slate-700">
                                        {getProfessionalName(apt.professionalId)}
                                    </div>
                                </div>

                                {apt.notes && (
                                    <div className="space-y-1">
                                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Motivo</span>
                                        <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 text-sm italic text-slate-600">
                                            "{apt.notes}"
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-slate-100" />

                            <div className="px-5 py-4 space-y-2">
                                <Button
                                    variant="outline"
                                    size="default"
                                    className="w-full rounded-xl border-2 font-medium hover:bg-slate-50"
                                    onClick={() => handleEdit(apt)}
                                >
                                    <Filter className="mr-2 h-4 w-4" /> Editar Bloqueio
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="default"
                                    className="w-full rounded-xl font-medium"
                                    onClick={async () => {
                                        try {
                                            await service.delete(apt.id);
                                            toast.success("Horário desbloqueado!");
                                            fetchData();
                                        } catch (error) {
                                            console.error(error);
                                            toast.error("Erro ao desbloquear");
                                        }
                                    }}
                                >
                                    <Clock className="mr-2 h-4 w-4" /> Desbloquear Horário
                                </Button>
                            </div>
                        </div>
                    ) : (
                        /* ===== REGULAR APPOINTMENT POPOVER ===== */
                        <>
                            <div className="relative overflow-hidden p-4 pb-6">
                                {/* Background Decorativo */}
                                <div className={cn("absolute top-0 left-0 right-0 h-20 opacity-20 bg-gradient-to-b", style.accent.replace("bg-", "from-"), "to-transparent")} />

                                <div className="relative z-10 flex gap-4 items-start">
                                    <Avatar className="h-16 w-16 border-4 border-white shadow-sm">
                                        <AvatarFallback className={cn("text-xl font-bold text-white", style.accent)}>
                                            {getClientInitial(apt.clientId || "")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0 pt-1">
                                        <h4 className="font-bold text-slate-800 text-lg leading-tight truncate">
                                            {getClientName(apt.clientId || "")}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <div className="flex items-center gap-1.5 text-sm text-slate-500">
                                                <User className="h-3.5 w-3.5" />
                                                <span className="truncate">Cliente Recorrente</span>
                                            </div>
                                            {/* Status Badge */}
                                            <div className={cn(
                                                "px-2 py-0.5 text-xs font-semibold rounded-full",
                                                apt.status === "PENDING" && "bg-amber-100 text-amber-700",
                                                apt.status === "CONFIRMED" && "bg-blue-100 text-blue-700",
                                                apt.status === "DONE" && "bg-emerald-100 text-emerald-700",
                                                apt.status === "CANCELED" && "bg-slate-100 text-slate-600",
                                                apt.status === "NO_SHOW" && "bg-rose-100 text-rose-700",
                                            )}>
                                                {apt.status === "PENDING" && "Pendente"}
                                                {apt.status === "CONFIRMED" && "Confirmado"}
                                                {apt.status === "DONE" && "Finalizado"}
                                                {apt.status === "CANCELED" && "Cancelado"}
                                                {apt.status === "NO_SHOW" && "Não Compareceu"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="px-5 py-3 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Data</span>
                                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                            <CalendarIcon className="h-4 w-4 text-slate-400" />
                                            {format(new Date(apt.date + 'T00:00:00'), "dd/MM")}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Horário</span>
                                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                            <Clock className="h-4 w-4 text-slate-400" />
                                            {apt.startTime} - {
                                                (() => {
                                                    const [h, m] = apt.startTime.split(':').map(Number);
                                                    const endMinutes = h * 60 + m + apt.durationMinutes;
                                                    const endH = Math.floor(endMinutes / 60);
                                                    const endM = endMinutes % 60;
                                                    return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
                                                })()
                                            }
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                        Serviços
                                    </span>
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm font-medium text-slate-700">
                                        {getServiceNames(apt.services)}
                                    </div>
                                </div>

                                {apt.notes && (
                                    <div className="space-y-1.5">
                                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Observação</span>
                                        <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 text-sm italic text-slate-600">
                                            "{apt.notes}"
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Divider */}
                            <div className="border-t border-slate-100" />

                            {/* Status Change Section */}
                            <div className="px-5 py-3 space-y-2.5">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Alterar Status</span>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => handleUpdateStatus(apt.id, "PENDING")}
                                        className={cn(
                                            "px-3 py-1.5 text-xs font-semibold rounded-lg border-2 transition-all",
                                            apt.status === "PENDING"
                                                ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                                                : "bg-white text-amber-700 border-amber-200 hover:bg-amber-50 hover:border-amber-300"
                                        )}
                                    >
                                        Pendente
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(apt.id, "CONFIRMED")}
                                        className={cn(
                                            "px-3 py-1.5 text-xs font-semibold rounded-lg border-2 transition-all",
                                            apt.status === "CONFIRMED"
                                                ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                                                : "bg-white text-blue-700 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                                        )}
                                    >
                                        Confirmado
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(apt.id, "CANCELED")}
                                        className={cn(
                                            "px-3 py-1.5 text-xs font-semibold rounded-lg border-2 transition-all",
                                            apt.status === "CANCELED"
                                                ? "bg-slate-500 text-white border-slate-500 shadow-sm"
                                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                                        )}
                                    >
                                        Cancelado
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(apt.id, "NO_SHOW")}
                                        className={cn(
                                            "px-3 py-1.5 text-xs font-semibold rounded-lg border-2 transition-all",
                                            apt.status === "NO_SHOW"
                                                ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                                                : "bg-white text-rose-700 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
                                        )}
                                    >
                                        Não Compareceu
                                    </button>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-slate-100" />

                            {/* Action Buttons */}
                            <div className="px-5 py-4 space-y-2.5">
                                <Button
                                    size="lg"
                                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all rounded-xl h-11"
                                    onClick={() => router.push(`/appointments/${apt.id}/checkout`)}
                                >
                                    <ShoppingCart className="mr-2 h-5 w-5" /> Finalizar Atendimento
                                </Button>
                                <Button
                                    variant="outline"
                                    size="default"
                                    className="w-full rounded-xl border-2 font-medium hover:bg-slate-50"
                                    onClick={() => handleEdit(apt)}
                                >
                                    Editar Agendamento
                                </Button>
                            </div>
                        </>
                    )}
                </PopoverContent>
            </Popover>
        );
    };

    const gridCols = viewMode === "day" ? "grid-cols-[60px_1fr]" : viewMode === "week" ? "grid-cols-[60px_repeat(7,1fr)]" : "";

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
        <>
            <div className="relative h-[calc(100vh-65px)] flex flex-col p-6 overflow-hidden bg-slate-50/50">
                {/* Ambient Background - Animated Mesh Gradient */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-200/30 blur-[100px] animate-pulse" />
                    <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] rounded-full bg-blue-200/30 blur-[100px] animate-pulse delay-700" />
                    <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-indigo-200/20 blur-[120px] animate-pulse delay-1000" />
                </div>

                <div className="space-y-6 pb-4 h-full flex flex-col relative z-10">
                    {/* Header Moderno */}
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 pb-2">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 font-heading capitalize flex items-center gap-3 drop-shadow-sm">
                                {format(currentDate, "MMMM", { locale: ptBR })}
                                <span className="text-slate-400/80 font-normal">{format(currentDate, "yyyy")}</span>
                            </h1>
                            <p className="text-slate-500 font-medium ml-1">
                                Gerencie seus agendamentos com facilidade.
                            </p>
                        </div>

                        <div className="flex items-center gap-4 flex-wrap w-full xl:w-auto">
                            {/* Busca rápida */}
                            <div className="relative group md:w-64 w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <Input
                                    placeholder="Buscar cliente ou serviço..."
                                    className="pl-9 pr-4 h-11 rounded-2xl bg-white/70 backdrop-blur-md border-white/40 focus:bg-white focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm hover:bg-white/90"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* View Toggle - Pill Design */}
                            <div className="flex items-center bg-white/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/40 shadow-sm">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setViewMode("day")}
                                    className={cn(
                                        "rounded-xl h-9 px-5 font-medium transition-all duration-300",
                                        viewMode === "day" ? "bg-white text-indigo-600 shadow-md scale-105 font-bold" : "text-slate-500 hover:bg-white/40 hover:text-slate-700"
                                    )}
                                >
                                    Dia
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setViewMode("week")}
                                    className={cn(
                                        "rounded-xl h-9 px-5 font-medium transition-all duration-300",
                                        viewMode === "week" ? "bg-white text-indigo-600 shadow-md scale-105 font-bold" : "text-slate-500 hover:bg-white/40 hover:text-slate-700"
                                    )}
                                >
                                    Semana
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setViewMode("month")}
                                    className={cn(
                                        "rounded-xl h-9 px-5 font-medium transition-all duration-300",
                                        viewMode === "month" ? "bg-white text-indigo-600 shadow-md scale-105 font-bold" : "text-slate-500 hover:bg-white/40 hover:text-slate-700"
                                    )}
                                >
                                    Mês
                                </Button>
                            </div>

                            <Button
                                onClick={() => {
                                    setEditingAppointment(undefined);
                                    setSelectedSlot(null);
                                    setIsFormOpen(true);
                                }}
                                className="h-12 px-6 rounded-2xl shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold border border-white/10"
                            >
                                <Plus className="mr-2 h-5 w-5" />
                                <span className="hidden sm:inline">Novo Agendamento</span>
                                <span className="sm:hidden">Novo</span>
                            </Button>
                        </div>
                    </div>

                    {/* Calendar Container */}
                    <Card className="border border-white/40 bg-white/60 backdrop-blur-xl shadow-2xl shadow-slate-200/40 rounded-[32px] overflow-hidden flex-1 flex flex-col ring-1 ring-white/60">
                        <CardContent className="p-0 flex flex-col h-full relative">
                            {/* Subtle Grain Overlay (Optional, enhances premium feel) */}
                            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay z-0" />

                            {/* Navigation Bar */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-indigo-100/30 bg-white/40 backdrop-blur-sm relative z-10">
                                <Button variant="outline" size="sm" onClick={handleToday} className="rounded-xl border-slate-200 text-slate-600 hover:bg-white hover:text-primary font-medium px-4">
                                    Hoje
                                </Button>

                                <div className="flex items-center bg-white rounded-full border border-slate-100 shadow-sm px-1 py-0.5">
                                    <Button variant="ghost" size="icon" onClick={handlePrev} className="h-8 w-8 rounded-full hover:bg-slate-50 text-slate-400 hover:text-primary transition-colors">
                                        <ChevronLeft className="h-5 w-5" />
                                    </Button>
                                    <span className="text-sm font-semibold min-w-[220px] text-center text-slate-700 px-2 select-none uppercase tracking-wide">
                                        {getNavigationText()}
                                    </span>
                                    <Button variant="ghost" size="icon" onClick={handleNext} className="h-8 w-8 rounded-full hover:bg-slate-50 text-slate-400 hover:text-primary transition-colors">
                                        <ChevronRight className="h-5 w-5" />
                                    </Button>
                                </div>

                                <div className="w-[74px]" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-hidden relative bg-slate-50/30">
                                {/* Day/Week View */}
                                {(viewMode === "day" || viewMode === "week") && (
                                    <div className="flex flex-col h-full">
                                        {/* Week Header - Sticky */}
                                        <div className={cn("grid border-b border-slate-100 bg-white z-20 shrink-0 shadow-sm", gridCols)}>
                                            <div className="p-4 text-center border-r border-slate-50 bg-slate-50/50">
                                                <Clock className="w-5 h-5 mx-auto text-slate-300" />
                                            </div>
                                            {displayDays.map((day, idx) => {
                                                const isToday = isSameDay(day, new Date());
                                                return (
                                                    <div
                                                        key={idx}
                                                        className={cn(
                                                            "py-3 px-2 text-center border-r border-slate-50 last:border-r-0 relative transition-colors duration-300",
                                                            isToday ? "bg-primary/5" : "hover:bg-slate-50"
                                                        )}
                                                    >
                                                        {isToday && (
                                                            <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
                                                        )}
                                                        <div className={cn(
                                                            "text-[11px] font-bold uppercase tracking-widest mb-1",
                                                            isToday ? "text-primary" : "text-slate-400"
                                                        )}>
                                                            {format(day, "EEE", { locale: ptBR })}
                                                        </div>
                                                        <div className={cn(
                                                            "w-10 h-10 mx-auto flex items-center justify-center rounded-full text-lg font-bold transition-all",
                                                            isToday ? "bg-primary text-white shadow-lg shadow-primary/30 scale-110" : "text-slate-700 hover:bg-slate-100"
                                                        )}>
                                                            {format(day, "dd")}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Scrollable Grid */}
                                        <div
                                            ref={gridRef}
                                            className="overflow-y-auto flex-1 custom-scrollbar"
                                            onMouseMove={handleDragMove}
                                            onMouseUp={handleDragEnd}
                                            onMouseLeave={() => { if (isDragging) handleDragEnd(); }}
                                        >
                                            <div className="relative" style={{ height: `${TIME_SLOTS.length * (GRID_HOUR_HEIGHT / 2)}px` }}>
                                                {/* Linhas de Fundo e Horas */}
                                                {TIME_SLOTS.map((time) => {
                                                    const isFullHour = time.endsWith(":00");
                                                    return (
                                                        <div key={time} className={cn("grid group", gridCols)} style={{ height: `${GRID_HOUR_HEIGHT / 2}px` }}>
                                                            {/* Hora */}
                                                            <div className="relative border-r border-slate-100/50 bg-white">
                                                                <span className={cn(
                                                                    "absolute -top-2 right-2 px-1 z-10 transition-colors bg-white",
                                                                    isFullHour
                                                                        ? "text-[10px] font-bold text-slate-400 group-hover:text-primary"
                                                                        : "text-[9px] font-medium text-slate-300 group-hover:text-primary/70"
                                                                )}>
                                                                    {time}
                                                                </span>
                                                                <div className={cn(
                                                                    "absolute top-0 right-0 w-1.5 h-[1px]",
                                                                    isFullHour ? "bg-slate-200" : "bg-slate-100"
                                                                )} />
                                                            </div>

                                                            {/* Colunas dos Dias (Background Slots) */}
                                                            {displayDays.map((day, dayIdx) => {
                                                                const dayStr = format(day, 'yyyy-MM-dd');
                                                                const isDropTarget = isDragging && dropTarget?.date === dayStr && dropTarget?.time === time;
                                                                return (
                                                                    <div
                                                                        key={dayIdx}
                                                                        onClick={() => handleSlotClick(day, time)}
                                                                        className={cn(
                                                                            "border-r border-slate-50 last:border-r-0 relative transition-colors cursor-pointer hover:bg-slate-50",
                                                                            isFullHour ? "border-b border-b-slate-100" : "border-b border-b-slate-50 border-dashed",
                                                                            isDropTarget && "!bg-indigo-100/60 ring-1 ring-inset ring-indigo-300/50"
                                                                        )}
                                                                    />
                                                                );
                                                            })}
                                                        </div>
                                                    );
                                                })}

                                                {/* Layer de Agendamentos (Posicionamento Absoluto) */}
                                                <div className="absolute inset-0 pointer-events-none grid" style={{ gridTemplateColumns: viewMode === 'day' ? '60px 1fr' : '60px repeat(7, 1fr)' }}>
                                                    {/* Spacer para coluna de horas */}
                                                    <div />

                                                    {/* Colunas de conteúdo dos dias */}
                                                    {displayDays.map((day, dayIdx) => {
                                                        const dayAppointments = getAppointmentsForDay(day);
                                                        const isToday = isSameDay(day, new Date());

                                                        return (
                                                            <div key={dayIdx} className="relative h-full pointer-events-none">
                                                                {/* Current Time Indicator */}
                                                                {isToday && (
                                                                    <div
                                                                        className="absolute w-full border-t border-rose-500 z-50 pointer-events-none shadow-sm shadow-rose-500/10"
                                                                        style={{ top: `${getCurrentTimeOffsetPx()}px` }}
                                                                    >
                                                                        <div className="absolute -left-1 -top-[3px] w-1.5 h-1.5 bg-rose-500 rounded-full scale-125" />
                                                                    </div>
                                                                )}
                                                                {dayAppointments.map((apt, aptIdx) => {
                                                                    // Calcular largura baseada em conflitos na hora (slot)
                                                                    const conflicts = dayAppointments.filter(a => a.startTime === apt.startTime);
                                                                    const indexInSlot = conflicts.findIndex(a => a.id === apt.id);

                                                                    return renderAppointmentCard(
                                                                        apt,
                                                                        aptIdx,
                                                                        conflicts.length,
                                                                        indexInSlot !== -1 ? indexInSlot : 0
                                                                    );
                                                                })}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Month View */}
                                {viewMode === "month" && (
                                    <div className="p-6 h-full overflow-y-auto custom-scrollbar">
                                        {/* Dias da semana */}
                                        <div className="grid grid-cols-7 mb-4">
                                            {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((d) => (
                                                <div key={d} className="text-right px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                    {d}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Calendário do mês */}
                                        <div className="grid grid-cols-7 gap-3 auto-rows-fr">
                                            {/* Espaços vazios antes do primeiro dia */}
                                            {Array.from({ length: (getDay(startOfMonth(currentDate)) + 6) % 7 }).map((_, i) => (
                                                <div key={`empty-${i}`} className="min-h-[100px] p-2 rounded-xl bg-slate-50/30 border border-dashed border-slate-100" />
                                            ))}

                                            {/* Dias do mês */}
                                            {displayDays.map((day, idx) => {
                                                const dayAppointments = getAppointmentsForDay(day);
                                                const isToday = isSameDay(day, new Date());

                                                return (
                                                    <div
                                                        key={idx}
                                                        className={cn(
                                                            "min-h-[100px] p-2 rounded-xl border transition-all duration-300 group hover:shadow-lg flex flex-col gap-2",
                                                            isToday
                                                                ? "bg-white border-primary/20 shadow-xl shadow-primary/5 ring-4 ring-primary/5"
                                                                : "bg-white border-slate-100 hover:border-slate-200"
                                                        )}
                                                    >
                                                        <div className="flex justify-between items-start pl-1">
                                                            {dayAppointments.length > 0 && (
                                                                <Badge variant="secondary" className="bg-slate-100 text-[10px] text-slate-500 hover:bg-slate-200">
                                                                    {dayAppointments.length} agendamentos
                                                                </Badge>
                                                            )}
                                                            <div className={cn(
                                                                "h-8 w-8 flex items-center justify-center rounded-full text-sm font-bold ml-auto transition-all",
                                                                isToday ? "bg-primary text-white shadow-md scale-110" : "text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-700"
                                                            )}>
                                                                {format(day, "d")}
                                                            </div>
                                                        </div>

                                                        <div className="space-y-1.5 overflow-y-auto max-h-[120px] pr-1 custom-scrollbar">
                                                            {dayAppointments.map((apt, aptIdx) => {
                                                                const style = getCardStyle(apt.status, aptIdx);
                                                                return (
                                                                    <Popover key={apt.id}>
                                                                        <PopoverTrigger asChild>
                                                                            <div
                                                                                className={cn(
                                                                                    "text-[10px] px-2 py-1.5 rounded-lg truncate cursor-pointer transition-all border flex items-center gap-1.5",
                                                                                    style.bg,
                                                                                    style.text,
                                                                                    style.border,
                                                                                    "hover:brightness-95 hover:shadow-sm"
                                                                                )}
                                                                            >
                                                                                <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", style.accent)} />
                                                                                <span className="font-bold opacity-75">{apt.startTime}</span>
                                                                                <span className="truncate flex-1">{getServiceNames(apt.services).split(',')[0]}</span>
                                                                            </div>
                                                                        </PopoverTrigger>
                                                                        <PopoverContent className="w-80 p-0 rounded-2xl shadow-xl z-50 border-slate-100 bg-white/80 backdrop-blur-xl" align="start">
                                                                            {/* Reutilizando estrutura do Popover do card renderAppointmentCard ou simplificado - vou simplificar aqui para não duplicar muito código, ou poderia extrair para componente */}
                                                                            <div className="p-4 border-b border-slate-100/50 bg-slate-50/50">
                                                                                <div className="flex items-center gap-3">
                                                                                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                                                                        <AvatarFallback className={cn("text-sm font-bold text-white", style.accent)}>
                                                                                            {getClientInitial(apt.clientId || "")}
                                                                                        </AvatarFallback>
                                                                                    </Avatar>
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <div className="font-bold text-slate-800 text-sm truncate">{getClientName(apt.clientId || "")}</div>
                                                                                        <div className="text-xs text-slate-500 truncate">{getServiceNames(apt.services)}</div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="p-3 text-xs space-y-2">
                                                                                <div className="flex justify-between px-2">
                                                                                    <span className="text-slate-400 font-medium">Horário</span>
                                                                                    <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">{apt.startTime}</span>
                                                                                </div>
                                                                                <div className="flex justify-between px-2 items-center">
                                                                                    <span className="text-slate-400 font-medium">Status</span>
                                                                                    {getStatusBadge(apt.status)}
                                                                                </div>
                                                                            </div>
                                                                            <div className="p-2 border-t border-slate-100 bg-slate-50/30 flex gap-1">
                                                                                <Button size="sm" variant="outline" className="flex-1 h-8 text-xs rounded-lg" onClick={() => handleEdit(apt)}>
                                                                                    Editar
                                                                                </Button>
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
                            </div>
                        </CardContent>
                    </Card>

                    {/* Appointment Form Dialog */}
                    <AppointmentForm
                        isOpen={isFormOpen}
                        onOpenChange={setIsFormOpen}
                        initialData={editingAppointment}
                        defaultDate={selectedSlot ? selectedSlot.date : undefined}
                        defaultTime={selectedSlot?.time}
                        onSuccess={fetchData}
                    />
                </div>

            </div>

            {/* Drag Ghost - rendered via Portal at body level to avoid CSS containment issues */}
            {
                isDragging && draggingAppointment && dragGhost && dropTarget && createPortal(
                    <div
                        className="pointer-events-none"
                        style={{
                            position: 'fixed',
                            left: `${dragGhost.x + 12}px`,
                            top: `${dragGhost.y - 12}px`,
                            zIndex: 99999,
                        }}
                    >
                        <div className="w-[180px] bg-white rounded-xl border-2 border-indigo-400 shadow-2xl p-2.5" style={{ boxShadow: '0 20px 60px rgba(99,102,241,0.25)' }}>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-8 bg-indigo-500 rounded-full" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-[10px] font-bold text-indigo-600">
                                        {dropTarget.time}
                                    </div>
                                    <div className="text-xs font-semibold text-slate-700 truncate">
                                        {getClientName(draggingAppointment.clientId || "")}
                                    </div>
                                    <div className="text-[10px] text-slate-500 truncate">
                                        {getServiceNames(draggingAppointment.services).split(',')[0]}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body
                )
            }
        </>
    );
}
