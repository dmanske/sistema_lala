import { Service } from "@/core/domain/Service";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, MoreVertical, Edit2, Trash2, Sparkles, Scissors } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
    service: Service;
    onEdit: (service: Service) => void;
    onDelete: (id: string, name: string) => void;
}

export function ServiceCard({ service, onEdit, onDelete }: ServiceCardProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    return (
        <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800">
            {/* Decorative Top Gradient */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-500" />

            <CardHeader className="p-5 pb-2">
                <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-2">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg dark:bg-purple-900/20 dark:text-purple-400">
                                <Scissors className="h-4 w-4" />
                            </div>
                            <h3 className="font-bold text-lg text-slate-900 line-clamp-2 break-words dark:text-slate-100">
                                {service.name}
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
                            <DropdownMenuItem onClick={() => onEdit(service)}>
                                <Edit2 className="mr-2 h-3.5 w-3.5" />
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => onDelete(service.id, service.name)}
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
                        <Clock className="h-3.5 w-3.5 text-slate-500" />
                        <span>{service.duration} min</span>
                    </div>
                    {service.commission > 0 && (
                        <div className="flex items-center gap-1.5 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-100 text-orange-700 dark:bg-orange-900/20 dark:border-orange-900/30 dark:text-orange-400">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>{service.commission}% comissão</span>
                        </div>
                    )}
                </div>

                <div className="flex items-end justify-between mt-2">
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                            {formatCurrency(service.price)}
                        </span>
                        <span className="text-xs text-muted-foreground">/ serviço</span>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-purple-600 bg-purple-50 hover:bg-purple-100 hover:text-purple-700 -mb-1 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(service);
                        }}
                    >
                        <Edit2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
