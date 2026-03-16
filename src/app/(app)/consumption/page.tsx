"use client";

import { useState } from "react";
import { Plus, Search, LayoutGrid, LayoutList, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUsageProducts } from "@/hooks/useUsageProducts";
import { UsageProductDialog } from "@/components/consumption/UsageProductDialog";
import { DeleteUsageProductDialog } from "@/components/consumption/DeleteUsageProductDialog";
import { UsageProductCard } from "@/components/consumption/UsageProductCard";
import { UsageProduct } from "@/core/domain/UsageProduct";
import { toast } from "sonner";

export default function ConsumptionPage() {
    const { products, loading, addProduct, updateProduct, deleteProduct, fetchProducts } = useUsageProducts();
    const [search, setSearch] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<UsageProduct | undefined>(undefined);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        fetchProducts(e.target.value);
    };

    const handleEdit = (product: UsageProduct) => {
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
            await deleteProduct(productToDelete.id);
            setDeleteDialogOpen(false);
            setProductToDelete(null);
        }
    };

    const handleReset = async (product: UsageProduct) => {
        try {
            await updateProduct(product.id, {
                currentConsumed: 0,
                totalUnitsConsumed: product.totalUnitsConsumed + 1,
                stockQuantity: Math.max((product.stockQuantity ?? 1) - 1, 0),
            });
            toast.success(`Novo ${product.unitLabel} iniciado!`);
        } catch {
            toast.error("Erro ao resetar consumo");
        }
    };

    return (
        <div className="space-y-6">
            <div className="hidden md:flex justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">Controle de Consumo</h1>
                    <p className="text-muted-foreground">Gerencie produtos de uso interno (tintas, oxidantes, etc.)</p>
                </div>
                <Button onClick={handleNew} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 transition-all">
                    <Plus className="mr-2 h-4 w-4" /> Novo Produto
                </Button>
            </div>

            <div className="md:hidden flex justify-between items-center">
                <h1 className="text-2xl font-bold font-heading">Consumo</h1>
                <Button size="sm" onClick={handleNew} className="bg-teal-600 rounded-lg">
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            <div className="bg-card/50 backdrop-blur-xl p-4 sm:p-6 rounded-2xl border border-white/20 shadow-lg shadow-teal-500/5 flex flex-col md:flex-row gap-4 items-stretch md:items-center transition-all hover:shadow-teal-500/10">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar produtos de consumo..."
                        className="pl-9 bg-white/40 border-white/20 focus:bg-white/60 rounded-xl h-11 md:h-10 transition-all"
                        value={search}
                        onChange={handleSearch}
                    />
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-[250px] rounded-2xl bg-muted/20 animate-pulse" />
                    ))}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                        {products.map((product) => (
                            <UsageProductCard
                                key={product.id}
                                product={product}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onReset={handleReset}
                            />
                        ))}
                    </div>

                    {products.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-white/40 backdrop-blur-xl rounded-3xl border border-white/20 border-dashed mt-6">
                            <div className="mx-auto h-16 w-16 bg-teal-50 rounded-full flex items-center justify-center mb-4">
                                <Droplets className="h-8 w-8 text-teal-300" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground">Nenhum produto de consumo</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                                Cadastre tintas, oxidantes e outros produtos usados nos serviços.
                            </p>
                            <Button onClick={handleNew} variant="outline" className="mt-6 rounded-xl border-teal-200 text-teal-700 hover:bg-teal-50">
                                Adicionar Produto
                            </Button>
                        </div>
                    )}
                </>
            )}

            <UsageProductDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                product={editingProduct}
                onSubmit={editingProduct ? (data) => updateProduct(editingProduct.id, data) : addProduct}
            />

            <DeleteUsageProductDialog
                isOpen={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                productName={productToDelete?.name || ""}
                onConfirm={confirmDelete}
            />
        </div>
    );
}
