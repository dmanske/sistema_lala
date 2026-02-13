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

import { Supplier } from "@/core/domain/Supplier";
import { getSupplierRepository } from "@/infrastructure/repositories/factory";
import { formatPhone } from "@/core/formatters/phone";
import { SupplierCard } from "@/components/suppliers/SupplierCard";
import { DeleteSupplierDialog } from "@/components/suppliers/DeleteSupplierDialog";

export default function SuppliersPage() {
    const router = useRouter();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [viewMode, setViewMode] = useState<"table" | "grid">("grid");
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [supplierToDelete, setSupplierToDelete] = useState<{ id: string; name: string } | null>(null);

    const ITEMS_PER_PAGE = 8;
    const repo = getSupplierRepository();

    const fetchSuppliers = async () => {
        setIsLoading(true);
        try {
            const data = await repo.getAll({
                search: search || undefined,
                status: statusFilter === "ALL" ? undefined : statusFilter
            });
            // Ordenar alfabeticamente por nome
            const sortedData = data.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
            setSuppliers(sortedData);
        } catch (error) {
            console.error("Failed to fetch suppliers", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
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

    const handleEdit = (supplier: Supplier) => {
        router.push(`/suppliers/${supplier.id}/edit`);
    };

    const handleDelete = (id: string, name: string) => {
        setSupplierToDelete({ id, name });
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (supplierToDelete) {
            await repo.delete(supplierToDelete.id);
            setDeleteDialogOpen(false);
            setSupplierToDelete(null);
            fetchSuppliers();
        }
    };



    const formatCNPJ = (value: string) => {
        return value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="hidden md:flex justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">Fornecedores</h1>
                    <p className="text-muted-foreground">Gerencie seus fornecedores e parceiros de negócio.</p>
                </div>
                <Button asChild className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all">
                    <Link href="/suppliers/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Fornecedor
                    </Link>
                </Button>
            </div>

            {/* Mobile Header */}
            <div className="md:hidden flex justify-between items-center">
                <h1 className="text-2xl font-bold font-heading">Fornecedores</h1>
                <Button asChild size="sm" className="bg-orange-600 rounded-lg">
                    <Link href="/suppliers/new">
                        <Plus className="h-4 w-4" />
                    </Link>
                </Button>
            </div>

            {/* Filters/Toolbar */}
            <div className="bg-card/50 backdrop-blur-xl p-4 sm:p-6 rounded-2xl border border-white/20 shadow-lg shadow-orange-500/5 flex flex-col md:flex-row gap-4 items-stretch md:items-center transition-all hover:shadow-orange-500/10">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome, CNPJ ou email..."
                        className="pl-10 bg-slate-50 border-slate-200 focus:bg-white rounded-xl h-10 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[160px] bg-slate-50 border-slate-200 rounded-xl h-10">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-slate-500" />
                                <SelectValue placeholder="Status" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todos os status</SelectItem>
                            <SelectItem value="ACTIVE">Ativos</SelectItem>
                            <SelectItem value="INACTIVE">Inativos</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl h-10">
                        <Button
                            variant={viewMode === "table" ? "secondary" : "ghost"}
                            size="icon"
                            onClick={() => setViewMode("table")}
                            className={cn("h-8 w-8 rounded-lg", viewMode === "table" ? "bg-white shadow-sm" : "text-slate-500")}
                        >
                            <LayoutList className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === "grid" ? "secondary" : "ghost"}
                            size="icon"
                            onClick={() => setViewMode("grid")}
                            className={cn("h-8 w-8 rounded-lg", viewMode === "grid" ? "bg-white shadow-sm" : "text-slate-500")}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content Table */}
            {viewMode === "table" && (
                <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent bg-slate-50/50 border-slate-100">
                                <TableHead className="font-semibold text-slate-700">
                                    <div className="flex items-center gap-1">
                                        Fornecedor
                                        <span className="text-xs text-muted-foreground">(A-Z)</span>
                                    </div>
                                </TableHead>
                                <TableHead className="font-semibold text-slate-700">Contato</TableHead>
                                <TableHead className="font-semibold text-slate-700">Identificação</TableHead>
                                <TableHead className="font-semibold text-slate-700">Cadastro</TableHead>
                                <TableHead className="font-semibold text-slate-700 text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="border-slate-50">
                                        <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-6 w-[80px] ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : paginatedSuppliers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground border-slate-50">
                                        Nenhum fornecedor encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedSuppliers.map((supplier) => (
                                    <TableRow
                                        key={supplier.id}
                                        className="cursor-pointer group hover:bg-slate-50 border-slate-50 transition-colors"
                                        onClick={() => router.push(`/suppliers/${supplier.id}`)}
                                    >
                                        <TableCell className="font-medium py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "p-2 rounded-lg",
                                                    supplier.status === 'ACTIVE' ? "bg-orange-50 text-orange-600" : "bg-slate-50 text-slate-500"
                                                )}>
                                                    <Truck className="h-4 w-4" />
                                                </div>
                                                <span className="text-slate-900">{supplier.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-sm">
                                                <div className="flex items-center gap-1.5">
                                                    <Phone className="h-3 w-3 text-slate-400" />
                                                    <span className="text-slate-700 font-medium">{supplier.phone ? formatPhone(supplier.phone) : "-"}</span>
                                                </div>
                                                {supplier.email && (
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <Mail className="h-3 w-3 text-slate-400" />
                                                        <span className="text-xs text-muted-foreground">{supplier.email}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-xs text-muted-foreground">
                                                <span className="font-medium text-slate-600">{supplier.cnpj ? formatCNPJ(supplier.cnpj) : "-"}</span>
                                                {supplier.whatsapp && <span className="flex gap-1 items-center text-emerald-600 mt-0.5"><MessageCircle className="w-3 h-3" /> {formatPhone(supplier.whatsapp)}</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-muted-foreground text-sm">{format(new Date(supplier.createdAt), 'dd/MM/yyyy', { locale: ptBR })}</span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant={supplier.status === 'ACTIVE' ? "default" : "secondary"} className={cn(
                                                "rounded-lg px-2.5 py-0.5 font-medium text-[10px] uppercase tracking-wider",
                                                supplier.status === 'ACTIVE' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-100 text-slate-600 border-slate-200"
                                            )}>
                                                {supplier.status === 'ACTIVE' ? "Ativo" : "Inativo"}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Grid View */}
            {viewMode === "grid" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">

                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-[200px] rounded-2xl" />
                        ))
                    ) : paginatedSuppliers.length === 0 && viewMode === "grid" ? (
                        <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border border-slate-200 border-dashed">
                            <Truck className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-900">Nenhum fornecedor encontrado</h3>
                            <p className="text-muted-foreground">Tente ajustar seus filtros de busca.</p>
                        </div>
                    ) : (
                        paginatedSuppliers.map((supplier) => (
                            <SupplierCard
                                key={supplier.id}
                                supplier={supplier}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))
                    )}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pb-10">
                    <p className="text-sm text-slate-500">
                        Mostrando <span className="font-semibold text-slate-900">{paginatedSuppliers.length}</span> de <span className="font-semibold text-slate-900">{suppliers.length}</span> fornecedores
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-white border-slate-200 rounded-xl"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                        </Button>
                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm">
                            <span className="text-slate-400 mr-2">Página</span>
                            <span className="font-bold text-slate-900">{currentPage}</span>
                            <span className="text-slate-400 mx-2">de</span>
                            <span className="font-medium text-slate-700">{totalPages}</span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-white border-slate-200 rounded-xl"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Próximo <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}

            <DeleteSupplierDialog
                isOpen={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                supplierId={supplierToDelete?.id || ""}
                supplierName={supplierToDelete?.name || ""}
                onSuccess={fetchSuppliers}
            />
        </div>
    );
}
