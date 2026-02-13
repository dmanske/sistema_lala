import { Supplier } from "@/core/domain/Supplier";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, MoreVertical, Edit2, Trash2, Truck } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatPhone } from "@/core/formatters/phone";

interface SupplierCardProps {
    supplier: Supplier;
    onEdit: (supplier: Supplier) => void;
    onDelete: (id: string, name: string) => void;
}

export function SupplierCard({ supplier, onEdit, onDelete }: SupplierCardProps) {
    const formatCNPJ = (value?: string) => {
        if (!value) return "Sem CNPJ";
        return value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    }

    return (
        <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800">
            {/* Decorative Top Gradient */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-amber-500" />

            <CardHeader className="p-5 pb-2">
                <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg dark:bg-orange-900/20 dark:text-orange-400">
                                <Truck className="h-4 w-4" />
                            </div>
                            <h3 className="font-bold text-lg text-slate-900 truncate dark:text-slate-100">
                                {supplier.name}
                            </h3>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 -mr-2">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(supplier)}>
                                <Edit2 className="mr-2 h-3.5 w-3.5" />
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => onDelete(supplier.id, supplier.name)}
                            >
                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                                Excluir
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>

            <CardContent className="p-5 pt-2 space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                        <Phone className="h-3.5 w-3.5 text-slate-500" />
                        <span>{supplier.phone ? formatPhone(supplier.phone) : "Sem telefone"}</span>
                    </div>
                    {supplier.whatsapp && (
                        <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-900/30 dark:text-emerald-400">
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span>WhatsApp</span>
                        </div>
                    )}
                </div>

                <div className="flex items-end justify-between mt-2">
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                            {formatCNPJ(supplier.cnpj)}
                        </span>
                        <span className="text-xs text-muted-foreground">/ cnpj</span>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-orange-600 bg-orange-50 hover:bg-orange-100 hover:text-orange-700 -mb-1 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(supplier);
                        }}
                    >
                        <Edit2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
