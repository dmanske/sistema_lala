"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Search, ArrowRightLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useProducts } from "@/hooks/useProducts";
import { ProductDialog } from "@/components/products/ProductDialog";
import { DeleteProductDialog } from "@/components/products/DeleteProductDialog";
import { Product } from "@/core/domain/Product";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function ProductsPage() {
    const { products, loading, addProduct, updateProduct, deleteProduct: removeProduct, fetchProducts } = useProducts();
    const [search, setSearch] = useState("");

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
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
                    <p className="text-muted-foreground">Gerencie o estoque e produtos para venda/consumo.</p>
                </div>
                <Button onClick={handleNew} className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Plus className="mr-2 h-4 w-4" /> Novo Produto
                </Button>
            </div>

            <div className="flex items-center gap-2 max-w-sm">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar produtos..."
                    value={search}
                    onChange={handleSearch}
                    className="flex-1"
                />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-40 rounded-xl bg-muted/20 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => {
                        const isLowStock = product.currentStock <= product.minStock;
                        return (
                            <Link href={`/products/${product.id}`} key={product.id}>
                                <Card className={cn("hover:shadow-md transition-shadow group relative overflow-hidden cursor-pointer", isLowStock && "border-red-200 bg-red-50/10")}>
                                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10" onClick={(e) => e.stopPropagation()}>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-neutral-500 hover:text-purple-600" onClick={(e) => { e.preventDefault(); handleEdit(product); }}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-neutral-500 hover:text-red-600" onClick={(e) => { e.preventDefault(); handleDelete(product.id, product.name); }}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-lg truncate pr-8">{product.name}</CardTitle>
                                            {isLowStock && <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />}
                                        </div>
                                        <CardDescription>Min: {product.minStock}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex justify-between items-end mt-2">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-muted-foreground">Preço Venda</span>
                                                <span className="text-lg font-bold text-neutral-800 dark:text-neutral-200">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs text-muted-foreground">Estoque</span>
                                                <span className={cn("text-2xl font-bold", isLowStock ? "text-red-600" : "text-green-600")}>
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
