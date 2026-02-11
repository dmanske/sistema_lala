"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Package,
    ArrowRightLeft,
    AlertTriangle,
    Clock,
    DollarSign,
    Percent,
    TrendingUp,
    Store,
    Loader2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Product, ProductMovement } from "@/core/domain/Product";
import { useProducts } from "@/hooks/useProducts";
import { StockAdjustmentDialog } from "@/components/products/StockAdjustmentDialog";
import { cn } from "@/lib/utils";

export default function ProductProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { products, getProductMovements, updateProduct, addMovement } = useProducts();
    const [product, setProduct] = useState<Product | undefined>(undefined);
    const [movements, setMovements] = useState<ProductMovement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stockDialogOpen, setStockDialogOpen] = useState(false);

    useEffect(() => {
        const fetchProductData = async () => {
            if (!params.id) return;
            const foundProduct = products.find(p => p.id === params.id);
            if (!foundProduct) {
                // Se não encontrar no estado atual (pode ser recarregamento), poderia buscar do repositório
                // Mas o hook useProducts já carrega tudo. Se não tá lá, não existe ou tá carregando.
                // Vamos dar um tempo curto ou redirecionar se products já carregou
                if (products.length > 0) {
                    router.push("/products");
                }
                return;
            }
            setProduct(foundProduct);

            // Carregar Movimentações
            const moves = await getProductMovements(foundProduct.id);
            // Ordenar por data decrescente
            setMovements(moves.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

            setIsLoading(false);
        };

        fetchProductData();
    }, [params.id, products, router, getProductMovements]);

    if (isLoading || !product) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const isLowStock = product.currentStock <= product.minStock;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header / Nav */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-white/50">
                    <Link href="/products">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight font-heading text-foreground">Perfil do Produto</h1>
                    <p className="text-sm text-muted-foreground">Gerencie estoque e visualize o histórico.</p>
                </div>
            </div>

            {/* Product Overview Card */}
            <Card className="border-none bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-xl shadow-xl shadow-purple-500/5 overflow-hidden">
                <div className="h-24 bg-gradient-to-r from-purple-600/10 via-indigo-600/10 to-transparent relative">
                    <div className="absolute top-4 right-4 flex gap-2">
                        {isLowStock && (
                            <Badge variant="destructive" className="animate-pulse shadow-sm">
                                <AlertTriangle className="h-3 w-3 mr-1" /> Estoque Crítico
                            </Badge>
                        )}
                        <Badge variant="outline" className="bg-white/50 backdrop-blur-md">
                            {product.minStock} Min
                        </Badge>
                    </div>
                </div>
                <CardContent className="relative pt-0 px-6 sm:px-10 pb-8">
                    <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 w-full -mt-12">
                        <div className="flex items-end gap-6">
                            <div className="h-24 w-24 rounded-2xl bg-white shadow-lg flex items-center justify-center border-4 border-white">
                                <Package className="h-10 w-10 text-purple-600" />
                            </div>
                            <div className="space-y-1 mb-1">
                                <h2 className="text-3xl font-bold font-heading text-foreground">{product.name}</h2>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" /> Atualizado: {product.updatedAt ? format(new Date(product.updatedAt), "dd/MM/yyyy HH:mm") : "-"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                            <div className="text-right">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold block mb-1">Estoque Atual</span>
                                <span className={cn("text-4xl font-bold", isLowStock ? "text-red-600" : "text-emerald-600")}>
                                    {product.currentStock}
                                </span>
                            </div>
                            <Button
                                onClick={() => setStockDialogOpen(true)}
                                className="bg-purple-600 hover:bg-purple-700 text-white shadow-md rounded-xl"
                            >
                                <ArrowRightLeft className="mr-2 h-4 w-4" /> Movimentar Estoque
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Financial Details */}
                <Card className="lg:col-span-1 border-slate-100 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-green-600" /> Financeiro
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground uppercase">Custo</span>
                                <div className="font-semibold text-slate-700">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.cost)}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground uppercase">Venda</span>
                                <div className="font-bold text-slate-900 text-lg">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground uppercase">Comissão</span>
                                <div className="font-medium text-orange-600">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.commission)}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground uppercase">Valor Líquido</span>
                                <div className="font-bold text-emerald-600">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.netValue || (product.price - product.commission))}
                                </div>
                            </div>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground uppercase">Lucro (R$)</span>
                                <div className="font-medium text-green-700">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.profitAmount)}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground uppercase">Margem (%)</span>
                                <div className="font-medium text-green-700 flex items-center">
                                    {product.profitPercentage}% <TrendingUp className="h-3 w-3 ml-1" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stock History */}
                <Card className="lg:col-span-2 border-slate-100 shadow-sm flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Store className="h-5 w-5 text-purple-600" /> Histórico de Movimentações
                        </CardTitle>
                        <CardDescription>Registro completo de entradas e saídas.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto max-h-[400px]">
                        {movements.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">
                                Nenhuma movimentação registrada.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {movements.map((move) => (
                                    <div key={move.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "h-10 w-10 rounded-full flex items-center justify-center font-bold",
                                                move.type === 'IN' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                            )}>
                                                {move.type === 'IN' ? "+" : "-"}
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-800">
                                                    {move.referenceType === 'PURCHASE' && move.referenceId ? (
                                                        <Link href={`/purchases/${move.referenceId}`} className="hover:underline text-primary">
                                                            {move.reason}
                                                        </Link>
                                                    ) : (
                                                        move.reason
                                                    )}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {format(new Date(move.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={cn(
                                                "font-bold text-lg",
                                                move.type === 'IN' ? "text-green-600" : "text-red-600"
                                            )}>
                                                {move.type === 'IN' ? "+" : "-"}{move.quantity}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {product && (
                <StockAdjustmentDialog
                    product={product}
                    open={stockDialogOpen}
                    onOpenChange={setStockDialogOpen}
                    onSubmit={async (data) => {
                        await addMovement({ ...data, productId: product.id });
                        // Refresh logic is reactive via useProducts context usually, but for local state we might need to force update if context isn't enough
                        // Assuming useProducts context updates 'products' and triggers re-render here.
                    }}
                />
            )}
        </div>
    );
}
