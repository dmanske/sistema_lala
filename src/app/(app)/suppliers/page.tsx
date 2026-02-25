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
    Calendar,
    ArrowRight
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
import { SupplierDialog } from "@/components/suppliers/SupplierDialog";

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
    const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>(undefined);

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
        setEditingSupplier(supplier);
        setSupplierDialogOpen(true);
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
            {/* Header Area */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white shadow-2xl shadow-indigo-500/20">
                {/* Decorative Elements */}
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-400/20 blur-3xl animate-pulse" />
                <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md border border-white/20 shadow-xl">
                            <Truck className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-heading">
                                Fornecedores
                            </h1>
                            <p className="text-indigo-100 mt-1 flex items-center gap-2">
                                <Badge variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur-sm">
                                    {suppliers.length} Parceiros
                                </Badge>
                                Gestão estratégica de abastecimento
                            </p>
                        </div>
                    </div>

                    <Button asChild className="rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 shadow-xl shadow-indigo-900/20 px-6 py-6 h-auto text-lg font-bold group border-0">
                        <button onClick={() => {
                            setEditingSupplier(undefined);
                            setSupplierDialogOpen(true);
                        }}>
                            <Plus className="mr-2 h-5 w-5 transition-transform group-hover:rotate-90" />
                            Novo Fornecedor
                        </button>
                    </Button>
                </div>
            </div>

            {/* Filters/Toolbar */}
            <div className="bg-card/50 backdrop-blur-xl p-4 sm:p-6 rounded-2xl border border-white/20 shadow-lg shadow-indigo-500/5 flex flex-col md:flex-row gap-4 items-stretch md:items-center transition-all hover:shadow-indigo-500/10">
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
                <div className="hidden md:block bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden transition-all">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent bg-slate-50 border-b border-slate-100">
                                <TableHead className="font-bold text-slate-800 h-14 px-6">
                                    <div className="flex items-center gap-2">
                                        Fornecedor
                                        <div className="p-1 bg-slate-200 rounded text-[10px] text-slate-500 font-mono">A-Z</div>
                                    </div>
                                </TableHead>
                                <TableHead className="font-bold text-slate-800 h-14">Contato & Email</TableHead>
                                <TableHead className="font-bold text-slate-800 h-14">Documentos</TableHead>
                                <TableHead className="font-bold text-slate-800 h-14">Início Parceria</TableHead>
                                <TableHead className="font-bold text-slate-800 h-14 text-right px-6">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="border-slate-50">
                                        <TableCell className="px-6 py-6"><Skeleton className="h-6 w-[200px]" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                        <TableCell className="px-6 text-right"><Skeleton className="h-8 w-[80px] ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : paginatedSuppliers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-60 text-center text-slate-400 italic bg-slate-50/50">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search className="h-8 w-8 text-slate-300" />
                                            <p>Nenhum fornecedor encontrado para sua busca.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedSuppliers.map((supplier) => (
                                    <TableRow
                                        key={supplier.id}
                                        className="cursor-pointer group hover:bg-indigo-50/30 border-slate-50 transition-all"
                                        onClick={() => router.push(`/suppliers/${supplier.id}`)}
                                    >
                                        <TableCell className="py-5 px-6">
                                            <div className="flex items-center gap-4">
                                                {/* Ícone maior com gradiente e status indicator */}
                                                <div className="relative">
                                                    <div className={cn(
                                                        "h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-300 ring-2",
                                                        supplier.status === 'ACTIVE' 
                                                            ? "bg-gradient-to-br from-indigo-500 to-purple-600 ring-indigo-100 group-hover:ring-indigo-200" 
                                                            : "bg-gradient-to-br from-slate-300 to-slate-400 ring-slate-100"
                                                    )}>
                                                        <Truck className="h-6 w-6 text-white" />
                                                    </div>
                                                    {/* Status Indicator */}
                                                    <div className={cn(
                                                        "absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white",
                                                        supplier.status === 'ACTIVE' ? "bg-emerald-500" : "bg-slate-400"
                                                    )} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-slate-900 font-bold text-base group-hover:text-indigo-600 transition-colors tracking-tight">{supplier.name}</span>
                                                    <span className="text-xs text-slate-400 font-medium">Parceria há {Math.floor((new Date().getTime() - new Date(supplier.createdAt).getTime()) / (1000 * 60 * 60 * 24))} dias</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-2">
                                                {/* Telefone */}
                                                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-blue-50 border border-blue-100 w-fit">
                                                    <div className="p-1 bg-blue-100 text-blue-600 rounded">
                                                        <Phone className="h-3 w-3" />
                                                    </div>
                                                    <span className="text-slate-700 font-bold text-xs pr-1">{supplier.phone ? formatPhone(supplier.phone) : "-"}</span>
                                                </div>
                                                {/* Email */}
                                                {supplier.email && (
                                                    <div className="flex items-center gap-2 p-1.5 rounded-lg bg-purple-50 border border-purple-100 w-fit max-w-[200px]">
                                                        <div className="p-1 bg-purple-100 text-purple-600 rounded">
                                                            <Mail className="h-3 w-3" />
                                                        </div>
                                                        <span className="text-xs text-slate-600 font-medium truncate">{supplier.email}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-2">
                                                {/* CNPJ */}
                                                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 w-fit">
                                                    <span className="font-mono text-xs font-bold text-slate-700">{supplier.cnpj ? formatCNPJ(supplier.cnpj) : "-"}</span>
                                                </div>
                                                {/* WhatsApp Badge */}
                                                {supplier.whatsapp && (
                                                    <div className="flex gap-1.5 items-center text-emerald-600 font-bold text-[10px] uppercase tracking-tight bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1 w-fit">
                                                        <MessageCircle className="w-3 h-3" /> WhatsApp
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 border border-amber-100 w-fit">
                                                <Calendar className="h-4 w-4 text-amber-600" />
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Desde</span>
                                                    <span className="text-xs font-bold text-slate-700">{format(new Date(supplier.createdAt), 'dd/MM/yyyy', { locale: ptBR })}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right px-6">
                                            <div className="flex items-center justify-end gap-3">
                                                <Badge variant={supplier.status === 'ACTIVE' ? "default" : "secondary"} className={cn(
                                                    "rounded-lg px-3 py-1.5 font-bold text-[10px] uppercase tracking-widest",
                                                    supplier.status === 'ACTIVE' ? "bg-emerald-500 hover:bg-emerald-600" : "bg-slate-300"
                                                )}>
                                                    {supplier.status === 'ACTIVE' ? "✓ Ativo" : "○ Inativo"}
                                                </Badge>
                                                <ArrowRight className="h-4 w-4 text-slate-300 transform translate-x-[-10px] opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                                            </div>
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
                            <Skeleton key={i} className="h-[280px] rounded-3xl" />
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

            <SupplierDialog
                isOpen={supplierDialogOpen}
                onOpenChange={setSupplierDialogOpen}
                initialData={editingSupplier}
                onSuccess={fetchSuppliers}
            />
        </div>
    );
}
