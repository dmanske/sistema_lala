import { Supplier } from "@/core/domain/Supplier";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, MessageCircle, MoreVertical, Edit2, Trash2, Truck, Mail, Calendar, Clock } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatPhone } from "@/core/formatters/phone";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { differenceInDays } from "date-fns";

interface SupplierCardProps {
    supplier: Supplier;
    onEdit: (supplier: Supplier) => void;
    onDelete: (id: string, name: string) => void;
}

export function SupplierCard({ supplier, onEdit, onDelete }: SupplierCardProps) {
    const router = useRouter();

    const formatCNPJ = (value?: string) => {
        if (!value) return "Sem CNPJ";
        return value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    }

    const handleCardClick = () => {
        router.push(`/suppliers/${supplier.id}`);
    };

    // Calcular dias desde o cadastro
    const daysSinceCreated = differenceInDays(new Date(), new Date(supplier.createdAt));

    return (
        <Card
            className="group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-white border-slate-100 cursor-pointer rounded-2xl"
            onClick={handleCardClick}
        >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />

            {/* Decorative Top Gradient */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-400 via-purple-500 to-indigo-400 bg-[length:200%_100%] animate-gradient-x" />

            <CardHeader className="p-4 pb-2 relative">
                <div className="flex justify-between items-start gap-2">
                    {/* Ícone com Gradiente */}
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
                            "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white",
                            supplier.status === 'ACTIVE' ? "bg-emerald-500" : "bg-slate-400"
                        )} />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base text-slate-800 line-clamp-2 break-words tracking-tight mb-1 group-hover:text-indigo-600 transition-colors">
                            {supplier.name}
                        </h3>
                        
                        {/* Status Badge */}
                        <Badge variant={supplier.status === 'ACTIVE' ? 'default' : 'secondary'} className={cn(
                            "rounded-lg px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider",
                            supplier.status === 'ACTIVE' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-300'
                        )}>
                            {supplier.status === 'ACTIVE' ? '✓ Ativo' : '○ Inativo'}
                        </Badge>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg -mr-1 transition-all"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-slate-200">
                            <DropdownMenuItem className="p-2.5 cursor-pointer" onClick={(e) => {
                                e.stopPropagation();
                                onEdit(supplier);
                            }}>
                                <Edit2 className="mr-2 h-4 w-4 text-indigo-500" />
                                Editar Fornecedor
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="p-2.5 text-red-600 focus:text-red-600 cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(supplier.id, supplier.name);
                                }}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir Registro
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-2 space-y-2 relative">
                {/* Info Grid com Ícones Coloridos */}
                <div className="grid grid-cols-1 gap-2">
                    {/* Telefone */}
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50/50 border border-blue-100/50 group/item hover:bg-blue-50 transition-colors">
                        <div className="p-1.5 bg-blue-100 rounded-md text-blue-600">
                            <Phone className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">Telefone</div>
                            <div className="text-xs font-bold text-slate-700">{supplier.phone ? formatPhone(supplier.phone) : "Não informado"}</div>
                        </div>
                    </div>

                    {/* Email */}
                    {supplier.email && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-50/50 border border-purple-100/50 group/item hover:bg-purple-50 transition-colors">
                            <div className="p-1.5 bg-purple-100 rounded-md text-purple-600">
                                <Mail className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[9px] font-bold text-purple-600 uppercase tracking-wider">Email</div>
                                <div className="text-xs font-medium text-slate-700 truncate">{supplier.email}</div>
                            </div>
                        </div>
                    )}

                    {/* WhatsApp */}
                    {supplier.whatsapp && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50/50 border border-emerald-100/50 group/item hover:bg-emerald-50 transition-colors">
                            <div className="p-1.5 bg-emerald-100 rounded-md text-emerald-600">
                                <MessageCircle className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">WhatsApp</div>
                                <div className="text-xs font-bold text-emerald-700">Disponível</div>
                            </div>
                        </div>
                    )}

                    {/* Tempo de Parceria */}
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50/50 border border-amber-100/50">
                        <div className="p-1.5 bg-amber-100 rounded-md text-amber-600">
                            <Calendar className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[9px] font-bold text-amber-600 uppercase tracking-wider">Parceria</div>
                            <div className="text-xs font-bold text-slate-700">{daysSinceCreated} dias</div>
                        </div>
                    </div>
                </div>

                {/* CNPJ Card Destacado */}
                <div className="pt-2 border-t border-slate-100">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">CNPJ</div>
                                <div className="text-xs font-mono font-bold text-slate-800">
                                    {formatCNPJ(supplier.cnpj)}
                                </div>
                            </div>
                            <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                <Edit2 className="h-3.5 w-3.5" />
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
