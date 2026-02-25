import { Product } from "@/core/domain/Product";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Edit2, Trash2, AlertTriangle, DollarSign, Box } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface ProductCardProps {
    product: Product;
    onEdit: (product: Product) => void;
    onDelete: (id: string, name: string) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
    const router = useRouter();
    const isLowStock = product.currentStock <= product.minStock;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const handleCardClick = () => {
        router.push(`/products/${product.id}`);
    };

    return (
        <Card 
            className="group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-white border-slate-100 cursor-pointer rounded-2xl"
            onClick={handleCardClick}
        >
            {/* Background Accent */}
            <div className={cn(
                "absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700",
                isLowStock ? "bg-red-500/5" : "bg-blue-500/5"
            )} />

            {/* Decorative Top Gradient */}
            <div className={cn(
                "absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r bg-[length:200%_100%] animate-gradient-x",
                isLowStock ? "from-red-400 via-orange-500 to-red-400" : "from-blue-400 via-cyan-500 to-blue-400"
            )} />

            <CardHeader className="p-4 pb-2 relative z-10">
                <div className="flex items-start gap-3">
                    {/* Ícone com Gradiente */}
                    <div className="relative">
                        <div className={cn(
                            "h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-300 ring-2",
                            isLowStock 
                                ? "bg-gradient-to-br from-red-500 to-orange-600 ring-red-100 group-hover:ring-red-200" 
                                : "bg-gradient-to-br from-blue-500 to-cyan-600 ring-blue-100 group-hover:ring-blue-200"
                        )}>
                            {isLowStock ? <AlertTriangle className="h-6 w-6 text-white" /> : <Package className="h-6 w-6 text-white" />}
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className={cn(
                            "font-bold text-base text-slate-800 line-clamp-2 break-words tracking-tight mb-1 transition-colors",
                            isLowStock ? "group-hover:text-red-600" : "group-hover:text-blue-600"
                        )}>
                            {product.name}
                        </h3>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-2 space-y-2 relative z-10">
                {/* Info Grid com Ícones Coloridos */}
                <div className="grid grid-cols-1 gap-2">
                    {/* Estoque */}
                    <div className={cn(
                        "flex items-center gap-2 p-2 rounded-lg border group/item transition-colors",
                        isLowStock 
                            ? "bg-red-50/50 border-red-100/50 hover:bg-red-50" 
                            : "bg-emerald-50/50 border-emerald-100/50 hover:bg-emerald-50"
                    )}>
                        <div className={cn(
                            "p-1.5 rounded-md",
                            isLowStock ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"
                        )}>
                            <Box className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className={cn(
                                "text-[9px] font-bold uppercase tracking-wider",
                                isLowStock ? "text-red-600" : "text-emerald-600"
                            )}>
                                Estoque {isLowStock && "Crítico"}
                            </div>
                            <div className="text-xs font-bold text-slate-700">
                                {product.currentStock} un (Min: {product.minStock})
                            </div>
                        </div>
                    </div>

                    {/* Preço */}
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50/50 border border-blue-100/50 group/item hover:bg-blue-50 transition-colors">
                        <div className="p-1.5 bg-blue-100 rounded-md text-blue-600">
                            <DollarSign className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">Preço</div>
                            <div className="text-xs font-bold text-slate-700">{formatCurrency(product.price)}</div>
                        </div>
                    </div>
                </div>

                {/* Botões de Ação */}
                <div className="pt-2 flex items-center justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "h-8 w-8 rounded-lg transition-all",
                            isLowStock 
                                ? "text-slate-400 hover:text-blue-600 hover:bg-blue-50" 
                                : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                        )}
                        onClick={(e) => { e.stopPropagation(); onEdit(product); }}
                    >
                        <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        onClick={(e) => { e.stopPropagation(); onDelete(product.id, product.name); }}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
