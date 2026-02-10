
"use client"

import { useEffect, useState, useCallback } from "react"
import { Sale, SaleItem, SalePayment, PaymentMethod } from "@/core/domain/sales/types"
import { LocalStorageSaleRepository } from "@/infrastructure/repositories/sales/LocalStorageSaleRepository"
import { UpdateSale } from "@/core/usecases/sales/UpdateSale"
import { PaySale } from "@/core/usecases/sales/PaySale"
import { GetSale } from "@/core/usecases/sales/GetSale"
import { LocalStorageProductRepository } from "@/infrastructure/repositories/LocalStorageProductRepository"
import { LocalStorageAppointmentRepository } from "@/infrastructure/repositories/LocalStorageAppointmentRepository"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Trash2, Plus, ShoppingBag } from "lucide-react"
import { AddProductDialog } from "./AddProductDialog"
import { PaymentDialog } from "./PaymentDialog"
import { SaleSummaryCard } from "./SaleSummaryCard"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Product } from "@/core/domain/Product"
import { cn } from "@/lib/utils"

// Initialize specialized repos
const saleRepo = new LocalStorageSaleRepository()
const productRepo = new LocalStorageProductRepository()
const apptRepo = new LocalStorageAppointmentRepository()

const updateSaleUseCase = new UpdateSale(saleRepo)
const paySaleUseCase = new PaySale(saleRepo, productRepo, apptRepo)
const getSaleUseCase = new GetSale(saleRepo)

interface CheckoutFormProps {
    saleId: string
    onSuccess?: () => void
}

export function CheckoutForm({ saleId, onSuccess }: CheckoutFormProps) {
    const [sale, setSale] = useState<Sale | null>(null)
    const [loading, setLoading] = useState(true)
    const [addProductOpen, setAddProductOpen] = useState(false)
    const [paymentOpen, setPaymentOpen] = useState(false)
    const [paymentConfirming, setPaymentConfirming] = useState(false)

    const fetchSale = useCallback(async () => {
        try {
            const result = await getSaleUseCase.execute(saleId)
            if (result) {
                setSale(result)
            } else {
                toast.error("Venda não encontrada")
            }
        } catch (error) {
            toast.error("Erro ao carregar venda")
        } finally {
            setLoading(false)
        }
    }, [saleId])

    useEffect(() => {
        fetchSale()
    }, [fetchSale])

    const handleUpdateItems = async (items: SaleItem[]) => {
        try {
            // Optimistic update
            setSale((prev: Sale | null) => prev ? { ...prev, items } : null)
            const updated = await updateSaleUseCase.execute(saleId, items)
            setSale(updated)
            toast.success("Itens atualizados")
        } catch (error) {
            toast.error("Erro ao atualizar itens")
            console.error(error)
            fetchSale() // Revert
        }
    }

    const addItem = (product: Product, qty: number, price: number) => {
        if (!sale) return
        const newItem: SaleItem = {
            id: crypto.randomUUID(),
            saleId: saleId,
            itemType: 'product',
            name: product.name,
            productId: product.id,
            qty,
            unitPrice: price,
            totalPrice: price * qty
        }

        handleUpdateItems([...(sale.items || []), newItem])
    }

    const updateItemQty = (itemId: string, newQty: number) => {
        if (!sale || !sale.items) return
        if (newQty < 1) return

        const newItems = sale.items.map((item: SaleItem) => {
            if (item.id === itemId) {
                return { ...item, qty: newQty, totalPrice: item.unitPrice * newQty }
            }
            return item
        })
        handleUpdateItems(newItems)
    }

    const removeItem = (itemId: string) => {
        if (!sale || !sale.items) return
        const newItems = sale.items.filter((item: SaleItem) => item.id !== itemId)
        handleUpdateItems(newItems)
    }

    const handlePayment = async (method: PaymentMethod, amount: number) => {
        if (!sale) return
        setPaymentConfirming(true)
        try {
            const updated = await paySaleUseCase.execute({
                saleId: sale.id,
                method,
                amount,
                paidAt: new Date(),
                createdBy: 'current-user', // Should come from auth context
            })
            setSale(updated)
            toast.success("Pagamento registrado com sucesso!")
            if (updated.status === 'paid') {
                if (onSuccess) onSuccess()
            }
        } catch (error: any) {
            toast.error(error.message || "Erro ao registrar pagamento")
        } finally {
            setPaymentConfirming(false)
        }
    }

    if (loading) return <div>Carregando...</div>
    if (!sale) return <div>Venda não encontrada.</div>

    const isPaid = sale.status === 'paid'

    return (
        <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5" /> Itens
                    </h2>
                    <Button onClick={() => setAddProductOpen(true)} variant="outline" size="sm" disabled={isPaid}>
                        <Plus className="mr-2 h-4 w-4" /> Adicionar Produto
                    </Button>
                </div>

                <div className="border rounded-lg overflow-hidden bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead className="w-[100px]">Tipo</TableHead>
                                <TableHead className="w-[100px] text-center">Qtd</TableHead>
                                <TableHead className="text-right">Unitário</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                {!isPaid && <TableHead className="w-[50px]"></TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sale.items?.map((item: SaleItem) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={item.itemType === 'service' ? 'secondary' : 'outline'}>
                                            {item.itemType === 'service' ? 'Serviço' : 'Produto'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {isPaid ? (
                                            item.qty
                                        ) : (
                                            <Input
                                                type="number"
                                                min={1}
                                                className="h-8 w-16 text-center mx-auto"
                                                value={item.qty ?? 1}
                                                onChange={(e) => updateItemQty(item.id, Number(e.target.value))}
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">R$ {(item.unitPrice ?? 0).toFixed(2)}</TableCell>
                                    <TableCell className="text-right font-bold">R$ {(item.totalPrice ?? 0).toFixed(2)}</TableCell>
                                    {!isPaid && (
                                        <TableCell>
                                            <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                            {(!sale.items || sale.items.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                        Nenhum item adicionado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div>
                <SaleSummaryCard
                    subtotal={sale.subtotal}
                    discount={sale.discount}
                    total={sale.total}
                    onPay={() => setPaymentOpen(true)}
                    loading={paymentConfirming}
                    paid={isPaid}
                />
            </div>

            <AddProductDialog
                open={addProductOpen}
                onOpenChange={setAddProductOpen}
                onAdd={addItem}
            />

            <PaymentDialog
                open={paymentOpen}
                onOpenChange={setPaymentOpen}
                totalRemaining={(sale.total ?? 0) - (sale.payments?.reduce((acc: number, p: SalePayment) => acc + p.amount, 0) || 0)}
                onConfirm={handlePayment}
            />
        </div>
    )
}
