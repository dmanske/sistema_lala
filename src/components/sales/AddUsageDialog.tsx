"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Droplets, Plus, Trash2, AlertTriangle } from "lucide-react"
import { UsageProduct, UsageProductLog } from "@/core/domain/UsageProduct"

interface UsageItem {
    usageProductId: string
    amountUsed: number
    notes: string
}

interface AddUsageDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    usageProducts: UsageProduct[]
    lastFormula: UsageProductLog[] | null
    onConfirm: (items: UsageItem[], formulaChanged: boolean, formulaChangeReason: string) => void
    initialItems?: UsageItem[]
}

export function AddUsageDialog({ open, onOpenChange, usageProducts, lastFormula, onConfirm, initialItems }: AddUsageDialogProps) {
    const [items, setItems] = useState<UsageItem[]>(initialItems || [])
    const [formulaChangeReason, setFormulaChangeReason] = useState("")

    // Detect formula changes
    const formulaDiffs: string[] = []
    if (!lastFormula || lastFormula.length === 0) {
        if (items.length > 0) {
            formulaDiffs.push("🆕 Primeira fórmula registrada para esta cliente")
        }
    } else {
        const prevMap = new Map(lastFormula.map(p => [p.usageProductId, p]))
        const currMap = new Map(items.filter(i => i.usageProductId).map(c => [c.usageProductId, c]))

        for (const item of items) {
            if (!item.usageProductId) continue
            const prev = prevMap.get(item.usageProductId)
            const product = usageProducts.find(p => p.id === item.usageProductId)
            const name = product?.name || "Produto"
            if (!prev) {
                formulaDiffs.push(`🆕 Adicionado: ${name} (${item.amountUsed}${product?.measurementUnit || ''})`)
            } else if (prev.amountUsed !== item.amountUsed) {
                formulaDiffs.push(`📝 Alterado: ${name} — ${prev.amountUsed}${product?.measurementUnit || ''} → ${item.amountUsed}${product?.measurementUnit || ''}`)
            }
        }

        for (const prev of lastFormula) {
            if (!currMap.has(prev.usageProductId)) {
                const product = usageProducts.find(p => p.id === prev.usageProductId)
                formulaDiffs.push(`❌ Removido: ${product?.name || prev.productName || "Produto"}`)
            }
        }
    }

    const formulaChanged = formulaDiffs.length > 0

    const addItem = () => setItems([...items, { usageProductId: "", amountUsed: 0, notes: "" }])

    const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index))

    const updateItem = (index: number, field: string, value: any) => {
        const updated = [...items]
        updated[index] = { ...updated[index], [field]: value }
        setItems(updated)
    }

    const handleConfirm = () => {
        onConfirm(items, formulaChanged, formulaChangeReason)
        onOpenChange(false)
    }

    const handleOpenChange = (v: boolean) => {
        if (!v) {
            // Reset on close
        }
        onOpenChange(v)
    }

    // Sync initial items when dialog opens
    const handleOpen = (v: boolean) => {
        if (v && initialItems) {
            setItems(initialItems)
            setFormulaChangeReason("")
        }
        handleOpenChange(v)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Droplets className="h-5 w-5 text-blue-500" />
                        Produtos de Consumo Utilizados
                    </DialogTitle>
                    <DialogDescription>
                        Registre os produtos de uso interno utilizados neste atendimento (tintura, oxidante, etc.)
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2">
                    {items.length === 0 && (
                        <p className="text-sm text-gray-400 italic text-center py-4">
                            Nenhum produto adicionado. Clique em "Adicionar" abaixo.
                        </p>
                    )}

                    {items.map((item, index) => {
                        const selectedProduct = usageProducts.find(p => p.id === item.usageProductId)
                        const remaining = selectedProduct
                            ? selectedProduct.contentAmount - selectedProduct.currentConsumed
                            : 0

                        return (
                            <div key={index} className="flex items-start gap-2 p-3 border rounded-lg bg-blue-50/50">
                                <div className="flex-1 space-y-2">
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <Label className="text-xs text-gray-500">Produto</Label>
                                            <Select
                                                value={item.usageProductId}
                                                onValueChange={(val) => updateItem(index, 'usageProductId', val)}
                                            >
                                                <SelectTrigger className="h-9 bg-white">
                                                    <SelectValue placeholder="Selecione o produto..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {usageProducts.map(p => {
                                                        const rem = p.contentAmount - p.currentConsumed
                                                        return (
                                                            <SelectItem key={p.id} value={p.id}>
                                                                {p.name} ({rem}{p.measurementUnit} restante)
                                                            </SelectItem>
                                                        )
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="w-28">
                                            <Label className="text-xs text-gray-500">
                                                Qtd ({selectedProduct?.measurementUnit || 'g/ml'})
                                            </Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                max={remaining > 0 ? remaining : undefined}
                                                step={0.1}
                                                value={item.amountUsed || ''}
                                                onChange={(e) => updateItem(index, 'amountUsed', Number(e.target.value))}
                                                className="h-9 bg-white"
                                                placeholder="0"
                                            />
                                            {selectedProduct && (
                                                <span className="text-[10px] text-gray-400">
                                                    Restante: {remaining}{selectedProduct.measurementUnit}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <Input
                                        placeholder="Observação (opcional)"
                                        value={item.notes}
                                        onChange={(e) => updateItem(index, 'notes', e.target.value)}
                                        className="h-8 text-xs bg-white"
                                    />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="mt-5 h-8 w-8 text-red-400 hover:text-red-600"
                                    onClick={() => removeItem(index)}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        )
                    })}

                    <Button onClick={addItem} variant="outline" size="sm" className="w-full">
                        <Plus className="mr-1 h-3 w-3" /> Adicionar Produto de Consumo
                    </Button>

                    {formulaChanged && items.length > 0 && (
                        <Alert className="border-amber-300 bg-amber-50">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <AlertTitle className="text-amber-800 text-sm">Fórmula Alterada</AlertTitle>
                            <AlertDescription className="text-amber-700 text-xs space-y-1">
                                <p>Diferenças em relação à última fórmula:</p>
                                <ul className="list-none space-y-0.5 mt-1">
                                    {formulaDiffs.map((diff, i) => (
                                        <li key={i} className="text-xs">{diff}</li>
                                    ))}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}

                    {formulaChanged && items.length > 0 && (
                        <div className="space-y-1">
                            <Label className="text-xs text-amber-700 font-medium">
                                Motivo da alteração na fórmula (opcional)
                            </Label>
                            <Textarea
                                placeholder="Ex: Cliente pediu tom mais claro, Mudança de marca do oxidante..."
                                value={formulaChangeReason}
                                onChange={(e) => setFormulaChangeReason(e.target.value)}
                                className="min-h-16 text-sm border-amber-300 focus:border-amber-500"
                                maxLength={300}
                            />
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button
                        onClick={handleConfirm}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                    >
                        <Droplets className="mr-2 h-4 w-4" />
                        Confirmar Consumo
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
