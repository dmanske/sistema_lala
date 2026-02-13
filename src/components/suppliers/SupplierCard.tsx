import { Supplier } from "@/core/domain/Supplier";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Phone,
    MessageCircle,
    Mail,
    Truck,
    MoreVertical,
    Edit2,
    Trash2,
    ExternalLink,
    Building2,
    Calendar
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatPhone } from "@/core/formatters/phone";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SupplierCardProps {
    supplier: Supplier;
    onEdit?: (supplier: Supplier) => void;
    onDelete?: (id: string, name: string) => void;
}

export function SupplierCard({ supplier, onEdit, onDelete }: SupplierCardProps) {
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
        <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800">
            {/* Decorative Top Gradient */}
            <div className={cn(
                "absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-amber-500",
                supplier.status === 'INACTIVE' && "from-slate-300 to-slate-400"
            )} />

            <Link href={`/suppliers/${supplier.id}`} className="absolute inset-0 z-0" />

            <CardHeader className="p-5 pb-2 relative z-10">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="relative flex-shrink-0">
                            <Avatar className="h-14 w-14 border-2 border-white shadow-sm dark:border-slate-800 transition-transform group-hover:scale-105">
                                <AvatarFallback className={cn(
                                    "text-lg font-bold",
                                    supplier.status === 'ACTIVE' ? "bg-orange-50 text-orange-600 dark:bg-orange-950/40" : "bg-slate-100 text-slate-500"
                                )}>
                                    {getInitials(supplier.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className={cn(
                                "absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white dark:border-slate-900 shadow-sm",
                                supplier.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-300'
                            )} />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg text-slate-900 truncate dark:text-slate-100 group-hover:text-orange-600 transition-colors">
                                {supplier.name}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                <Building2 className="h-3 w-3" />
                                <span>{supplier.cnpj ? formatCNPJ(supplier.cnpj) : "Sem CNPJ"}</span>
                            </div>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 -mr-2 relative z-20">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/suppliers/${supplier.id}`} className="flex items-center w-full">
                                    <ExternalLink className="mr-2 h-3.5 w-3.5" />
                                    Visualizar Perfil
                                </Link>
                            </DropdownMenuItem>
                            {onEdit && (
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(supplier); }}>
                                    <Edit2 className="mr-2 h-3.5 w-3.5" />
                                    Editar
                                </DropdownMenuItem>
                            )}
                            {onDelete && (
                                <DropdownMenuItem
                                    className="text-red-600 focus:text-red-600"
                                    onClick={(e) => { e.stopPropagation(); onDelete(supplier.id, supplier.name); }}
                                >
                                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                                    Excluir
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>

            <CardContent className="p-5 pt-3 space-y-4 relative z-10">
                <div className="grid grid-cols-1 gap-2.5">
                    {(supplier.phone || supplier.whatsapp) && (
                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                            <div className={cn(
                                "p-1.5 rounded-md",
                                supplier.whatsapp ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20" : "bg-blue-50 text-blue-600 dark:bg-blue-950/20"
                            )}>
                                {supplier.whatsapp ? <MessageCircle className="h-3.5 w-3.5" /> : <Phone className="h-3.5 w-3.5" />}
                            </div>
                            <span className="font-medium whitespace-nowrap">
                                {formatPhone(supplier.whatsapp || supplier.phone || '')}
                            </span>
                        </div>
                    )}

                    {supplier.email && (
                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                            <div className="p-1.5 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/20">
                                <Mail className="h-3.5 w-3.5" />
                            </div>
                            <span className="truncate">{supplier.email}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                        <Calendar className="h-3 w-3" />
                        <span>Desde {format(new Date(supplier.createdAt), 'MMMM yyyy', { locale: ptBR })}</span>
                    </div>

                    {onEdit && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-orange-600 bg-orange-50 hover:bg-orange-100 hover:text-orange-700 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100"
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onEdit(supplier);
                            }}
                        >
                            <Edit2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
