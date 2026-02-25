"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Plus,
    Search,
    Filter,
    LayoutList,
    LayoutGrid,
    Phone,
    MessageCircle,
    MapPin,
    Calendar,
    CreditCard,
    Check,
    Clock,
    Mail,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    History,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Client } from "@/core/domain/Client";
import { Appointment } from "@/core/domain/Appointment";
import { ClientService } from "@/core/services/ClientService";
import { getClientRepository, getAppointmentRepository } from "@/infrastructure/repositories/factory";
import { formatName } from "@/core/formatters/name";
import { formatPhone } from "@/core/formatters/phone";
import { formatDate } from "@/core/formatters/date";

export default function ClientsPage() {
    const router = useRouter(); // Hook needed for navigation
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [viewMode, setViewMode] = useState<"table" | "grid">("grid");
    const [currentPage, setCurrentPage] = useState(1);
    const [clientStats, setClientStats] = useState<Record<string, { lastVisit?: Date, nextAppointment?: Date }>>({});
    const ITEMS_PER_PAGE = 30;

    const repo = getClientRepository();
    const service = new ClientService(repo);
    // Add repo for fetching stats
    const appointmentRepo = getAppointmentRepository();

    useEffect(() => {
        const fetchClients = async () => {
            setIsLoading(true);
            try {
                const data = await service.getAll({
                    search: search || undefined,
                    status: statusFilter === "ALL" ? undefined : statusFilter
                });
                // Ordenar alfabeticamente por nome
                const sortedData = data.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
                setClients(sortedData);
            } catch (error) {
                console.error("Failed to fetch clients", error);
            } finally {
                setIsLoading(false);
            }
        };

        // Debounce search
        const timer = setTimeout(() => {
            fetchClients();
        }, 300);

        return () => clearTimeout(timer);
    }, [search, statusFilter]);

    // Reset pagination when search or filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter]);

    const totalPages = Math.ceil(clients.length / ITEMS_PER_PAGE);
    const paginatedClients = clients.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Fetch stats for paginated clients
    useEffect(() => {
        const fetchStats = async () => {
            const stats: Record<string, { lastVisit?: Date, nextAppointment?: Date }> = {};

            await Promise.all(paginatedClients.map(async (client) => {
                try {
                    const appointments = await appointmentRepo.getAll({ clientId: client.id });

                    // Filter and sort
                    const now = new Date();
                    now.setHours(0, 0, 0, 0);

                    // Last Visit: Status DONE, Date < Now (or just DONE generally, assuming past)
                    // Actually usually 'DONE' implies past. But let's check date too.
                    const pastAppointments = appointments
                        .filter((a: Appointment) => a.status === 'DONE' && new Date(a.date + 'T' + a.startTime) < new Date())
                        .sort((a: Appointment, b: Appointment) => new Date(b.date + 'T' + b.startTime).getTime() - new Date(a.date + 'T' + a.startTime).getTime());

                    // Next Appointment: Status NOT canceled/blocked/done, Date >= Now
                    const futureAppointments = appointments
                        .filter((a: Appointment) => ['PENDING', 'CONFIRMED'].includes(a.status) && new Date(a.date + 'T' + a.startTime) >= now)
                        .sort((a: Appointment, b: Appointment) => new Date(a.date + 'T' + a.startTime).getTime() - new Date(b.date + 'T' + b.startTime).getTime());

                    stats[client.id] = {
                        lastVisit: pastAppointments[0] ? new Date(pastAppointments[0].date + 'T' + pastAppointments[0].startTime) : undefined,
                        nextAppointment: futureAppointments[0] ? new Date(futureAppointments[0].date + 'T' + futureAppointments[0].startTime) : undefined
                    };
                } catch (e) {
                    console.error(`Failed to fetch stats for client ${client.id}`, e);
                }
            }));

            setClientStats(prev => ({ ...prev, ...stats }));
        };

        if (paginatedClients.length > 0) {
            fetchStats();
        }
    }, [paginatedClients.map(c => c.id).join(',')]); // Depend on IDs to avoid loops if objects change ref

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "ACTIVE":
                return <Badge className="bg-green-500 hover:bg-green-600">Ativo</Badge>;
            case "INACTIVE":
                return <Badge variant="secondary">Inativo</Badge>;
            case "ATTENTION":
                return <Badge variant="destructive">Atenção</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    return (
        <div className="space-y-6">
            <div className="hidden md:flex justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">Clientes</h1>
                    <p className="text-muted-foreground">
                        Gerencie sua base de clientes.
                    </p>
                </div>
                <Button asChild className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                    <Link href="/clients/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Cliente
                    </Link>
                </Button>
            </div>

            <div className="bg-card/50 backdrop-blur-xl p-4 sm:p-6 rounded-2xl border border-white/20 shadow-lg shadow-purple-500/5 flex flex-col md:flex-row gap-4 items-stretch md:items-center transition-all hover:shadow-purple-500/10">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome ou telefone..."
                        className="pl-9 bg-white/40 border-white/20 focus:bg-white/60 rounded-xl h-11 md:h-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex flex-row gap-3 items-center">
                    <div className="flex-1 md:w-[200px]">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="bg-white/40 border-white/20 focus:ring-primary/20 h-11 md:h-10 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-primary/70" />
                                    <SelectValue placeholder="Status" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Todos os status</SelectItem>
                                <SelectItem value="ACTIVE">Ativo</SelectItem>
                                <SelectItem value="INACTIVE">Inativo</SelectItem>
                                <SelectItem value="ATTENTION">Atenção</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="hidden sm:flex items-center gap-1 bg-white/40 border border-white/20 p-1 rounded-xl h-11 md:h-10">
                        <Button
                            variant={viewMode === "table" ? "secondary" : "ghost"}
                            size="icon"
                            onClick={() => setViewMode("table")}
                            className={`h-8 w-8 rounded-lg ${viewMode === "table" ? "bg-white shadow-sm" : ""}`}
                        >
                            <LayoutList className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === "grid" ? "secondary" : "ghost"}
                            size="icon"
                            onClick={() => setViewMode("grid")}
                            className={`h-8 w-8 rounded-lg ${viewMode === "grid" ? "bg-white shadow-sm" : ""}`}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className={cn(
                "rounded-2xl border border-white/20 bg-card/40 backdrop-blur-xl shadow-lg shadow-purple-500/5 overflow-hidden transition-all",
                viewMode === "table" ? "block hidden md:block" : "hidden"
            )}>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-white/10">
                                <TableHead className="font-heading font-semibold text-primary/80">
                                    <div className="flex items-center gap-1">
                                        Nome
                                        <span className="text-xs text-muted-foreground">(A-Z)</span>
                                    </div>
                                </TableHead>
                                <TableHead className="font-heading font-semibold text-primary/80">Telefone / WhatsApp</TableHead>
                                <TableHead className="font-heading font-semibold text-primary/80">Última Visita</TableHead>
                                <TableHead className="font-heading font-semibold text-primary/80 text-center">Próx. Agendamento</TableHead>
                                <TableHead className="font-heading font-semibold text-primary/80 text-right">Saldo</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="border-white/10">
                                        <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                                    </TableRow>
                                ))
                            ) : paginatedClients.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground border-white/10">
                                        Nenhum cliente encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedClients.map((client) => {
                                    const stats = clientStats[client.id] || {};
                                    const daysSinceLastVisit = stats.lastVisit ? Math.floor((new Date().getTime() - stats.lastVisit.getTime()) / (1000 * 60 * 60 * 24)) : null;
                                    const isInactive = daysSinceLastVisit && daysSinceLastVisit > 60;
                                    
                                    return (
                                        <TableRow
                                            key={client.id}
                                            className="cursor-pointer group hover:bg-white/60 border-white/10 transition-all relative"
                                            onClick={() => router.push(`/clients/${client.id}`)}
                                        >
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-primary/10">
                                                            <AvatarImage src={client.photoUrl} alt={client.name} />
                                                            <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold">
                                                                {getInitials(client.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className={cn(
                                                            "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white shadow-sm",
                                                            client.status === 'ACTIVE' ? 'bg-green-500' :
                                                            client.status === 'ATTENTION' ? 'bg-orange-500' : 'bg-gray-400'
                                                        )} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-slate-900 group-hover:text-primary transition-colors">
                                                            {formatName(client.name)}
                                                        </span>
                                                        {isInactive && (
                                                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[9px] font-bold w-fit mt-0.5">
                                                                Inativo há {daysSinceLastVisit}d
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    {(client.phone || client.whatsapp) ? (
                                                        <>
                                                            {client.whatsapp && (
                                                                <div className="flex items-center gap-1.5">
                                                                    <MessageCircle className="h-3.5 w-3.5 text-green-600" />
                                                                    <span className="font-medium text-sm">{formatPhone(client.whatsapp)}</span>
                                                                </div>
                                                            )}
                                                            {client.phone && client.phone !== client.whatsapp && (
                                                                <div className="flex items-center gap-1.5">
                                                                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                                                                    <span className="text-xs text-muted-foreground">{formatPhone(client.phone)}</span>
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : <span className="text-muted-foreground text-sm">-</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {stats.lastVisit ? (
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-slate-700 text-sm">
                                                            {format(stats.lastVisit, 'dd/MM/yyyy')}
                                                        </span>
                                                        {daysSinceLastVisit !== null && (
                                                            <span className={cn(
                                                                "text-xs font-medium",
                                                                daysSinceLastVisit > 60 ? "text-amber-600" :
                                                                daysSinceLastVisit > 30 ? "text-orange-500" :
                                                                "text-slate-500"
                                                            )}>
                                                                {daysSinceLastVisit}d atrás
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">Nunca</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {stats.nextAppointment ? (
                                                    <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 font-semibold">
                                                        <Calendar className="h-3 w-3 mr-1" />
                                                        {format(stats.nextAppointment, 'dd/MM HH:mm')}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {client.creditBalance !== 0 ? (
                                                    <div className="flex flex-col items-end">
                                                        <span className={cn(
                                                            "font-bold text-base",
                                                            client.creditBalance > 0 ? 'text-emerald-600' : 'text-rose-600'
                                                        )}>
                                                            {new Intl.NumberFormat('pt-BR', { 
                                                                style: 'currency', 
                                                                currency: 'BRL' 
                                                            }).format(client.creditBalance)}
                                                        </span>
                                                        <span className={cn(
                                                            "text-[10px] font-semibold uppercase",
                                                            client.creditBalance > 0 ? 'text-emerald-600' : 'text-rose-600'
                                                        )}>
                                                            {client.creditBalance > 0 ? 'Crédito' : 'Débito'}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">-</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className={cn(
                "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20 px-4",
                viewMode === "grid" ? "grid" : "hidden"
            )}>
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="border border-slate-200 bg-white/40 backdrop-blur-xl h-[100px]">
                            <CardContent className="flex h-full items-center gap-3 p-4">
                                <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : paginatedClients.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground bg-card/30 rounded-2xl border border-white/10">
                        Nenhum cliente encontrado.
                    </div>
                ) : (
                    paginatedClients.map((client) => {
                        const stats = clientStats[client.id] || {};
                        const daysSinceLastVisit = stats.lastVisit ? Math.floor((new Date().getTime() - stats.lastVisit.getTime()) / (1000 * 60 * 60 * 24)) : null;
                        const isInactive = daysSinceLastVisit && daysSinceLastVisit > 60;
                        
                        return (
                            <Link href={`/clients/${client.id}`} key={client.id} className="block group">
                                <Card className="border border-slate-200 bg-white/60 hover:bg-white hover:shadow-xl backdrop-blur-xl shadow-lg hover:scale-[1.02] transition-all duration-300 rounded-2xl overflow-hidden h-full flex flex-col relative">
                                    {/* Badge de Status no Canto */}
                                    {isInactive && (
                                        <div className="absolute top-3 right-3 z-10">
                                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold">
                                                Inativo
                                            </Badge>
                                        </div>
                                    )}
                                    
                                    <CardContent className="p-5 flex flex-col gap-4 flex-1">
                                        {/* Header: Avatar + Nome + Saldo */}
                                        <div className="flex items-start gap-3">
                                            <div className="relative flex-shrink-0">
                                                <Avatar className="h-14 w-14 border-2 border-white shadow-lg ring-2 ring-primary/10">
                                                    <AvatarImage src={client.photoUrl} alt={client.name} />
                                                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold text-base">
                                                        {getInitials(client.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className={cn(
                                                    "absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white shadow-sm",
                                                    client.status === 'ACTIVE' ? 'bg-green-500' :
                                                    client.status === 'ATTENTION' ? 'bg-orange-500' : 'bg-gray-400'
                                                )} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-slate-900 line-clamp-2 break-words font-heading group-hover:text-primary transition-colors text-base leading-tight mb-1">
                                                    {formatName(client.name)}
                                                </h3>
                                                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                                    {client.whatsapp ? (
                                                        <MessageCircle className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                                                    ) : (
                                                        <Phone className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                                                    )}
                                                    <span className="font-medium tracking-tight truncate text-xs">
                                                        {formatPhone(client.whatsapp || client.phone || 'Sem contato')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Saldo em Destaque */}
                                        {client.creditBalance !== 0 && (
                                            <div className={cn(
                                                "p-3 rounded-xl border-2 flex items-center justify-between",
                                                client.creditBalance > 0 
                                                    ? "bg-emerald-50 border-emerald-200" 
                                                    : "bg-rose-50 border-rose-200"
                                            )}>
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className={cn(
                                                        "h-4 w-4",
                                                        client.creditBalance > 0 ? "text-emerald-600" : "text-rose-600"
                                                    )} />
                                                    <span className="text-xs font-semibold text-slate-600">
                                                        {client.creditBalance > 0 ? 'Crédito' : 'Débito'}
                                                    </span>
                                                </div>
                                                <span className={cn(
                                                    "text-xl font-black",
                                                    client.creditBalance > 0 ? "text-emerald-600" : "text-rose-600"
                                                )}>
                                                    {new Intl.NumberFormat('pt-BR', { 
                                                        style: 'currency', 
                                                        currency: 'BRL',
                                                        minimumFractionDigits: 2
                                                    }).format(Math.abs(client.creditBalance))}
                                                </span>
                                            </div>
                                        )}

                                        {/* Info Grid */}
                                        <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 p-3 rounded-xl border border-slate-200 space-y-2.5">
                                            {/* Localização */}
                                            <div className="flex items-center gap-2 text-slate-700">
                                                <div className="h-7 w-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                    <MapPin className="h-3.5 w-3.5 text-blue-600" />
                                                </div>
                                                <span className="text-xs font-medium truncate">{client.city || 'Cidade não informada'}</span>
                                            </div>

                                            {/* Última Visita */}
                                            <div className="flex items-center gap-2 text-slate-700">
                                                <div className="h-7 w-7 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                                                    <History className="h-3.5 w-3.5 text-purple-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-[10px] uppercase text-slate-500 font-bold block">Última visita</span>
                                                    <span className="font-semibold text-slate-800 text-xs">
                                                        {stats.lastVisit ? (
                                                            <>
                                                                {format(stats.lastVisit, 'dd/MM/yyyy')}
                                                                {daysSinceLastVisit && (
                                                                    <span className="text-[10px] text-slate-500 ml-1">
                                                                        ({daysSinceLastVisit}d atrás)
                                                                    </span>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <span className="text-slate-400">Nunca</span>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Próximo Agendamento */}
                                            <div className="flex items-center gap-2 text-slate-700">
                                                <div className={cn(
                                                    "h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0",
                                                    stats.nextAppointment ? "bg-green-100" : "bg-slate-100"
                                                )}>
                                                    <Calendar className={cn(
                                                        "h-3.5 w-3.5",
                                                        stats.nextAppointment ? "text-green-600" : "text-slate-400"
                                                    )} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-[10px] uppercase text-slate-500 font-bold block">Próximo agendamento</span>
                                                    <span className={cn(
                                                        "font-semibold text-xs truncate block",
                                                        stats.nextAppointment ? "text-green-700" : "text-slate-400"
                                                    )}>
                                                        {stats.nextAppointment ? format(stats.nextAppointment, "dd/MM/yyyy 'às' HH:mm") : 'Sem agendamento'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pb-10">
                    <p className="text-sm text-muted-foreground">
                        Mostrando <span className="font-medium text-foreground">{paginatedClients.length}</span> de <span className="font-medium text-foreground">{clients.length}</span> clientes
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-white/50 border-white/20 rounded-xl"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                        </Button>
                        <div className="flex items-center bg-white/40 border border-white/20 rounded-xl px-4 py-1.5 min-w-[100px] justify-center text-sm">
                            Página <span className="font-bold text-primary mx-1">{currentPage}</span> de <span className="font-medium ml-1">{totalPages}</span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-white/50 border-white/20 rounded-xl transition-all"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Próximo <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
