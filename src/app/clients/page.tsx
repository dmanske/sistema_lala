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
    MapPin
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
                            ) : clients.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground border-white/10">
                                        Nenhum cliente encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                clients.map((client) => (
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
                                                <span>{formatPhone(client.phone)}</span>
                                                <span className="text-xs text-muted-foreground">{formatPhone(client.whatsapp)}</span>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {isLoading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <Card key={i} className="border-white/20 bg-card/40 backdrop-blur-xl">
                                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-[120px]" />
                                        <Skeleton className="h-3 w-[80px]" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Skeleton className="h-3 w-full" />
                                        <Skeleton className="h-3 w-full" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : clients.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-muted-foreground bg-card/30 rounded-2xl border border-white/10">
                            Nenhum cliente encontrado.
                        </div>
                    ) : (
                        clients.map((client) => (
                            <Link href={`/clients/${client.id}`} key={client.id} className="block group h-full">
                                <Card className="h-full border-white/20 bg-card/40 backdrop-blur-xl shadow-lg shadow-purple-500/5 hover:shadow-purple-500/20 hover:bg-card/60 transition-all duration-300 transform hover:-translate-y-1">
                                    <CardHeader className="flex flex-row items-center gap-4 pb-4">
                                        <Avatar className="h-12 w-12 border-2 border-white/50 group-hover:border-primary transition-colors">
                                            <AvatarImage src={client.photoUrl} alt={client.name} />
                                            <AvatarFallback className="text-lg bg-primary/10 text-primary">
                                                {getInitials(client.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <CardTitle className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                                                {formatName(client.name)}
                                            </CardTitle>
                                            <div className="mt-1">
                                                {getStatusBadge(client.status)}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">
                                            <Phone className="h-4 w-4 text-primary/60" />
                                            <span>{formatPhone(client.phone)}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">
                                            <MessageCircle className="h-4 w-4 text-primary/60" />
                                            <span>{formatPhone(client.whatsapp)}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">
                                            <MapPin className="h-4 w-4 text-primary/60" />
                                            <span className="truncate">{client.city}</span>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-0 pb-4 justify-between border-t border-white/10 mt-auto pt-4">
                                        <span className="text-xs text-muted-foreground">
                                            Cliente desde {new Date(client.createdAt).getFullYear()}
                                        </span>
                                    </CardFooter>
                                </Card>
                            </Link>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
