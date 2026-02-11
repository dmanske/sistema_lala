"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useProfessionals } from "@/hooks/useProfessionals";
import { ProfessionalDialog } from "@/components/professionals/ProfessionalDialog";
import { DeleteProfessionalDialog } from "@/components/professionals/DeleteProfessionalDialog";
import { Professional } from "@/core/domain/Professional";
import { seedProfessionals } from "@/lib/seedProfessionals";

export default function ProfessionalsPage() {
    const { professionals, loading, addProfessional, updateProfessional, deleteProfessional, fetchProfessionals } = useProfessionals();
    const [search, setSearch] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingProfessional, setEditingProfessional] = useState<Professional | undefined>(undefined);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingProfessional, setDeletingProfessional] = useState<Professional | undefined>(undefined);

    // Seed inicial de profissionais
    useEffect(() => {
        const initSeed = async () => {
            const seeded = await seedProfessionals();
            if (seeded) {
                fetchProfessionals();
            }
        };
        initSeed();
    }, []);

    const filteredProfessionals = professionals.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleEdit = (professional: Professional) => {
        setEditingProfessional(professional);
        setDialogOpen(true);
    };

    const handleNew = () => {
        setEditingProfessional(undefined);
        setDialogOpen(true);
    };

    const handleDelete = (professional: Professional) => {
        setDeletingProfessional(professional);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (deletingProfessional) {
            await deleteProfessional(deletingProfessional.id);
            setDeleteDialogOpen(false);
            setDeletingProfessional(undefined);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Profissionais</h1>
                    <p className="text-muted-foreground">Gerencie a equipe do salão</p>
                </div>
                <Button
                    onClick={handleNew}
                    className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20 rounded-xl"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Profissional
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar profissional..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 rounded-xl border-slate-200 bg-white/50 backdrop-blur-sm"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
            ) : (
                <>
                    {filteredProfessionals.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-white/40 backdrop-blur-xl rounded-3xl border border-white/20 border-dashed mt-6">
                            <div className="mx-auto h-16 w-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                                <User className="h-8 w-8 text-purple-300" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground">Nenhum profissional encontrado</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                                {search ? "Tente ajustar sua busca" : "Comece adicionando um profissional à equipe"}
                            </p>
                            {!search && (
                                <Button onClick={handleNew} variant="outline" className="mt-6 rounded-xl border-purple-200 text-purple-700 hover:bg-purple-50">
                                    Adicionar Profissional
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProfessionals.map((professional) => (
                                <Card
                                    key={professional.id}
                                    className="hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 group relative overflow-hidden border-white/20 bg-white/60 backdrop-blur-lg rounded-2xl"
                                >
                                    <div
                                        className="absolute top-0 left-0 w-full h-2"
                                        style={{ backgroundColor: professional.color }}
                                    />
                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            className="h-8 w-8 rounded-lg bg-white/80 hover:bg-white hover:text-purple-600 shadow-sm"
                                            onClick={() => handleEdit(professional)}
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            className="h-8 w-8 rounded-lg bg-white/80 hover:bg-purple-50 hover:text-purple-600 shadow-sm"
                                            onClick={() => handleDelete(professional)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>

                                    <CardHeader className="pb-3 pt-6">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div
                                                className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md"
                                                style={{ backgroundColor: professional.color }}
                                            >
                                                {professional.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <CardTitle className="text-lg font-bold truncate">{professional.name}</CardTitle>
                                                <Badge
                                                    variant={professional.status === "ACTIVE" ? "default" : "secondary"}
                                                    className={`mt-1 ${professional.status === "ACTIVE"
                                                        ? "bg-green-100 text-green-700 border-green-200"
                                                        : "bg-slate-100 text-slate-600"
                                                        }`}
                                                >
                                                    {professional.status === "ACTIVE" ? "Ativo" : "Inativo"}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-2">
                                        {professional.phone && (
                                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                <span className="font-medium">📱</span>
                                                {professional.phone}
                                            </div>
                                        )}
                                        {professional.email && (
                                            <div className="text-sm text-muted-foreground flex items-center gap-2 truncate">
                                                <span className="font-medium">✉️</span>
                                                {professional.email}
                                            </div>
                                        )}
                                        {professional.commission > 0 && (
                                            <div className="text-sm font-medium text-purple-700 flex items-center gap-2">
                                                <span>💰</span>
                                                Comissão: {professional.commission}%
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </>
            )}

            <ProfessionalDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                professional={editingProfessional}
                onSubmit={async (data) => {
                    if (editingProfessional) {
                        await updateProfessional(editingProfessional.id, data);
                    } else {
                        await addProfessional(data);
                    }
                    setDialogOpen(false);
                }}
            />

            {deletingProfessional && (
                <DeleteProfessionalDialog
                    isOpen={deleteDialogOpen}
                    onOpenChange={(open) => {
                        setDeleteDialogOpen(open);
                        if (!open) setDeletingProfessional(undefined);
                    }}
                    professionalName={deletingProfessional.name}
                    onConfirm={confirmDelete}
                />
            )}
        </div>
    );
}
