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
    Mail,
    Globe,
    Truck,
    ChevronLeft,
    ChevronRight,
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
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { Supplier } from "@/core/domain/Supplier";
import { LocalStorageSupplierRepository } from "@/infrastructure/repositories/LocalStorageSupplierRepository";
import { formatPhone } from "@/core/formatters/phone";

export default function SuppliersPage() {
    const router = useRouter();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [viewMode, setViewMode] = useState<"table" | "grid">("table");
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const repo = new LocalStorageSupplierRepository();

    useEffect(() => {
        const fetchSuppliers = async () => {
            setIsLoading(true);
            try {
                const data = await repo.getAll({
                    search: search || undefined,
                    status: statusFilter === "ALL" ? undefined : statusFilter
                });
                setSuppliers(data);
            } catch (error) {
                console.error("Failed to fetch suppliers", error);
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchSuppliers();
        }, 300);

        return () => clearTimeout(timer);
    }, [search, statusFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter]);

    const totalPages = Math.ceil(suppliers.length / ITEMS_PER_PAGE);
    const paginatedSuppliers = suppliers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "ACTIVE":
                return <Badge className="bg-green-500 hover:bg-green-600">Ativo</Badge>;
            case "INACTIVE":
                return <Badge variant="secondary">Inativo</Badge>;
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

    const formatCNPJ = (value: string) => {
        return value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    }

    return (
        <div className="space-y-6">
            <div className="hidden md:flex justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">Fornecedores</h1>
                    <p className="text-muted-foreground">
                        Gerencie seus fornecedores e parceiros.
                    </p>
                </div>
                <Button asChild className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                    <Link href="/suppliers/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Fornecedor
                    </Link>
                </Button>
            </div>

            <div className="bg-card/50 backdrop-blur-xl p-4 sm:p-6 rounded-2xl border border-white/20 shadow-lg shadow-purple-500/5 flex flex-col md:flex-row gap-4 items-stretch md:items-center transition-all hover:shadow-purple-500/10">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome, CNPJ ou email..."
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
                                <TableHead className="font-heading font-semibold text-primary/80">Nome / Razão Social</TableHead>
                                <TableHead className="font-heading font-semibold text-primary/80">Contato</TableHead>
                                <TableHead className="font-heading font-semibold text-primary/80">CNPJ / Email</TableHead>
                                <TableHead className="font-heading font-semibold text-primary/80">Cadastrado em</TableHead>
                                <TableHead className="font-heading font-semibold text-primary/80">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="border-white/10">
                                        <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                                    </TableRow>
                                ))
                            ) : paginatedSuppliers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground border-white/10">
                                        Nenhum fornecedor encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedSuppliers.map((supplier) => (
                                    <TableRow
                                        key={supplier.id}
                                        className="cursor-pointer group hover:bg-white/40 border-white/10 transition-colors relative"
                                        onClick={() => router.push(`/suppliers/${supplier.id}`)}
                                    >
                                        <TableCell className="font-medium">
                                            {supplier.name}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>{supplier.phone ? formatPhone(supplier.phone) : "-"}</span>
                                                {supplier.whatsapp && <span className="text-xs text-muted-foreground flex gap-1 items-center"><MessageCircle className="w-3 h-3" /> {formatPhone(supplier.whatsapp)}</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-sm text-muted-foreground">
                                                <span>{supplier.cnpj ? formatCNPJ(supplier.cnpj) : "-"}</span>
                                                {supplier.email && <span className="text-xs">{supplier.email}</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-muted-foreground text-sm">{format(new Date(supplier.createdAt), 'dd/MM/yy', { locale: ptBR })}</span>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(supplier.status)}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className={cn(
                "grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-6 pb-20",
                viewMode === "grid" ? "block" : "md:hidden"
            )}>
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="border-white/20 bg-white/40 backdrop-blur-xl h-[120px]">
                            <CardContent className="flex h-full items-center gap-4 p-6">
                                <Skeleton className="h-16 w-16 rounded-full flex-shrink-0" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : paginatedSuppliers.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground bg-card/30 rounded-2xl border border-white/10">
                        Nenhum fornecedor encontrado.
                    </div>
                ) : (
                    paginatedSuppliers.map((supplier) => (
                        <Link href={`/suppliers/${supplier.id}`} key={supplier.id} className="block group">
                            <Card className="border-none bg-white/60 hover:bg-white/90 backdrop-blur-xl shadow-lg shadow-purple-500/5 hover:shadow-purple-500/15 transition-all duration-300 rounded-2xl overflow-hidden group">
                                <CardContent className="p-0 flex flex-col sm:flex-row items-stretch">
                                    <div className="p-5 flex flex-row items-center gap-5 flex-1">
                                        {/* Avatar */}
                                        <div className="relative flex-shrink-0">
                                            <Avatar className="h-20 w-20 border-2 border-white shadow-md transition-transform group-hover:scale-105 duration-300">
                                                <AvatarFallback className="text-xl bg-orange-100 text-orange-600 font-bold">
                                                    {getInitials(supplier.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className={cn(
                                                "absolute bottom-0 right-0 h-5 w-5 rounded-full border-4 border-white shadow-sm",
                                                supplier.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-300'
                                            )} />
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <h3 className="text-lg font-bold text-slate-800 truncate font-heading group-hover:text-primary transition-colors">
                                                {supplier.name}
                                            </h3>

                                            <div className="space-y-0.5">
                                                {(supplier.phone || supplier.whatsapp) && (
                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        {supplier.whatsapp ? (
                                                            <MessageCircle className="h-3.5 w-3.5 text-green-500/70" />
                                                        ) : (
                                                            <Phone className="h-3.5 w-3.5 text-primary/70" />
                                                        )}
                                                        <span className="text-sm font-medium">
                                                            {formatPhone(supplier.whatsapp || supplier.phone || '')}
                                                        </span>
                                                    </div>
                                                )}
                                                {supplier.email && (
                                                    <div className="flex items-center gap-2 text-slate-500">
                                                        <Mail className="h-3.5 w-3.5 text-blue-500/70" />
                                                        <span className="text-xs truncate">{supplier.email}</span>
                                                    </div>
                                                )}
                                                {supplier.cnpj && (
                                                    <div className="flex items-center gap-2 text-slate-500">
                                                        <Truck className="h-3.5 w-3.5 text-orange-500/70" />
                                                        <span className="text-xs">{formatCNPJ(supplier.cnpj)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-6 py-4 flex items-center justify-end sm:border-l border-white/20 bg-white/20 sm:bg-transparent">
                                        <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pb-10">
                    <p className="text-sm text-muted-foreground">
                        Mostrando <span className="font-medium text-foreground">{paginatedSuppliers.length}</span> de <span className="font-medium text-foreground">{suppliers.length}</span> fornecedores
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
