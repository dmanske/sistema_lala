
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, Package, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
// Assuming hooks location
import { useProducts } from "@/hooks/useProducts"
import { Product } from "@/core/domain/Product"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

interface AddProductDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onAdd: (product: Product, qty: number, price: number) => void
}

export function AddProductDialog({ open, onOpenChange, onAdd }: AddProductDialogProps) {
    const { products } = useProducts()
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [qty, setQty] = useState(1)
    const [price, setPrice] = useState(0)
    const [comboboxOpen, setComboboxOpen] = useState(false)

    const handleSelect = (product: Product) => {
        setSelectedProduct(product)
        setPrice(product.price ?? 0)
        setComboboxOpen(false)
    }

    const handleSubmit = () => {
        if (!selectedProduct) {
            toast.error("Selecione um produto")
            return
        }
        if (qty <= 0) {
            toast.error("Quantidade inválida")
            return
        }
        if (price < 0) {
            toast.error("Preço inválido")
            return
        }
        // Validate stock
        if (selectedProduct.currentStock < qty) {
            toast.error(`Estoque insuficiente! Disponível: ${selectedProduct.currentStock}`)
            return
        }
        if (selectedProduct.currentStock === 0) {
            toast.error("Produto sem estoque!")
            return
        }
        onAdd(selectedProduct, qty, price)
        onOpenChange(false)
        // Reset
        setSelectedProduct(null)
        setQty(1)
        setPrice(0)
    }

    const getStockBadge = (product: Product) => {
        if (product.currentStock === 0) {
            return (
                <Badge variant="destructive" className="ml-2">
                    Sem Estoque
                </Badge>
            )
        }
        if (product.currentStock <= (product.minStock || 0)) {
            return (
                <Badge variant="outline" className="ml-2 border-yellow-500 text-yellow-700 bg-yellow-50">
                    Estoque Baixo
                </Badge>
            )
        }
        return null
    }

    const isProductOutOfStock = (product: Product) => {
        return product.currentStock === 0
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Adicionar Produto</DialogTitle>
                    <DialogDescription className="text-slate-500">
                        Busque e adicione produtos ao pedido.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* Product Select */}
                    <div className="flex flex-col gap-2">
                        <Label>Produto</Label>
                        <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={comboboxOpen}
                                    className="w-full justify-between"
                                >
                                    {selectedProduct ? selectedProduct.name : "Selecione um produto..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[400px] p-0">
                                <Command>
                                    <CommandInput placeholder="Buscar produto..." />
                                    <CommandList>
                                        <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                                        <CommandGroup>
                                            {products.map((product) => (
                                                <CommandItem
                                                    key={product.id}
                                                    value={product.name}
                                                    onSelect={() => handleSelect(product)}
                                                    disabled={isProductOutOfStock(product)}
                                                    className={cn(
                                                        isProductOutOfStock(product) && "opacity-50 cursor-not-allowed"
                                                    )}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedProduct?.id === product.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    <div className="flex items-center justify-between w-full">
                                                        <span>{product.name}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className={cn(
                                                                "text-xs",
                                                                product.currentStock === 0 ? "text-red-600" :
                                                                product.currentStock <= (product.minStock || 0) ? "text-yellow-600" :
                                                                "text-gray-500"
                                                            )}>
                                                                <Package className="h-3 w-3 inline mr-1" />
                                                                {product.currentStock}
                                                            </span>
                                                            {getStockBadge(product)}
                                                        </div>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Stock Info Card */}
                    {selectedProduct && (
                        <div className={cn(
                            "p-3 rounded-lg border",
                            selectedProduct.currentStock === 0 ? "bg-red-50 border-red-200" :
                            selectedProduct.currentStock <= (selectedProduct.minStock || 0) ? "bg-yellow-50 border-yellow-200" :
                            "bg-green-50 border-green-200"
                        )}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Package className={cn(
                                        "h-4 w-4",
                                        selectedProduct.currentStock === 0 ? "text-red-600" :
                                        selectedProduct.currentStock <= (selectedProduct.minStock || 0) ? "text-yellow-600" :
                                        "text-green-600"
                                    )} />
                                    <span className="text-sm font-medium">Estoque Atual:</span>
                                </div>
                                <span className={cn(
                                    "text-sm font-bold",
                                    selectedProduct.currentStock === 0 ? "text-red-600" :
                                    selectedProduct.currentStock <= (selectedProduct.minStock || 0) ? "text-yellow-600" :
                                    "text-green-600"
                                )}>
                                    {selectedProduct.currentStock} unidades
                                </span>
                            </div>
                            {selectedProduct.currentStock > 0 && qty > 0 && (
                                <div className="mt-2 text-xs text-gray-600">
                                    Restante após venda: <span className="font-medium">{selectedProduct.currentStock - qty} unidades</span>
                                </div>
                            )}
                            {selectedProduct.currentStock <= (selectedProduct.minStock || 0) && selectedProduct.currentStock > 0 && (
                                <div className="mt-2 flex items-center gap-1 text-xs text-yellow-700">
                                    <AlertTriangle className="h-3 w-3" />
                                    <span>Estoque abaixo do mínimo ({selectedProduct.minStock})</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label>Quantidade</Label>
                            <Input
                                type="number"
                                min={1}
                                max={selectedProduct?.currentStock || undefined}
                                value={qty}
                                onChange={(e) => setQty(Number(e.target.value))}
                                disabled={!selectedProduct || selectedProduct.currentStock === 0}
                            />
                            {selectedProduct && qty > selectedProduct.currentStock && (
                                <span className="text-xs text-red-600">Quantidade maior que estoque!</span>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>Valor Unit. (R$)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(Number(e.target.value))}
                                disabled={!selectedProduct}
                            />
                        </div>
                    </div>
                    {/* Subtotal preview */}
                    {selectedProduct && (
                        <div className="text-right text-sm text-muted-foreground">
                            Subtotal: R$ {(qty * price).toFixed(2)}
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button 
                        onClick={handleSubmit}
                        disabled={!selectedProduct || selectedProduct.currentStock === 0 || qty > selectedProduct.currentStock}
                    >
                        Confirmar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
