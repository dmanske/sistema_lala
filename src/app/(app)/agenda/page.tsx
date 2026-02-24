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
    ShoppingCart,
    Eye,
    CheckCircle2
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
import { getAppointmentRepository, getClientRepository, getServiceRepository, getProfessionalRepository, getSaleRepository } from "@/infrastructure/repositories/factory";
import { Service } from "@/core/domain/Service";
import { Client } from "@/core/domain/Client";
import { Professional } from "@/core/domain/Professional";
import { formatName } from "@/core/formatters/name";
import { AppointmentForm } from "@/components/agenda/AppointmentForm";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";


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
// Cada STATUS tem uma COR FIXA para consistência visual
const getCardStyle = (status: string, index: number): CardStyle => {
    // PENDING = Amarelo/Amber (Aguardando confirmação)
    if (status === "PENDING") {
        return {
            bg: "bg-gradient-to-br from-amber-50 to-amber-100/80 hover:from-amber-100 hover:to-amber-200",
            border: "border-amber-200/50",
            text: "text-amber-700",
            accent: "bg-amber-500",
            shadow: "hover:shadow-amber-500/10"
        };
    }

    // CONFIRMED = Azul (Confirmado)
    if (status === "CONFIRMED") {
        return {
            bg: "bg-gradient-to-br from-blue-50 to-blue-100/80 hover:from-blue-100 hover:to-blue-200",
            border: "border-blue-200/50",
            text: "text-blue-700",
            accent: "bg-blue-500",
            shadow: "hover:shadow-blue-500/10"
        };
    }

    // DONE = Verde/Emerald (Finalizado)
    if (status === "DONE") {
        return {
            bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/80 hover:from-emerald-100 hover:to-emerald-200",
            border: "border-emerald-200/50",
            text: "text-emerald-800",
            accent: "bg-emerald-500",
            shadow: "hover:shadow-emerald-500/10"
        };
    }

    // CANCELED = Cinza (Cancelado/Apagar)
    if (status === "CANCELED") {
        return {
            bg: "bg-slate-50 hover:bg-slate-100",
            border: "border-slate-200",
            text: "text-slate-500 decoration-slate-400/50",
            accent: "bg-slate-400",
            shadow: "hover:shadow-slate-500/5",
            opacity: "opacity-70"
        };
    }

    // NO_SHOW = Vermelho/Rose (Não compareceu)
    if (status === "NO_SHOW") {
        return {
            bg: "bg-rose-50 hover:bg-rose-100",
            border: "border-rose-200",
            text: "text-rose-700",
            accent: "bg-rose-500",
            shadow: "hover:shadow-rose-500/10"
        };
    }

    // BLOCKED = Cinza com padrão listrado (Bloqueado)
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

    // Fallback: Se houver algum status desconhecido, usa azul
    return {
        bg: "bg-gradient-to-br from-blue-50 to-blue-100/80 hover:from-blue-100 hover:to-blue-200",
        border: "border-blue-200/50",
        text: "text-blue-700",
        accent: "bg-blue-500",
        shadow: "hover:shadow-blue-500/10"
    };
};

