"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Search, LayoutGrid, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useServices } from "@/hooks/useServices";
import { ServiceDialog } from "@/components/services/ServiceDialog";
import { DeleteServiceDialog } from "@/components/services/DeleteServiceDialog";
import { ServiceCard } from "@/components/services/ServiceCard";
import { Service } from "@/core/domain/Service";
import { Badge } from "@/components/ui/badge";

export default function ServicesPage() {
    const { services, loading, addService, updateService, deleteService, fetchServices } = useServices();
    const [search, setSearch] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | undefined>(undefined);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState<{ id: string; name: string } | null>(null);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        fetchServices(e.target.value);
    };

    const handleEdit = (service: Service) => {
        setEditingService(service);
        setDialogOpen(true);
    };

    const handleNew = () => {
        setEditingService(undefined);
        setDialogOpen(true);
    };

    const handleDelete = (id: string, name: string) => {
        setServiceToDelete({ id, name });
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (serviceToDelete) {
            await deleteService(serviceToDelete.id);
            setDeleteDialogOpen(false);
            setServiceToDelete(null);
        }
    };


    return (
        <div className="space-y-6">
            <div className="hidden md:flex justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">Serviços</h1>
                    <p className="text-muted-foreground">Gerencie os serviços oferecidos pelo salão.</p>
                </div>
                <Button onClick={handleNew} className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all">
                    <Plus className="mr-2 h-4 w-4" /> Novo Serviço
                </Button>
            </div>

            {/* Mobile Header Action */}
            <div className="md:hidden flex justify-between items-center">
                <h1 className="text-2xl font-bold font-heading">Serviços</h1>
                <Button size="sm" onClick={handleNew} className="bg-purple-600 rounded-lg">
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            <div className="bg-card/50 backdrop-blur-xl p-4 sm:p-6 rounded-2xl border border-white/20 shadow-lg shadow-purple-500/5 flex flex-col md:flex-row gap-4 items-stretch md:items-center transition-all hover:shadow-purple-500/10">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar serviços..."
                        className="pl-9 bg-white/40 border-white/20 focus:bg-white/60 rounded-xl h-11 md:h-10 transition-all"
                        value={search}
                        onChange={handleSearch}
                    />
                </div>
                <div className="flex items-center gap-1 bg-white/40 border border-white/20 p-1 rounded-xl h-11 md:h-10">
                    <Button
                        variant={viewMode === "list" ? "secondary" : "ghost"}
                        size="icon"
                        onClick={() => setViewMode("list")}
                        className={`h-8 w-8 rounded-lg ${viewMode === "list" ? "bg-white shadow-sm" : ""}`}
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

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-[200px] rounded-2xl bg-muted/20 animate-pulse" />
                    ))}
                </div>
            ) : (
                <>
                    {viewMode === "grid" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                            {services.map((service) => (
                                <ServiceCard
                                    key={service.id}
                                    service={service}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white/40 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-sm">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-white/10 hover:bg-white/20">
                                        <TableHead className="w-[40%] font-heading text-slate-700">Serviço</TableHead>
                                        <TableHead className="font-heading text-slate-700">Duração</TableHead>
                                        <TableHead className="font-heading text-slate-700">Preço</TableHead>
                                        <TableHead className="font-heading text-slate-700">Comissão</TableHead>
                                        <TableHead className="text-right font-heading text-slate-700">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {services.map((service) => (
                                        <TableRow key={service.id} className="border-white/10 hover:bg-white/40 transition-colors">
                                            <TableCell className="font-medium text-slate-800">
                                                {service.name}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {service.duration} min
                                            </TableCell>
                                            <TableCell className="font-semibold text-slate-700">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price)}
                                            </TableCell>
                                            <TableCell>
                                                {service.commission > 0 ? (
                                                    <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-100 font-normal">
                                                        {service.commission}%
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-purple-600 hover:bg-purple-50" onClick={() => handleEdit(service)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(service.id, service.name)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {services.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-white/40 backdrop-blur-xl rounded-3xl border border-white/20 border-dashed mt-6">
                            <div className="mx-auto h-16 w-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                                <Search className="h-8 w-8 text-purple-300" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground">Nenhum serviço encontrado</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                                Tente ajustar sua busca ou adicione um novo serviço.
                            </p>
                            <Button onClick={handleNew} variant="outline" className="mt-6 rounded-xl border-purple-200 text-purple-700 hover:bg-purple-50">
                                Adicionar Serviço
                            </Button>
                        </div>
                    )}
                </>
            )}

            <ServiceDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                service={editingService}
                onSubmit={editingService ? (data) => updateService(editingService.id, data) : addService}
            />

            <DeleteServiceDialog
                isOpen={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                serviceName={serviceToDelete?.name || ""}
                serviceId={serviceToDelete?.id || ""}
                onConfirm={confirmDelete}
            />
        </div>
    );
}
