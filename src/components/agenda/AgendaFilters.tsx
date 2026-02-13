"use client";

import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

interface ProfessionalOption {
    id: string;
    name: string;
    color: string;
}

interface AgendaFiltersProps {
    selectedProfessional: string;
    onProfessionalChange: (value: string) => void;
    statusFilter: string;
    onStatusFilterChange: (value: string) => void;
    professionals: ProfessionalOption[];
}

export function AgendaFilters({
    selectedProfessional,
    onProfessionalChange,
    statusFilter,
    onStatusFilterChange,
    professionals,
}: AgendaFiltersProps) {
    const activeFiltersCount = [
        selectedProfessional !== "ALL",
        statusFilter !== "ALL"
    ].filter(Boolean).length;

    // Desktop: Inline filters
    const FiltersContent = () => (
        <div className="flex flex-col sm:flex-row gap-3">
            <Select value={selectedProfessional} onValueChange={onProfessionalChange}>
                <SelectTrigger className="w-full sm:w-[200px] bg-white/50 border-white/30 rounded-xl">
                    <SelectValue placeholder="Profissional" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-white/20 bg-white/90">
                    <SelectItem value="ALL">Todos profissionais</SelectItem>
                    {professionals.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger className="w-full sm:w-[180px] bg-white/50 border-white/30 rounded-xl">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-white/20 bg-white/90">
                    <SelectItem value="ALL">Todos status</SelectItem>
                    <SelectItem value="PENDING">Pendente</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                    <SelectItem value="DONE">Finalizado</SelectItem>
                    <SelectItem value="CANCELED">Apagar</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );

    return (
        <>
            {/* Mobile: Sheet with filters */}
            <div className="block sm:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="relative bg-white/50 border-white/30 rounded-xl"
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Filtros
                            {activeFiltersCount > 0 && (
                                <Badge
                                    variant="default"
                                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                                >
                                    {activeFiltersCount}
                                </Badge>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px] bg-white/90 backdrop-blur-2xl">
                        <SheetHeader>
                            <SheetTitle>Filtros</SheetTitle>
                        </SheetHeader>
                        <div className="mt-6">
                            <FiltersContent />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop: Inline filters */}
            <div className="hidden sm:block">
                <FiltersContent />
            </div>
        </>
    );
}
