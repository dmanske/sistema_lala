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
                                    return (
                                        <TableRow
                                            key={client.id}
                                            className="cursor-pointer group hover:bg-white/40 border-white/10 transition-colors relative"
                                            onClick={() => router.push(`/clients/${client.id}`)}
                                        >
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8 border border-white/20">
                                                        <AvatarImage src={client.photoUrl} alt={client.name} />
                                                        <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                                                            {getInitials(client.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span>{formatName(client.name)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    {(client.phone || client.whatsapp) ? (
                                                        <>
                                                            {client.phone && <span>{formatPhone(client.phone)}</span>}
                                                            {client.whatsapp && client.whatsapp !== client.phone && <span className="text-xs text-muted-foreground">{formatPhone(client.whatsapp)}</span>}
                                                        </>
                                                    ) : <span className="text-muted-foreground">-</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-muted-foreground text-sm">
                                                    {stats.lastVisit ? format(stats.lastVisit, 'dd/MM/yyyy') : '-'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="text-muted-foreground text-sm">
                                                    {stats.nextAppointment ? (
                                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                            {format(stats.nextAppointment, 'dd/MM HH:mm')}
                                                        </Badge>
                                                    ) : '-'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className={`font-bold ${client.creditBalance < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(client.creditBalance)}
                                                </span>
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
                        return (
                            <Link href={`/clients/${client.id}`} key={client.id} className="block group">
                                <Card className="border border-slate-200 bg-white/60 hover:bg-white/90 backdrop-blur-xl shadow-lg shadow-purple-500/5 hover:shadow-purple-500/15 transition-all duration-300 rounded-2xl overflow-hidden group h-full flex flex-col">
                                    <CardContent className="p-4 flex flex-col gap-3 flex-1">
                                        {/* Top Section: Avatar, Name and Balance */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                                <div className="relative flex-shrink-0">
                                                    <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                                                        <AvatarImage src={client.photoUrl} alt={client.name} />
                                                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                                                            {getInitials(client.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className={cn(
                                                        "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white",
                                                        client.status === 'ACTIVE' ? 'bg-green-500' :
                                                            client.status === 'ATTENTION' ? 'bg-orange-500' : 'bg-gray-300'
                                                    )} />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-slate-800 line-clamp-2 break-words font-heading group-hover:text-primary transition-colors text-base">
                                                        {formatName(client.name)}
                                                    </h3>
                                                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                                        {client.whatsapp ? <MessageCircle className="h-3.5 w-3.5 text-green-600 flex-shrink-0" /> : <Phone className="h-3.5 w-3.5 flex-shrink-0" />}
                                                        <span className="font-medium tracking-tight truncate">
                                                            {formatPhone(client.whatsapp || client.phone || 'Sem contato')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end flex-shrink-0">
                                                <span className="text-[9px] uppercase text-muted-foreground font-bold tracking-wider">Saldo</span>
                                                <span className={cn("text-lg font-black leading-tight", client.creditBalance < 0 ? "text-red-500" : "text-emerald-600")}>
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(client.creditBalance)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Info Block */}
                                        <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 flex flex-col gap-2">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <MapPin className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                                                <span className="text-xs font-medium truncate">{client.city || 'Cidade não inf.'}</span>
                                            </div>

                                            <div className="pt-2 border-t border-slate-200/50 grid grid-cols-2 gap-2">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[9px] uppercase text-slate-400 font-bold">Última</span>
                                                    <span className="font-semibold text-slate-700 text-xs">
                                                        {stats.lastVisit ? format(stats.lastVisit, 'dd/MM/yy') : '-'}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col gap-0.5 border-l border-slate-200 pl-2">
                                                    <span className="text-[9px] uppercase text-slate-400 font-bold">Próximo</span>
                                                    <span className={cn("font-semibold text-xs truncate", stats.nextAppointment ? "text-blue-600" : "text-slate-500")}>
                                                        {stats.nextAppointment ? format(stats.nextAppointment, 'dd/MM HH:mm') : '-'}
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
