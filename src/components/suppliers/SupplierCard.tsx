import { Supplier } from "@/core/domain/Supplier";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, MessageCircle, MoreVertical, Edit2, Trash2, Truck, Mail } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatPhone } from "@/core/formatters/phone";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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

    return (
        <Card
            className="group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-white border-slate-100 cursor-pointer rounded-2xl"
            onClick={handleCardClick}
        >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />

            {/* Decorative Top Gradient */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-400 via-fuchsia-500 to-indigo-400 bg-[length:200%_100%] animate-gradient-x" />

            <CardHeader className="p-6 pb-2 relative">
                <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-1">
                            <div className="p-2.5 bg-violet-50 text-violet-600 rounded-xl transition-colors group-hover:bg-violet-100">
                                <Truck className="h-5 w-5" />
                            </div>
                            <h3 className="font-bold text-xl text-slate-800 line-clamp-2 break-words tracking-tight pr-2">
                                {supplier.name}
                            </h3>
                        </div>
                        <Badge variant={supplier.status === 'ACTIVE' ? 'default' : 'secondary'} className={cn(
                            "rounded-lg px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider",
                            supplier.status === 'ACTIVE' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-300'
                        )}>
                            {supplier.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                        </Badge>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl -mr-2 transition-all"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreVertical className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-slate-200">
                            <DropdownMenuItem className="p-2.5 cursor-pointer" onClick={(e) => {
                                e.stopPropagation();
                                onEdit(supplier);
                            }}>
                                <Edit2 className="mr-2 h-4 w-4 text-violet-500" />
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

            <CardContent className="p-6 pt-4 space-y-5 relative">
                <div className="space-y-3">
                    <div className="flex items-center gap-2.5 group/link">
                        <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400 group-hover/link:text-violet-500 transition-colors">
                            <Phone className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-sm font-medium text-slate-600">{supplier.phone ? formatPhone(supplier.phone) : "Não informado"}</span>
                    </div>

                    {supplier.email && (
                        <div className="flex items-center gap-2.5 group/link">
                            <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400 group-hover/link:text-violet-500 transition-colors">
                                <Mail className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-sm font-medium text-slate-600 truncate">{supplier.email}</span>
                        </div>
                    )}

                    {supplier.whatsapp && (
                        <div className="flex items-center gap-2.5 group/link">
                            <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-500">
                                <MessageCircle className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-sm font-bold text-emerald-600">WhatsApp Disponível</span>
                        </div>
                    )}
                </div>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Documento</span>
                        <span className="text-sm font-mono font-bold text-slate-700">
                            {formatCNPJ(supplier.cnpj)}
                        </span>
                    </div>

                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-violet-50 text-violet-600 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <Edit2 className="h-4 w-4" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
