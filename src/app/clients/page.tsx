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
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
import { ClientService } from "@/core/services/ClientService";
import { LocalStorageClientRepository } from "@/infrastructure/repositories/LocalStorageClientRepository";
import { formatName } from "@/core/formatters/name";
import { formatPhone } from "@/core/formatters/phone";
import { formatDate } from "@/core/formatters/date";

export default function ClientsPage() {
    const router = useRouter(); // Hook needed for navigation
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [viewMode, setViewMode] = useState<"table" | "grid">("table");
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const repo = new LocalStorageClientRepository();
    const service = new ClientService(repo);

    useEffect(() => {
        const fetchClients = async () => {
            setIsLoading(true);
            try {
                const data = await service.getAll({
                    search: search || undefined,
                    status: statusFilter === "ALL" ? undefined : statusFilter
                });
                setClients(data);
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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

            <div className="bg-card/50 backdrop-blur-xl p-4 sm:p-6 rounded-2xl border border-white/20 shadow-lg shadow-purple-500/5 flex flex-col sm:flex-row gap-4 items-center transition-all hover:shadow-purple-500/10">
                <div className="relative w-full sm:w-1/3">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome ou telefone..."
                        className="pl-9 bg-white/40 border-white/20 focus:bg-white/60 rounded-xl"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="w-full sm:w-[200px]">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="bg-white/40 border-white/20 focus:ring-primary/20 h-10 rounded-xl">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-primary/70" />
                                <SelectValue placeholder="Filtrar por Status" />
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

                <div className="flex items-center gap-1 ml-auto bg-white/40 border border-white/20 p-1 rounded-xl">
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

            {viewMode === "table" ? (
                <div className="rounded-2xl border border-white/20 bg-card/40 backdrop-blur-xl shadow-lg shadow-purple-500/5 overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-white/10">
                                <TableHead className="font-heading font-semibold text-primary/80">Nome</TableHead>
                                <TableHead className="font-heading font-semibold text-primary/80">Telefone / WhatsApp</TableHead>
                                <TableHead className="font-heading font-semibold text-primary/80">Última Visita</TableHead>
                                <TableHead className="font-heading font-semibold text-primary/80">Próx. Agendamento</TableHead>
                                <TableHead className="font-heading font-semibold text-primary/80">Status</TableHead>
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
                                paginatedClients.map((client) => (
                                    <TableRow
                                        key={client.id}
                                        className="cursor-pointer group hover:bg-white/40 border-white/10 transition-colors relative"
                                        onClick={() => router.push(`/clients/${client.id}`)}
                                    >
                                        <TableCell className="font-medium">
                                            {formatName(client.name)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>{client.phone ? formatPhone(client.phone) : "-"}</span>
                                                {client.whatsapp && <span className="text-xs text-muted-foreground">{formatPhone(client.whatsapp)}</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-muted-foreground text-sm">{formatDate(null)}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-muted-foreground text-sm">{formatDate(null)}</span>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(client.status)}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <Card key={i} className="border-white/20 bg-white/40 backdrop-blur-xl h-[180px]">
                                <CardContent className="flex h-full items-center gap-6 p-6">
                                    <Skeleton className="h-24 w-24 rounded-full flex-shrink-0" />
                                    <div className="space-y-3 flex-1">
                                        <Skeleton className="h-6 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                        <Skeleton className="h-4 w-2/3" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : paginatedClients.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-muted-foreground bg-card/30 rounded-2xl border border-white/10">
                            Nenhum cliente encontrado.
                        </div>
                    ) : (
                        paginatedClients.map((client) => (
                            <Link href={`/clients/${client.id}`} key={client.id} className="block group">
                                <Card className="border-none bg-white/60 hover:bg-white/90 backdrop-blur-xl shadow-lg shadow-purple-500/5 hover:shadow-purple-500/15 transition-all duration-300 rounded-2xl overflow-hidden group">
                                    <CardContent className="p-0 flex flex-col sm:flex-row items-stretch">
                                        <div className="p-6 flex flex-row items-start gap-6 flex-1">
                                            {/* Avatar with Status Dot */}
                                            <div className="relative flex-shrink-0">
                                                <Avatar className="h-24 w-24 border-2 border-white shadow-md transition-transform group-hover:scale-105 duration-300">
                                                    <AvatarImage src={client.photoUrl} alt={client.name} />
                                                    <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">
                                                        {getInitials(client.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className={`absolute bottom-1 right-1 h-5 w-5 rounded-full border-4 border-white shadow-sm ${client.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-300'}`} />
                                            </div>

                                            {/* Center Details */}
                                            <div className="flex-1 min-w-0 space-y-1.5 pt-1">
                                                <h3 className="text-xl font-bold text-slate-800 truncate font-heading group-hover:text-primary transition-colors">
                                                    {formatName(client.name)}
                                                </h3>

                                                <div className="space-y-1">
                                                    {client.phone && (
                                                        <div className="flex items-center gap-2.5 text-slate-600">
                                                            <Phone className="h-4 w-4 text-green-500/70" />
                                                            <span className="text-sm font-medium">{formatPhone(client.phone)}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2.5 text-slate-500">
                                                        <CreditCard className="h-4 w-4 text-purple-500/70" />
                                                        <span className="text-sm">000.000.000-00</span>
                                                    </div>
                                                    <div className="flex items-center gap-2.5 text-slate-500">
                                                        <MapPin className="h-4 w-4 text-blue-500/70" />
                                                        <span className="text-sm truncate">{client.city}, SC</span>
                                                    </div>
                                                    <div className="flex items-center gap-2.5 text-slate-400">
                                                        <Calendar className="h-4 w-4 text-slate-400" />
                                                        <span className="text-sm italic">Nascimento: {formatDate(client.birthDate)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Meta Info & Actions */}
                                        <div className="px-6 py-6 sm:pl-0 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 flex-shrink-0 border-t sm:border-t-0 sm:border-l border-slate-100/50">
                                            <div className="flex flex-col items-end gap-1.5">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    <span>{format(new Date(client.createdAt), 'dd/MM', { locale: ptBR })}</span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <div className="bg-green-50 text-green-600 p-1 rounded-full border border-green-100">
                                                        <MessageCircle className="h-4 w-4 fill-green-600/10" />
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[11px] font-bold text-green-600 bg-green-50/50 px-2 py-0.5 rounded-full border border-green-100/50">
                                                        <Check className="h-3 w-3" />
                                                        <span>FACIAL OK</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 mt-auto">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="h-8 gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 border-none rounded-lg text-xs"
                                                >
                                                    <Mail className="h-3.5 w-3.5" />
                                                    Email
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-600"
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    )}
                </div>
            )}

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
