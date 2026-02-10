
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
// Assuming hooks location
import { useProducts } from "@/hooks/useProducts"
import { Product } from "@/core/domain/Product"
import { toast } from "sonner"

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
        onAdd(selectedProduct, qty, price)
        onOpenChange(false)
        // Reset
        setSelectedProduct(null)
        setQty(1)
        setPrice(0)
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
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedProduct?.id === product.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {product.name} (Estoque: {product.currentStock})
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label>Quantidade</Label>
                            <Input
                                type="number"
                                min={1}
                                value={qty}
                                onChange={(e) => setQty(Number(e.target.value))}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>Valor Unit. (R$)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(Number(e.target.value))}
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
                    <Button onClick={handleSubmit}>Confirmar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
