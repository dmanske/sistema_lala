
"use client"

import { useEffect, useState, useCallback } from "react"
import { Sale, SaleItem, SalePayment, PaymentMethod } from "@/core/domain/sales/types"
import { getSaleRepository, getProductRepository, getAppointmentRepository, getCreditRepository, getClientRepository } from "@/infrastructure/repositories/factory"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Trash2, Plus, ShoppingBag } from "lucide-react"
import { AddProductDialog } from "./AddProductDialog"
import { PaymentDialog } from "./PaymentDialog"
import { SaleSummaryCard } from "./SaleSummaryCard"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { useProducts } from "@/hooks/useProducts"
import { Product } from "@/core/domain/Product"
import { cn } from "@/lib/utils"

import { UpdateSale } from "@/core/usecases/sales/UpdateSale"
import { PaySale } from "@/core/usecases/sales/PaySale"
import { GetSale } from "@/core/usecases/sales/GetSale"
import { RefundSale } from "@/core/usecases/sales/RefundSale"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Initialize specialized repos
const saleRepo = getSaleRepository()
const productRepo = getProductRepository()
const apptRepo = getAppointmentRepository()
const creditRepo = getCreditRepository()
const clientRepo = getClientRepository()

const updateSaleUseCase = new UpdateSale(saleRepo)
const paySaleUseCase = new PaySale(saleRepo, productRepo, apptRepo)
const getSaleUseCase = new GetSale(saleRepo)
const refundSaleUseCase = new RefundSale(saleRepo, productRepo)

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
    const [refundConfirming, setRefundConfirming] = useState(false)
    const [creditBalance, setCreditBalance] = useState(0)
    const [customerName, setCustomerName] = useState<string | undefined>(undefined)

    // ... (fetchSale logic remains same)
    const fetchSale = useCallback(async () => {
        try {
            const result = await getSaleUseCase.execute(saleId)
            if (result) {
                setSale(result)
                // Load customer credit balance
                if (result.customerId) {
                    const movements = await creditRepo.getByClientId(result.customerId)
                    const balance = movements.reduce((acc, m) => {
                        return m.type === 'CREDIT' ? acc + m.amount : acc - m.amount
                    }, 0)
                    setCreditBalance(Math.max(0, balance))
                    // Load customer name
                    const client = await clientRepo.getById(result.customerId)
                    if (client) setCustomerName(client.name)
                }
            } else {
                toast.error("Venda não encontrada")
            }
        } catch (error) {
            toast.error("Erro ao carregar venda")
        } finally {
            setLoading(false)
        }
    }, [saleId])

    const { products } = useProducts()

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

    // ... (addItem, updateItemQty, updateItemPrice, removeItem logic remains)
    const addItem = (product: Product, qty: number, price: number) => {
        if (!sale) return

        // Calculate existing quantity in cart
        const existingItem = sale.items?.find(i => i.itemType === 'product' && i.productId === product.id)
        const existingQty = existingItem ? existingItem.qty : 0
        const totalQty = existingQty + qty

        // Stock Validation
        if (product.currentStock < totalQty) {
            toast.error(`Estoque insuficiente! Disponível: ${product.currentStock}. Em carrinho: ${existingQty}.Tentativa: ${qty}`)
            return
        }

        let newItems: SaleItem[] = [...(sale.items || [])]

        if (existingItem) {
            newItems = newItems.map(i => {
                if (i.id === existingItem.id) {
                    return {
                        ...i,
                        qty: totalQty,
                        totalPrice: totalQty * price
                    }
                }
                return i
            })
        } else {
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
            newItems.push(newItem)
        }

        handleUpdateItems(newItems)
    }

    const updateItemQty = (itemId: string, newQty: number) => {
        if (!sale || !sale.items) return
        if (newQty < 1) return

        const item = sale.items.find(i => i.id === itemId)
        if (!item) return

        // Stock Validation for Products
        if (item.itemType === 'product' && item.productId) {
            const product = products.find(p => p.id === item.productId)
            if (product) {
                if (product.currentStock < newQty) {
                    toast.error(`Estoque insuficiente! Disponível: ${product.currentStock}`)
                    return
                }
            }
        }

        const newItems = sale.items.map((item: SaleItem) => {
            if (item.id === itemId) {
                return { ...item, qty: newQty, totalPrice: item.unitPrice * newQty }
            }
            return item
        })
        handleUpdateItems(newItems)
    }

    const updateItemPrice = (itemId: string, newPrice: number) => {
        if (!sale || !sale.items) return
        if (newPrice < 0) return

        const newItems = sale.items.map((item: SaleItem) => {
            if (item.id === itemId) {
                const price = Number(newPrice);
                return { ...item, unitPrice: price, totalPrice: price * item.qty }
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

    // ... (handlePayment logic remains)
    const handlePayment = async (payments: { method: PaymentMethod; amount: number; change?: number }[]) => {
        if (!sale) return
        setPaymentConfirming(true)
        try {
            await paySaleUseCase.execute({
                saleId: sale.id,
                payments: payments,
                createdBy: 'current-user', // Should ideally come from auth context
            })

            // Update local state after successful payment
            await fetchSale()

            const methodCount = payments.length
            toast.success(methodCount > 1 ? `Pagamento registrado (${methodCount} formas)!` : "Pagamento registrado com sucesso!")

            if (onSuccess) onSuccess()
        } catch (error: any) {
            toast.error(error.message || "Erro ao registrar pagamento")
        } finally {
            setPaymentConfirming(false)
        }
    }

    const handleRefund = async () => {
        if (!sale) return
        setRefundConfirming(true)
        try {
            await refundSaleUseCase.execute({
                saleId: sale.id,
                refundedBy: 'current-user'
            })
            toast.success("Venda estornada e estoque revertido!")
            fetchSale()
        } catch (error: any) {
            toast.error(error.message || "Erro ao estornar venda")
        } finally {
            setRefundConfirming(false)
        }
    }

    if (loading) return <div>Carregando...</div>
    if (!sale) return <div>Venda não encontrada.</div>

    const isPaid = sale.status === 'paid'
    const isRefunded = sale.status === 'refunded'
    // If refunded, we treat it as unpaid (ignoring previous payments for the new payment cycle)
    // This allows the user to pay again.
    // Note: This is an assumption that a full re-payment is needed.
    const totalPaid = isRefunded ? 0 : (sale.payments?.reduce((acc: number, p: SalePayment) => acc + p.amount, 0) || 0)
    const totalRemaining = Math.max(0, (sale.total ?? 0) - totalPaid)

    return (
        <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
                {/* ... (Table code remains mostly same, except for isRefunded check maybe?) */}
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5" /> Itens
                        {isRefunded && <Badge variant="destructive" className="ml-2">ESTORNADO</Badge>}
                    </h2>
                    {!isPaid && !isRefunded && (
                        <Button onClick={() => setAddProductOpen(true)} variant="outline" size="sm">
                            <Plus className="mr-2 h-4 w-4" /> Adicionar Produto
                        </Button>
                    )}
                </div>

                <div className="border rounded-lg overflow-hidden bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead className="w-[100px]">Tipo</TableHead>
                                <TableHead className="w-[100px] text-center">Qtd</TableHead>
                                <TableHead className="text-right w-[120px]">Unitário</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                {!isPaid && !isRefunded && <TableHead className="w-[50px]"></TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sale.items?.map((item: SaleItem) => (
                                <TableRow key={item.id} className={isRefunded ? "opacity-50" : ""}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={item.itemType === 'service' ? 'secondary' : 'outline'}>
                                            {item.itemType === 'service' ? 'Serviço' : 'Produto'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {isPaid || isRefunded ? (
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
                                    <TableCell className="text-right w-[120px]">
                                        {isPaid || isRefunded ? (
                                            `R$ ${(item.unitPrice ?? 0).toFixed(2)}`
                                        ) : (
                                            <div className="relative">
                                                <span className="absolute left-2 top-1.5 text-xs text-muted-foreground">R$</span>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    step="0.01"
                                                    className="h-8 w-24 text-right pl-6 ml-auto"
                                                    value={item.unitPrice}
                                                    onChange={(e) => updateItemPrice(item.id, Number(e.target.value))}
                                                />
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right font-bold">R$ {(item.totalPrice ?? 0).toFixed(2)}</TableCell>
                                    {!isPaid && !isRefunded && (
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

            <div className="space-y-4">
                <SaleSummaryCard
                    subtotal={sale.subtotal}
                    discount={sale.discount}
                    total={sale.total}
                    totalPaid={totalPaid}
                    onPay={() => setPaymentOpen(true)}
                    loading={paymentConfirming}
                    paid={isPaid}
                />

                {isPaid && !isRefunded && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="w-full" disabled={refundConfirming}>
                                Estornar Venda (Reembolso)
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Estorno?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta ação irá reverter o status da venda para "Refunded" e devolver os produtos ao estoque.
                                    O histórico financeiro será mantido.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleRefund} className="bg-red-600 hover:bg-red-700">
                                    Sim, Estornar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>

            <AddProductDialog
                open={addProductOpen}
                onOpenChange={setAddProductOpen}
                onAdd={addItem}
            />

            <PaymentDialog
                open={paymentOpen}
                onOpenChange={setPaymentOpen}
                totalRemaining={totalRemaining}
                onConfirm={handlePayment}
                creditBalance={creditBalance}
                customerName={customerName}
                hasCustomer={!!sale.customerId}
            />
        </div>
    )
}
