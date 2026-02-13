import { Product } from "@/core/domain/Product";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, MoreVertical, Edit2, Trash2, AlertTriangle, ArrowRight } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ProductCardProps {
    product: Product;
    onEdit: (product: Product) => void;
    onDelete: (id: string, name: string) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
    const isLowStock = product.currentStock <= product.minStock;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    return (
        <Card className={cn(
            "group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800",
            isLowStock && "border-l-4 border-l-red-500"
        )}>
            {/* Decorative Top Gradient */}
            <div className={cn(
                "absolute top-0 left-0 w-full h-1",
                isLowStock ? "hidden" : "bg-gradient-to-r from-blue-400 to-cyan-500"
            )} />

            <Link href={`/products/${product.id}`} className="absolute inset-0 z-0" />

            <CardHeader className="p-5 pb-2 relative z-10">
                <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-2">
                            <div className={cn(
                                "p-2 rounded-lg",
                                isLowStock ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" : "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                            )}>
                                {isLowStock ? <AlertTriangle className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                            </div>
                            <h3 className="font-bold text-lg text-slate-900 line-clamp-2 break-words dark:text-slate-100">
                                {product.name}
                            </h3>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 -mr-2 relative z-20">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); }}>
                                <Link href={`/products/${product.id}`} className="flex items-center w-full">
                                    <ArrowRight className="mr-2 h-3.5 w-3.5" />
                                    Ver Detalhes
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(product); }}>
                                <Edit2 className="mr-2 h-3.5 w-3.5" />
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={(e) => { e.stopPropagation(); onDelete(product.id, product.name); }}
                            >
                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                                Excluir
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>

            <CardContent className="p-5 pt-2 space-y-4 relative z-10">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded-md border",
                        isLowStock
                            ? "bg-red-50 border-red-100 text-red-700 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400"
                            : "bg-slate-50 border-slate-100 dark:bg-slate-800 dark:border-slate-700"
                    )}>
                        <Package className="h-3.5 w-3.5" />
                        <span className="font-medium">{product.currentStock} em estoque</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Min: {product.minStock}</span>
                </div>

                <div className="flex items-end justify-between mt-2">
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                            {formatCurrency(product.price)}
                        </span>
                        <span className="text-xs text-muted-foreground">/ un</span>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 -mb-1 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100"
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            onEdit(product);
                        }}
                    >
                        <Edit2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
