"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Search, ArrowRightLeft, AlertTriangle, LayoutGrid, LayoutList } from "lucide-react";
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
import { useProducts } from "@/hooks/useProducts";
import { ProductDialog } from "@/components/products/ProductDialog";
import { DeleteProductDialog } from "@/components/products/DeleteProductDialog";
import { Product } from "@/core/domain/Product";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function ProductsPage() {
    const { products, loading, addProduct, updateProduct, deleteProduct: removeProduct, fetchProducts } = useProducts();
    const [search, setSearch] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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

    return (
        <div className="space-y-6">
            <div className="hidden md:flex justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">Produtos</h1>
                    <p className="text-muted-foreground">
                        Gerencie o estoque e produtos para venda/consumo.
                    </p>
                </div>
                <Button onClick={handleNew} className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all">
                    <Plus className="mr-2 h-4 w-4" /> Novo Produto
                </Button>
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
                            {products.map((product) => {
                                const isLowStock = product.currentStock <= product.minStock;
                                return (
                                    <Link href={`/products/${product.id}`} key={product.id}>
                                        <Card className={cn(
                                            "hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 group relative overflow-hidden cursor-pointer border-white/20 bg-white/60 backdrop-blur-lg rounded-2xl",
                                            isLowStock && "border-red-200 bg-red-50/10"
                                        )}>
                                            <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10" onClick={(e) => e.stopPropagation()}>
                                                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-lg bg-white/80 hover:bg-white hover:text-purple-600 shadow-sm" onClick={(e) => { e.preventDefault(); handleEdit(product); }}>
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-lg bg-white/80 hover:bg-red-50 hover:text-red-600 shadow-sm" onClick={(e) => { e.preventDefault(); handleDelete(product.id, product.name); }}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>

                                            <CardHeader className="pb-2 relative">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="p-2 bg-purple-100/50 rounded-xl text-purple-600">
                                                        <ArrowRightLeft className="h-5 w-5" />
                                                    </div>
                                                    {isLowStock && (
                                                        <Badge variant="destructive" className="animate-pulse shadow-sm rounded-lg px-2 py-0.5 text-[10px] uppercase tracking-wider">
                                                            Crítico
                                                        </Badge>
                                                    )}
                                                </div>
                                                <CardTitle className="text-lg font-bold font-heading truncate pr-2 text-foreground/90">{product.name}</CardTitle>
                                                <CardDescription className="flex items-center gap-2 text-xs font-medium">
                                                    <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-500">Min: {product.minStock}</span>
                                                </CardDescription>
                                            </CardHeader>

                                            <CardContent>
                                                <div className="flex justify-between items-end mt-4 pt-4 border-t border-purple-100/50">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Preço</span>
                                                        <span className="text-lg font-bold text-slate-800">
                                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Estoque</span>
                                                        <span className={cn("text-2xl font-bold leading-none", isLowStock ? "text-red-500" : "text-emerald-500")}>
                                                            {product.currentStock}
                                                        </span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="bg-white/40 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-sm">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-white/10 hover:bg-white/20">
                                        <TableHead className="w-[40%] font-heading text-slate-700">Produto</TableHead>
                                        <TableHead className="font-heading text-slate-700">Status</TableHead>
                                        <TableHead className="font-heading text-slate-700">Preço</TableHead>
                                        <TableHead className="font-heading text-slate-700">Estoque</TableHead>
                                        <TableHead className="text-right font-heading text-slate-700">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.map((product) => {
                                        const isLowStock = product.currentStock <= product.minStock;
                                        return (
                                            <TableRow key={product.id} className="cursor-pointer border-white/10 hover:bg-white/40 transition-colors" onClick={() => window.location.href = `/products/${product.id}`}>
                                                <TableCell className="font-medium text-slate-800">
                                                    {product.name}
                                                </TableCell>
                                                <TableCell>
                                                    {isLowStock ? (
                                                        <Badge variant="destructive" className="animate-pulse shadow-sm rounded-lg px-2 py-0.5 text-[10px] uppercase tracking-wider">
                                                            Crítico
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                                            Normal
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-semibold text-slate-700">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                                                </TableCell>
                                                <TableCell>
                                                    <span className={cn("font-bold", isLowStock ? "text-red-600" : "text-emerald-600")}>
                                                        {product.currentStock}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground ml-1">
                                                        (Min: {product.minStock})
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-purple-600 hover:bg-purple-50" onClick={(e) => { e.preventDefault(); handleEdit(product); }}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50" onClick={(e) => { e.preventDefault(); handleDelete(product.id, product.name); }}>
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

                    {products.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-white/40 backdrop-blur-xl rounded-3xl border border-white/20 border-dashed mt-6">
                            <div className="mx-auto h-16 w-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                                <Search className="h-8 w-8 text-purple-300" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground">Nenhum produto encontrado</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                                Tente ajustar sua busca ou adicione um novo produto ao estoque.
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
