"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useServices } from "@/hooks/useServices";
import { ServiceDialog } from "@/components/services/ServiceDialog";
import { Service } from "@/core/domain/Service";
import { Badge } from "@/components/ui/badge";

export default function ServicesPage() {
    const { services, loading, addService, updateService, deleteService, fetchServices } = useServices();
    const [search, setSearch] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | undefined>(undefined);

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

    const handleDelete = async (id: string) => {
        if (confirm("Tem certeza que deseja excluir este serviço?")) {
            await deleteService(id);
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Serviços</h1>
                    <p className="text-muted-foreground">Gerencie os serviços oferecidos pelo salão.</p>
                </div>
                <Button onClick={handleNew} className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Plus className="mr-2 h-4 w-4" /> Novo Serviço
                </Button>
            </div>

            <div className="flex items-center gap-2 max-w-sm">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar serviços..."
                    value={search}
                    onChange={handleSearch}
                    className="flex-1"
                />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-40 rounded-xl bg-muted/20 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {services.map((service) => (
                        <Card key={service.id} className="hover:shadow-md transition-shadow group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-neutral-500 hover:text-purple-600" onClick={() => handleEdit(service)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-neutral-500 hover:text-red-600" onClick={() => handleDelete(service.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">{service.name}</CardTitle>
                                <CardDescription>{service.duration} min</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-end">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground">Preço</span>
                                        <span className="text-xl font-bold text-purple-600">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price)}
                                        </span>
                                    </div>
                                    {service.commission > 0 && (
                                        <Badge variant="secondary" className="text-xs">
                                            Comissão: R$ {service.commission}
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <ServiceDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                service={editingService}
                onSubmit={editingService ? (data) => updateService(editingService.id, data) : addService}
            />
        </div>
    );
}