export default function AgendaPage() {
    const [currentTime, setCurrentTime] = useState<string>("");
    const [hoveredAppointmentId, setHoveredAppointmentId] = useState<string | null>(null);
    const hoverTimeoutRef = useRef<any>(null);

    useEffect(() => {
        const updateTime = () => setCurrentTime(format(new Date(), 'HH:mm'));
        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => {
            clearInterval(interval);
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        };
    }, []);
    const [viewMode, setViewMode] = useState<"day" | "week" | "month" | "day-compact" | "week-compact">("week");
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
    const [paidAppointments, setPaidAppointments] = useState<Set<string>>(new Set());
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [appointmentIdToDelete, setAppointmentIdToDelete] = useState<string | null>(null);
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
    const saleRepo = getSaleRepository();

    // Calcular range de datas baseado no viewMode
    const dateRange = useMemo(() => {
        if (viewMode === "day" || viewMode === "day-compact") {
            return { start: currentDate, end: currentDate };
        } else if (viewMode === "week" || viewMode === "week-compact") {
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
        if (viewMode === "day" || viewMode === "day-compact") {
            return [currentDate];
        } else if (viewMode === "week" || viewMode === "week-compact") {
            const start = startOfWeek(currentDate, { weekStartsOn: 1 });
            return eachDayOfInterval({ start, end: addDays(start, 6) });
        } else {
            return eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) });
        }
    }, [currentDate, viewMode]);

    const fetchData = async (signal?: AbortSignal) => {
        console.log('[AGENDA] 🔄 Iniciando fetchData...', {
            dateRange: { start: format(dateRange.start, 'yyyy-MM-dd'), end: format(dateRange.end, 'yyyy-MM-dd') },
            viewMode,
            timestamp: new Date().toISOString()
        });
        
        setIsLoading(true);
        try {
            console.log('[AGENDA] 📡 Buscando dados em paralelo...');
            const startTime = performance.now();
            
            // Timeout de 15 segundos para cada query (mais realista para conexões lentas)
            const withTimeout = <T,>(promise: Promise<T>, timeoutMs = 15000): Promise<T> => {
                return Promise.race([
                    promise,
                    new Promise<T>((_, reject) => 
                        setTimeout(() => reject(new Error(`Timeout após ${timeoutMs}ms`)), timeoutMs)
                    )
                ]);
            };
            
            const [appointmentsData, clientsData, servicesData, professionalsData] = await Promise.all([
                withTimeout(service.getAll({
                    startDate: format(dateRange.start, 'yyyy-MM-dd'),
                    endDate: format(dateRange.end, 'yyyy-MM-dd')
                })),
                withTimeout(clientRepo.getAll()),
                withTimeout(serviceRepo.getAll()),
                withTimeout(professionalRepo.getAll())
            ]);
            
            // Verificar se foi cancelado
            if (signal?.aborted) {
                console.log('[AGENDA] ⚠️ fetchData cancelado (componente desmontado)');
                return;
            }
            
            const fetchTime = performance.now() - startTime;
            console.log('[AGENDA] ✅ Dados básicos carregados', {
                appointments: appointmentsData.length,
                clients: clientsData.length,
                services: servicesData.length,
                professionals: professionalsData.length,
                timeMs: fetchTime.toFixed(2)
            });
            
            setAppointments(appointmentsData);
            setClients(clientsData);
            setServices(servicesData);
            setProfessionals(professionalsData);

            // Otimização: Buscar todas as vendas pagas de uma vez
            console.log('[AGENDA] 💰 Buscando vendas pagas...');
            const salesStartTime = performance.now();
            const paidSet = new Set<string>();
            if (appointmentsData.length > 0) {
                try {
                    const appointmentIds = appointmentsData.map(apt => apt.id);
                    console.log('[AGENDA] 📊 Buscando vendas para', appointmentIds.length, 'agendamentos');
                    const sales = await withTimeout(saleRepo.findByAppointmentIds(appointmentIds));
                    
                    if (signal?.aborted) {
                        console.log('[AGENDA] ⚠️ Busca de vendas cancelada');
                        return;
                    }
                    
                    const salesTime = performance.now() - salesStartTime;
                    console.log('[AGENDA] ✅ Vendas carregadas', {
                        total: sales.length,
                        paid: sales.filter(s => s.status === 'paid').length,
                        timeMs: salesTime.toFixed(2)
                    });
                    sales.filter(sale => sale.status === 'paid').forEach(sale => {
                        if (sale.appointmentId) {
                            paidSet.add(sale.appointmentId);
                        }
                    });
                } catch (error) {
                    console.error('[AGENDA] ❌ Erro ao buscar vendas:', error);
                }
            }
            setPaidAppointments(paidSet);
            
            const totalTime = performance.now() - startTime;
            console.log('[AGENDA] 🎉 fetchData concluído!', {
                totalTimeMs: totalTime.toFixed(2),
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            // Ignorar erros de abort
            if (error instanceof Error && error.name === 'AbortError') {
                console.log('[AGENDA] ⚠️ Query abortada');
                return;
            }
            console.error('[AGENDA] ❌ Erro fatal em fetchData:', error);
            toast.error('Erro ao carregar agenda: ' + (error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        console.log('[AGENDA] 🔄 useEffect triggered', {
            currentDate: format(currentDate, 'yyyy-MM-dd'),
            viewMode,
            timestamp: new Date().toISOString()
        });
        
        // AbortController para cancelar queries ao desmontar ou mudar deps
        const abortController = new AbortController();
        fetchData(abortController.signal);
        
        // Cleanup: cancelar queries pendentes
        return () => {
            console.log('[AGENDA] 🧹 Limpando queries pendentes...');
            abortController.abort();
        };
    }, [currentDate, viewMode]);

    // Navegação
    const handlePrev = () => {
        if (viewMode === "day" || viewMode === "day-compact") {
            setCurrentDate(addDays(currentDate, -1));
        } else if (viewMode === "week" || viewMode === "week-compact") {
            setCurrentDate(subWeeks(currentDate, 1));
        } else {
            setCurrentDate(subMonths(currentDate, 1));
        }
    };

    const handleNext = () => {
        if (viewMode === "day" || viewMode === "day-compact") {
            setCurrentDate(addDays(currentDate, 1));
        } else if (viewMode === "week" || viewMode === "week-compact") {
            setCurrentDate(addWeeks(currentDate, 1));
        } else {
            setCurrentDate(addMonths(currentDate, 1));
        }
    };

    const handleToday = () => setCurrentDate(new Date());

    const handleUpdateStatus = async (id: string, status: Appointment["status"]) => {
        if (status === "CANCELED") {
            setAppointmentIdToDelete(id);
            setIsDeleteDialogOpen(true);
            return;
        }

        try {
            await service.updateStatus(id, status);
            toast.success("Status atualizado!");
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao atualizar status");
        }
    };

    const handleDeleteAppointment = async () => {
        if (!appointmentIdToDelete) return;

        try {
            await service.delete(appointmentIdToDelete);
            toast.success("Agendamento apagado com sucesso!");
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao apagar agendamento");
        } finally {
            setIsDeleteDialogOpen(false);
            setAppointmentIdToDelete(null);
            setHoveredAppointmentId(null);
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

    // Auto-scroll para mostrar horário de trabalho (8h-18h) na primeira visualização
    useEffect(() => {
        if (!gridRef.current) return;

        // Apenas aplicar scroll nos modos day e week (não nos compactos que já mostram tudo)
        if (viewMode === "day-compact" || viewMode === "week-compact") return;

        // Scroll para começar às 8h (horário de trabalho)
        const START_HOUR = 5;
        const TARGET_HOUR = 8; // 8h00
        const GRID_HOUR_HEIGHT = 55;

        // Cada hora tem 2 slots de 30min, então altura por hora = GRID_HOUR_HEIGHT
        const scrollPosition = (TARGET_HOUR - START_HOUR) * GRID_HOUR_HEIGHT;

        // Usar setTimeout maior para garantir que o DOM foi completamente renderizado
        const timer = setTimeout(() => {
            if (gridRef.current) {
                gridRef.current.scrollTop = scrollPosition;
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [viewMode, currentDate, appointments.length]);

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
    const GRID_HOUR_HEIGHT = 55; // Altura fixa por hora em pixels (reduzido para mostrar mais horas)
    const GRID_HOUR_HEIGHT_COMPACT = 25; // Altura compacta para visualização completa (ainda menor para caber em telas menores)
    const START_HOUR = 5; // Hora inicial do grid

    const getTopOffsetPx = (startTime: string): number => {
        const [h, m] = startTime.split(':').map(Number);
        const totalMinutesFromStart = (h - START_HOUR) * 60 + m;
        const heightPerHour = (viewMode === "day-compact" || viewMode === "week-compact") ? GRID_HOUR_HEIGHT_COMPACT : GRID_HOUR_HEIGHT;
        return (totalMinutesFromStart / 60) * heightPerHour;
    };

    const getCurrentTimeOffsetPx = (): number => {
        const now = new Date();
        const minutes = (now.getHours() - START_HOUR) * 60 + now.getMinutes();
        const heightPerHour = (viewMode === "day-compact" || viewMode === "week-compact") ? GRID_HOUR_HEIGHT_COMPACT : GRID_HOUR_HEIGHT;
        return (minutes / 60) * heightPerHour;
    };

    const getHeightPx = (durationMinutes: number): number => {
        const heightPerHour = (viewMode === "day-compact" || viewMode === "week-compact") ? GRID_HOUR_HEIGHT_COMPACT : GRID_HOUR_HEIGHT;
        return (durationMinutes / 60) * heightPerHour;
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

    const getClientPhoto = (clientId: string) => {
        if (!clientId) return undefined;
        const client = clients.find(c => c.id === clientId);
        return client?.photoUrl;
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
            CANCELED: "Apagar",
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
        const isCompactMode = viewMode === "day-compact" || viewMode === "week-compact";
        const minHeight = isCompactMode ? 15 : 50; // Ajustado para 15px no modo compacto
        const heightPx = Math.max(getHeightPx(apt.durationMinutes), minHeight);

        const width = totalInSlot > 1 ? `${100 / totalInSlot}%` : '100%';
        const left = totalInSlot > 1 ? `${(slotIndex / totalInSlot) * 100}%` : '0';

        const isBeingDragged = isDragging && draggingAppointment?.id === apt.id;
        const canDrag = apt.status !== 'DONE' && apt.status !== 'CANCELED';

        const cardContent = (
            <div
                className={cn(
                    "absolute rounded-xl border border-l-[3px] transition-all duration-200 hover:z-20 group overflow-hidden pointer-events-auto",
                    canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
                    style.bg,
                    style.border,
                    style.shadow,
                    style.opacity,
                    isBeingDragged && "opacity-30 ring-2 ring-indigo-400 ring-dashed",
                    isCompactMode ? "p-1" : "p-2"
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
                onMouseEnter={() => {
                    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                    setHoveredAppointmentId(apt.id);
                }}
                onMouseLeave={() => {
                    hoverTimeoutRef.current = setTimeout(() => {
                        setHoveredAppointmentId(null);
                    }, 200);
                }}
            >
                {/* Accent Bar Left (Visual indicator) */}
                <div className={cn("absolute left-0 top-0 bottom-0", isCompactMode ? "w-[2px]" : "w-[3px]", style.accent)} />

                {/* Paid Indicator - Discrete checkmark in top-right corner */}
                {paidAppointments.has(apt.id) && apt.status !== "BLOCKED" && (
                    <div className="absolute top-1 right-1 z-10">
                        <CheckCircle2 className={cn(
                            "text-emerald-600 drop-shadow-sm",
                            isCompactMode ? "h-3 w-3" : "h-3.5 w-3.5"
                        )} />
                    </div>
                )}

                <div className={cn("flex flex-col h-full justify-center", isCompactMode ? "pl-0.5 gap-0" : "pl-1 gap-0.5")}>
                    {apt.status === "BLOCKED" ? (
                        <div className={cn("flex items-center justify-center h-full gap-2 opacity-60", isCompactMode && "gap-1")}>
                            <div className={cn("bg-slate-200 rounded-full flex items-center justify-center", isCompactMode ? "h-3 w-3" : "h-4 w-4")}>
                                <div className={cn("bg-slate-400 rounded-sm", isCompactMode ? "w-1.5 h-1.5" : "w-2 h-2")} />
                            </div>
                            <span className={cn("font-semibold text-slate-500 uppercase tracking-widest", isCompactMode ? "text-[8px]" : "text-[10px]")}>
                                {isCompactMode ? "Bloq" : "Bloqueado"}
                            </span>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-2 w-full">
                                <span className={cn("font-bold opacity-70 shrink-0", style.text, isCompactMode ? "text-[8px]" : "text-[11px]")}>
                                    {apt.startTime}
                                </span>
                                <span className={cn("font-semibold truncate leading-tight flex-1", style.text, isCompactMode ? "text-[9px]" : "text-sm")}>
                                    {isCompactMode ? getClientName(apt.clientId || "").split(' ')[0] : getClientName(apt.clientId || "")}
                                </span>
                                {totalInSlot === 1 && !isCompactMode && (
                                    <Avatar className="border border-white/50 shrink-0 h-6 w-6">
                                        <AvatarImage src={getClientPhoto(apt.clientId || "")} alt={getClientName(apt.clientId || "")} />
                                        <AvatarFallback className="bg-white/80 text-slate-700 font-bold text-[9px]">
                                            {getClientInitial(apt.clientId || "")}
                                        </AvatarFallback>
                                    </Avatar>
                                )}
                            </div>

                            <span className={cn("truncate opacity-80 leading-tight", style.text, isCompactMode ? "text-[8px]" : "text-[11px]")}>
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
            <Popover key={apt.id} open={hoveredAppointmentId === apt.id} onOpenChange={(open) => {
                if (!open) setHoveredAppointmentId(null);
            }}>
                <PopoverTrigger asChild>
                    {cardContent}
                </PopoverTrigger>

                {/* Popover Detalhes */}
                <PopoverContent
                    className="w-80 p-0 rounded-2xl shadow-xl z-50 border-slate-100 bg-white/80 backdrop-blur-xl"
                    align="start"
                    sideOffset={5}
                    onMouseEnter={() => {
                        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                    }}
                    onMouseLeave={() => {
                        hoverTimeoutRef.current = setTimeout(() => {
                            setHoveredAppointmentId(null);
                        }, 200);
                    }}
                >
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
                                        <AvatarImage src={getClientPhoto(apt.clientId || "")} alt={getClientName(apt.clientId || "")} />
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
                                                apt.status === "CANCELED" && "bg-rose-100 text-rose-600",
                                                apt.status === "NO_SHOW" && "bg-rose-100 text-rose-700",
                                            )}>
                                                {apt.status === "PENDING" && "Pendente"}
                                                {apt.status === "CONFIRMED" && "Confirmado"}
                                                {apt.status === "DONE" && "Finalizado"}
                                                {apt.status === "CANCELED" && "Apagar"}
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
                                            "bg-white text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
                                        )}
                                    >
                                        Apagar
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
                                {paidAppointments.has(apt.id) ? (
                                    // Agendamento já pago - mostrar botão para ver pagamento
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="w-full border-2 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-xl h-11"
                                        onClick={() => router.push(`/appointments/${apt.id}/checkout`)}
                                    >
                                        <Eye className="mr-2 h-5 w-5" /> Ver Pagamento
                                    </Button>
                                ) : (
                                    // Agendamento não pago - mostrar botão para finalizar
                                    <Button
                                        size="lg"
                                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all rounded-xl h-11"
                                        onClick={() => router.push(`/appointments/${apt.id}/checkout`)}
                                    >
                                        <ShoppingCart className="mr-2 h-5 w-5" /> Finalizar Atendimento
                                    </Button>
                                )}
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

    const gridCols = (viewMode === "day" || viewMode === "day-compact") ? "grid-cols-[60px_1fr]" : (viewMode === "week" || viewMode === "week-compact") ? "grid-cols-[60px_repeat(7,1fr)]" : "";

    const getNavigationText = () => {
        if (viewMode === "day" || viewMode === "day-compact") {
            return format(currentDate, "dd 'de' MMMM, yyyy", { locale: ptBR });
        } else if (viewMode === "week" || viewMode === "week-compact") {
            const start = startOfWeek(currentDate, { weekStartsOn: 1 });
            return `${format(start, "dd/MM")} - ${format(addDays(start, 6), "dd/MM/yyyy")}`;
        } else {
            return format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
        }
    };

    return (
        <>
            <div className="relative h-[calc(100vh-65px)] flex flex-col p-2 overflow-hidden bg-slate-50/50">
                {/* Ambient Background - Animated Mesh Gradient */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-200/30 blur-[100px] animate-pulse" />
                    <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] rounded-full bg-blue-200/30 blur-[100px] animate-pulse delay-700" />
                    <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-indigo-200/20 blur-[120px] animate-pulse delay-1000" />
                </div>

                <div className="space-y-3 pb-2 h-full flex flex-col relative z-10">
                    {/* Header Moderno - Compacto */}
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3 pb-1">
                        <div className="flex flex-col gap-0.5">
                            <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 font-heading capitalize flex items-center gap-2 drop-shadow-sm">
                                {format(currentDate, "MMMM", { locale: ptBR })}
                                <span className="text-slate-400/80 font-normal text-xl">{format(currentDate, "yyyy")}</span>
                            </h1>
                            <p className="text-slate-500 font-medium text-xs ml-1">
                                Gerencie seus agendamentos com facilidade.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap w-full xl:w-auto">
                            {/* Busca rápida */}
                            <div className="relative group md:w-56 w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <Input
                                    placeholder="Buscar cliente ou serviço..."
                                    className="pl-9 pr-3 h-9 text-sm rounded-xl bg-white/70 backdrop-blur-md border-white/40 focus:bg-white focus:border-indigo-500/30 focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-sm hover:bg-white/90"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* View Toggle - Pill Design */}
                            <div className="flex items-center bg-white/40 backdrop-blur-md p-1 rounded-xl border border-white/40 shadow-sm">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setViewMode("day")}
                                    className={cn(
                                        "rounded-lg h-7 px-3 text-xs font-medium transition-all duration-300",
                                        viewMode === "day" ? "bg-white text-indigo-600 shadow-md scale-105 font-bold" : "text-slate-500 hover:bg-white/40 hover:text-slate-700"
                                    )}
                                >
                                    Dia
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setViewMode("day-compact")}
                                    className={cn(
                                        "rounded-lg h-7 px-2 text-[10px] font-medium transition-all duration-300",
                                        viewMode === "day-compact" ? "bg-white text-indigo-600 shadow-md scale-105 font-bold" : "text-slate-500 hover:bg-white/40 hover:text-slate-700"
                                    )}
                                >
                                    Dia Full
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setViewMode("week")}
                                    className={cn(
                                        "rounded-lg h-7 px-3 text-xs font-medium transition-all duration-300",
                                        viewMode === "week" ? "bg-white text-indigo-600 shadow-md scale-105 font-bold" : "text-slate-500 hover:bg-white/40 hover:text-slate-700"
                                    )}
                                >
                                    Semana
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setViewMode("week-compact")}
                                    className={cn(
                                        "rounded-lg h-7 px-2 text-[10px] font-medium transition-all duration-300",
                                        viewMode === "week-compact" ? "bg-white text-indigo-600 shadow-md scale-105 font-bold" : "text-slate-500 hover:bg-white/40 hover:text-slate-700"
                                    )}
                                >
                                    Semana Full
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setViewMode("month")}
                                    className={cn(
                                        "rounded-lg h-7 px-3 text-xs font-medium transition-all duration-300",
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
                                className="h-9 px-4 text-sm rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold border border-white/10"
                            >
                                <Plus className="mr-1.5 h-4 w-4" />
                                <span className="hidden sm:inline">Novo Agendamento</span>
                                <span className="sm:hidden">Novo</span>
                            </Button>
                        </div>
                    </div>

                    {/* Calendar Container */}
                    <Card className="border border-white/40 bg-white/60 backdrop-blur-xl shadow-2xl shadow-slate-200/40 rounded-2xl overflow-hidden flex-1 flex flex-col ring-1 ring-white/60">
                        <CardContent className="p-0 flex flex-col h-full relative">
                            {/* Subtle Grain Overlay (Optional, enhances premium feel) */}
                            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay z-0" />

                            {/* Navigation Bar - Compacta */}
                            <div className="flex items-center justify-between px-4 py-2 border-b border-indigo-100/30 bg-white/40 backdrop-blur-sm relative z-10">
                                <Button variant="outline" size="sm" onClick={handleToday} className="rounded-lg border-slate-200 text-slate-600 hover:bg-white hover:text-primary font-medium px-3 h-7 text-xs">
                                    Hoje
                                </Button>

                                <div className="flex items-center bg-white rounded-full border border-slate-100 shadow-sm px-0.5 py-0.5">
                                    <Button variant="ghost" size="icon" onClick={handlePrev} className="h-6 w-6 rounded-full hover:bg-slate-50 text-slate-400 hover:text-primary transition-colors">
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="text-xs font-semibold min-w-[180px] text-center text-slate-700 px-2 select-none uppercase tracking-wide">
                                        {getNavigationText()}
                                    </span>
                                    <Button variant="ghost" size="icon" onClick={handleNext} className="h-6 w-6 rounded-full hover:bg-slate-50 text-slate-400 hover:text-primary transition-colors">
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="w-[60px]" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-hidden relative bg-slate-50/30">
                                {/* Day/Week View */}
                                {(viewMode === "day" || viewMode === "week" || viewMode === "day-compact" || viewMode === "week-compact") && (
                                    <div className="flex flex-col h-full">
                                        {/* Week Header - Sticky - Compacto */}
                                        <div className={cn("grid border-b border-slate-100 bg-white z-20 shrink-0 shadow-sm", gridCols)}>
                                            <div className="p-1 text-center border-r border-slate-50 bg-slate-50/50">
                                                <Clock className="w-3 h-3 mx-auto text-slate-300" />
                                            </div>
                                            {displayDays.map((day, idx) => {
                                                const isToday = isSameDay(day, new Date());
                                                return (
                                                    <div
                                                        key={idx}
                                                        className={cn(
                                                            "py-1 px-1 text-center border-r border-slate-50 last:border-r-0 relative transition-colors duration-300",
                                                            isToday ? "bg-primary/5" : "hover:bg-slate-50"
                                                        )}
                                                    >
                                                        {isToday && (
                                                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />
                                                        )}
                                                        <div className={cn(
                                                            "text-[9px] font-bold uppercase tracking-wider mb-0.5",
                                                            isToday ? "text-primary" : "text-slate-400"
                                                        )}>
                                                            {format(day, "EEE", { locale: ptBR })}
                                                        </div>
                                                        <div className={cn(
                                                            "w-6 h-6 mx-auto flex items-center justify-center rounded-full text-xs font-bold transition-all",
                                                            isToday ? "bg-primary text-white shadow-md shadow-primary/30 scale-105" : "text-slate-700 hover:bg-slate-100"
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
                                            className={cn(
                                                "flex-1 overflow-y-auto custom-scrollbar"
                                            )}
                                            style={{
                                                scrollbarWidth: 'thin',
                                                scrollbarColor: 'rgba(100, 116, 139, 0.6) rgba(241, 245, 249, 0.5)'
                                            }}
                                            onMouseMove={handleDragMove}
                                            onMouseUp={handleDragEnd}
                                            onMouseLeave={() => { if (isDragging) handleDragEnd(); }}
                                        >
                                            <div className="relative" style={{
                                                height: `${TIME_SLOTS.length * ((viewMode === "day-compact" || viewMode === "week-compact") ? GRID_HOUR_HEIGHT_COMPACT / 2 : GRID_HOUR_HEIGHT / 2)}px`
                                            }}>
                                                {/* Linhas de Fundo e Horas */}
                                                {TIME_SLOTS.map((time) => {
                                                    const isFullHour = time.endsWith(":00");
                                                    const heightPerSlot = (viewMode === "day-compact" || viewMode === "week-compact") ? GRID_HOUR_HEIGHT_COMPACT / 2 : GRID_HOUR_HEIGHT / 2;
                                                    return (
                                                        <div key={time} className={cn("grid group", gridCols)} style={{ height: `${heightPerSlot}px` }}>
                                                            {/* Hora */}
                                                            <div className="relative border-r border-slate-100/50 bg-white flex items-start pt-1">
                                                                <span className={cn(
                                                                    "right-2 px-1 z-10 transition-colors bg-white ml-auto",
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
                                                <div className="absolute inset-0 pointer-events-none grid" style={{
                                                    gridTemplateColumns: (viewMode === 'day' || viewMode === 'day-compact') ? '60px 1fr' : '60px repeat(7, 1fr)'
                                                }}>
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
                                                                                    "text-[10px] px-2 py-1.5 rounded-lg truncate cursor-pointer transition-all border flex items-center gap-1.5 relative",
                                                                                    style.bg,
                                                                                    style.text,
                                                                                    style.border,
                                                                                    "hover:brightness-95 hover:shadow-sm"
                                                                                )}
                                                                            >
                                                                                <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", style.accent)} />
                                                                                <span className="font-bold opacity-75">{apt.startTime}</span>
                                                                                <span className="truncate flex-1">{getServiceNames(apt.services).split(',')[0]}</span>
                                                                                {paidAppointments.has(apt.id) && apt.status !== "BLOCKED" && (
                                                                                    <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600 shrink-0" />
                                                                                )}
                                                                            </div>
                                                                        </PopoverTrigger>
                                                                        <PopoverContent className="w-80 p-0 rounded-2xl shadow-xl z-50 border-slate-100 bg-white/80 backdrop-blur-xl" align="start">
                                                                            {/* Reutilizando estrutura do Popover do card renderAppointmentCard ou simplificado - vou simplificar aqui para não duplicar muito código, ou poderia extrair para componente */}
                                                                            <div className="p-4 border-b border-slate-100/50 bg-slate-50/50">
                                                                                <div className="flex items-center gap-3">
                                                                                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                                                                        <AvatarImage src={getClientPhoto(apt.clientId || "")} alt={getClientName(apt.clientId || "")} />
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

                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl font-bold text-slate-800">Confirmar exclusão?</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-600 mt-2">
                                Esta ação não pode ser desfeita. O agendamento será removido permanentemente da agenda.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-6">
                            <AlertDialogCancel className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50">
                                Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteAppointment}
                                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-200 border-none px-6"
                            >
                                Sim, Apagar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
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
