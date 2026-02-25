import { Service } from "@/core/domain/Service";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Edit2, Trash2, Sparkles, Scissors, DollarSign } from "lucide-react";
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
        <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-white border-slate-100 rounded-2xl">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />

            {/* Decorative Top Gradient */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-[length:200%_100%] animate-gradient-x" />

            <CardHeader className="p-4 pb-2 relative">
                <div className="flex items-start gap-3">
                    {/* Ícone com Gradiente */}
                    <div className="relative">
                        <div className="h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-300 ring-2 bg-gradient-to-br from-purple-500 to-pink-600 ring-purple-100 group-hover:ring-purple-200">
                            <Scissors className="h-6 w-6 text-white" />
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base text-slate-800 line-clamp-2 break-words tracking-tight mb-1 group-hover:text-purple-600 transition-colors">
                            {service.name}
                        </h3>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-2 space-y-2 relative">
                {/* Info Grid com Ícones Coloridos */}
                <div className="grid grid-cols-1 gap-2">
                    {/* Duração */}
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50/50 border border-blue-100/50 group/item hover:bg-blue-50 transition-colors">
                        <div className="p-1.5 bg-blue-100 rounded-md text-blue-600">
                            <Clock className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">Duração</div>
                            <div className="text-xs font-bold text-slate-700">{service.duration} minutos</div>
                        </div>
                    </div>

                    {/* Preço */}
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50/50 border border-emerald-100/50 group/item hover:bg-emerald-50 transition-colors">
                        <div className="p-1.5 bg-emerald-100 rounded-md text-emerald-600">
                            <DollarSign className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Preço</div>
                            <div className="text-xs font-bold text-slate-700">{formatCurrency(service.price)}</div>
                        </div>
                    </div>

                    {/* Comissão */}
                    {service.commission > 0 && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-50/50 border border-orange-100/50 group/item hover:bg-orange-50 transition-colors">
                            <div className="p-1.5 bg-orange-100 rounded-md text-orange-600">
                                <Sparkles className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[9px] font-bold text-orange-600 uppercase tracking-wider">Comissão</div>
                                <div className="text-xs font-bold text-slate-700">{service.commission}%</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Botões de Ação */}
                <div className="pt-2 flex items-center justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                        onClick={(e) => { e.stopPropagation(); onEdit(service); }}
                    >
                        <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        onClick={(e) => { e.stopPropagation(); onDelete(service.id, service.name); }}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
