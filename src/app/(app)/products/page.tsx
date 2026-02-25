"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Search, ArrowRightLeft, AlertTriangle, LayoutGrid, LayoutList, ShoppingCart, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useProducts } from "@/hooks/useProducts";
import { ProductDialog } from "@/components/products/ProductDialog";
import { DeleteProductDialog } from "@/components/products/DeleteProductDialog";
import { ProductCard } from "@/components/products/ProductCard";
import { Product } from "@/core/domain/Product";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SortOption = "name-asc" | "name-desc" | "price-asc" | "price-desc" | "stock-asc" | "stock-desc";
type StockFilter = "all" | "normal" | "critical" | "zero";

export default function ProductsPage() {
    const { products, loading, addProduct, updateProduct, deleteProduct: removeProduct, fetchProducts } = useProducts();
    const [search, setSearch] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [sortBy, setSortBy] = useState<SortOption>("name-asc");
    const [stockFilter, setStockFilter] = useState<StockFilter>("all");

    // Dialog States
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);

    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        fetchProducts(e.target.value);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setDialogOpen(true);
    };

    const handleNew = () => {
        setEditingProduct(undefined);
        setDialogOpen(true);
    };

    const handleDelete = (id: string, name: string) => {
        setProductToDelete({ id, name });
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (productToDelete) {
            await removeProduct(productToDelete.id);
            setDeleteDialogOpen(false);
            setProductToDelete(null);
        }
    };

    // Filtrar e ordenar produtos
    const filteredAndSortedProducts = useMemo(() => {
        let filtered = [...products];

        // Aplicar filtro de estoque
        if (stockFilter === "critical") {
            filtered = filtered.filter(p => p.currentStock <= p.minStock && p.currentStock > 0);
        } else if (stockFilter === "zero") {
            filtered = filtered.filter(p => p.currentStock === 0);
        } else if (stockFilter === "normal") {
            filtered = filtered.filter(p => p.currentStock > p.minStock);
        }

        // Aplicar ordenação
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "name-asc":
                    return a.name.localeCompare(b.name, 'pt-BR');
                case "name-desc":
                    return b.name.localeCompare(a.name, 'pt-BR');
                case "price-asc":
                    return a.price - b.price;
                case "price-desc":
                    return b.price - a.price;
                case "stock-asc":
                    return a.currentStock - b.currentStock;
                case "stock-desc":
                    return b.currentStock - a.currentStock;
                default:
                    return 0;
            }
        });

        return filtered;
    }, [products, sortBy, stockFilter]);

    return (
        <div className="space-y-6">
            <div className="hidden md:flex justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">Produtos</h1>
                    <p className="text-muted-foreground">
                        Gerencie o estoque e produtos para venda/consumo.
                    </p>
                </div>
                <div>
                    <Link href="/products/pos">
                        <Button variant="outline" className="mr-2 bg-white hover:bg-purple-50 text-purple-700 border-purple-200 rounded-xl shadow-sm hover:shadow-md transition-all">
                            <ShoppingCart className="mr-2 h-4 w-4" /> PDV
                        </Button>
                    </Link>
                    <Button onClick={handleNew} className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all">
                        <Plus className="mr-2 h-4 w-4" /> Novo Produto
                    </Button>
                </div>
            </div>

            {/* Mobile Header Action */}
            <div className="md:hidden flex justify-between items-center">
                <h1 className="text-2xl font-bold font-heading">Produtos</h1>
                <Button size="sm" onClick={handleNew} className="bg-purple-600 rounded-lg">
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            <div className="bg-card/50 backdrop-blur-xl p-4 sm:p-6 rounded-2xl border border-white/20 shadow-lg shadow-purple-500/5 flex flex-col md:flex-row gap-4 items-stretch md:items-center transition-all hover:shadow-purple-500/10">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar produtos..."
                        className="pl-9 bg-white/40 border-white/20 focus:bg-white/60 rounded-xl h-11 md:h-10 transition-all"
                        value={search}
                        onChange={handleSearch}
                    />
                </div>
                
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                    <SelectTrigger className="w-full md:w-[200px] bg-white/40 border-white/20 rounded-xl h-11 md:h-10">
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="name-asc">Nome (A-Z)</SelectItem>
                        <SelectItem value="name-desc">Nome (Z-A)</SelectItem>
                        <SelectItem value="price-asc">Menor Preço</SelectItem>
                        <SelectItem value="price-desc">Maior Preço</SelectItem>
                        <SelectItem value="stock-asc">Menor Estoque</SelectItem>
                        <SelectItem value="stock-desc">Maior Estoque</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={stockFilter} onValueChange={(value) => setStockFilter(value as StockFilter)}>
                    <SelectTrigger className="w-full md:w-[180px] bg-white/40 border-white/20 rounded-xl h-11 md:h-10">
                        <SelectValue placeholder="Filtrar estoque" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="critical">Crítico</SelectItem>
                        <SelectItem value="zero">Zerado</SelectItem>
                    </SelectContent>
                </Select>

                <div className="flex items-center gap-1 bg-white/40 border border-white/20 p-1 rounded-xl h-11 md:h-10">
                    <Button
                        variant={viewMode === "list" ? "secondary" : "ghost"}
                        size="icon"
                        onClick={() => setViewMode("list")}
                        className={`h-8 w-8 rounded-lg ${viewMode === "list" ? "bg-white shadow-sm" : ""}`}
                    >
                        <LayoutList className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === "grid" ? "secondary" : "ghost"}
                        size="icon"
                        onClick={() => setViewMode("grid")}
                        className={`h-8 w-8 rounded-lg ${viewMode === "grid" ? "bg-white shadow-sm" : ""}`}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-[200px] rounded-2xl bg-muted/20 animate-pulse" />
                    ))}
                </div>
            ) : (
                <>
                    {viewMode === "grid" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                            {filteredAndSortedProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white/40 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-sm">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-white/10 hover:bg-white/20">
                                        <TableHead className="w-[35%] font-heading text-slate-700">Produto</TableHead>
                                        <TableHead className="font-heading text-slate-700">Estoque</TableHead>
                                        <TableHead className="font-heading text-slate-700">Preço</TableHead>
                                        <TableHead className="text-right font-heading text-slate-700">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAndSortedProducts.map((product) => {
                                        const isLowStock = product.currentStock <= product.minStock;
                                        const isZeroStock = product.currentStock === 0;
                                        return (
                                            <TableRow key={product.id} className="cursor-pointer border-white/10 hover:bg-white/40 transition-all group" onClick={() => window.location.href = `/products/${product.id}`}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "relative h-12 w-12 rounded-xl flex items-center justify-center shadow-sm transition-all group-hover:scale-105",
                                                            isLowStock 
                                                                ? "bg-gradient-to-br from-red-500 to-orange-500" 
                                                                : "bg-gradient-to-br from-blue-500 to-cyan-500"
                                                        )}>
                                                            <ShoppingCart className="h-6 w-6 text-white" />
                                                            {isLowStock && (
                                                                <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-slate-800 group-hover:text-purple-700 transition-colors">
                                                                {product.name}
                                                            </div>
                                                            {isLowStock && (
                                                                <Badge variant="destructive" className="mt-1 text-[10px] px-1.5 py-0 h-4 rounded animate-pulse">
                                                                    {isZeroStock ? "SEM ESTOQUE" : "ESTOQUE CRÍTICO"}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className={cn(
                                                            "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold",
                                                            isLowStock 
                                                                ? "bg-red-50 text-red-700 border border-red-200" 
                                                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                        )}>
                                                            <AlertTriangle className={cn("h-3.5 w-3.5", isLowStock ? "block" : "hidden")} />
                                                            <span>{product.currentStock} un</span>
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Mín: {product.minStock} un
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200 text-sm font-semibold">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all" onClick={(e) => { e.preventDefault(); handleEdit(product); }}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all" onClick={(e) => { e.preventDefault(); handleDelete(product.id, product.name); }}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {filteredAndSortedProducts.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-white/40 backdrop-blur-xl rounded-3xl border border-white/20 border-dashed mt-6">
                            <div className="mx-auto h-16 w-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                                <Search className="h-8 w-8 text-purple-300" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground">Nenhum produto encontrado</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                                Tente ajustar sua busca ou filtros, ou adicione um novo produto ao estoque.
                            </p>
                            <Button onClick={handleNew} variant="outline" className="mt-6 rounded-xl border-purple-200 text-purple-700 hover:bg-purple-50">
                                Adicionar Produto
                            </Button>
                        </div>
                    )}
                </>
            )}

            <ProductDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                product={editingProduct}
                onSubmit={editingProduct ? (data) => updateProduct(editingProduct.id, data) : addProduct}
            />

            <DeleteProductDialog
                isOpen={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                productId={productToDelete?.id || ""}
                productName={productToDelete?.name || ""}
                onConfirm={confirmDelete}
            />
        </div>
    );
}
