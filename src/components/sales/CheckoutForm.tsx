
"use client"

import { useEffect, useState, useCallback } from "react"
import { Sale, SaleItem, SalePayment, PaymentMethod } from "@/core/domain/sales/types"
import { getSaleRepository, getProductRepository, getAppointmentRepository, getCreditRepository, getClientRepository, getProfessionalRepository } from "@/infrastructure/repositories/factory"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, Plus, ShoppingBag, Pencil } from "lucide-react"
import { AddProductDialog } from "./AddProductDialog"
import { AddServiceDialog } from "./AddServiceDialog"
import { PaymentDialog } from "./PaymentDialog"
import { SaleSummaryCard } from "./SaleSummaryCard"
import { CheckoutHeader } from "./CheckoutHeader"
import { AppointmentInfoCard } from "./AppointmentInfoCard"
import { ServiceTimeline } from "./ServiceTimeline"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { useProducts } from "@/hooks/useProducts"
import { Product } from "@/core/domain/Product"
import { Client } from "@/core/domain/Client"
import { Appointment } from "@/core/domain/Appointment"
import { Professional } from "@/core/domain/Professional"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Initialize specialized repos
const saleRepo = getSaleRepository()
const productRepo = getProductRepository()
const apptRepo = getAppointmentRepository()
const creditRepo = getCreditRepository()
const clientRepo = getClientRepository()
const professionalRepo = getProfessionalRepository()

const updateSaleUseCase = new UpdateSale(saleRepo)
const paySaleUseCase = new PaySale(saleRepo, productRepo, apptRepo)
const getSaleUseCase = new GetSale(saleRepo)
const refundSaleUseCase = new RefundSale(saleRepo, productRepo)

interface CheckoutFormProps {
    saleId: string
    onSuccess?: () => void
    onPaymentStart?: () => void
}

export function CheckoutForm({ saleId, onSuccess, onPaymentStart }: CheckoutFormProps) {
    const [sale, setSale] = useState<Sale | null>(null)
    const [loading, setLoading] = useState(true)
    const [addProductOpen, setAddProductOpen] = useState(false)
    const [addServiceOpen, setAddServiceOpen] = useState(false)
    const [paymentOpen, setPaymentOpen] = useState(false)
    const [paymentConfirming, setPaymentConfirming] = useState(false)
    const [refundConfirming, setRefundConfirming] = useState(false)
    const [creditBalance, setCreditBalance] = useState(0)
    const [customerName, setCustomerName] = useState<string | undefined>(undefined)
    const [client, setClient] = useState<Client | null>(null)
    const [appointment, setAppointment] = useState<Appointment | null>(null)
    const [professional, setProfessional] = useState<Professional | null>(null)
    const [notes, setNotes] = useState<string>("")

    // ... (fetchSale logic remains same)
    const fetchSale = useCallback(async () => {
        try {
            const result = await getSaleUseCase.execute(saleId)
            if (result) {
                console.log('📦 Sale fetched - ID:', result.id);
                console.log('📦 Sale status:', result.status);
                console.log('📦 Items count:', result.items?.length || 0);
                console.log('📦 Items array:', result.items);
                if (result.items && result.items.length > 0) {
                    result.items.forEach((item, idx) => {
                        console.log(`   Item ${idx + 1}:`, {
                            name: item.name,
                            type: item.itemType,
                            serviceId: item.serviceId,
                            productId: item.productId,
                            price: item.unitPrice,
                            qty: item.qty
                        });
                    });
                } else {
                    console.log('⚠️ NO ITEMS IN SALE!');
                }
                setSale(result)
                // Load notes if they exist
                if (result.notes) {
                    setNotes(result.notes)
                }
                // Load customer credit balance and data
                if (result.customerId) {
                    const movements = await creditRepo.getByClientId(result.customerId)
                    const balance = movements.reduce((acc, m) => {
                        return m.type === 'CREDIT' ? acc + m.amount : acc - m.amount
                    }, 0)
                    setCreditBalance(Math.max(0, balance))
                    // Load customer data
                    const clientData = await clientRepo.getById(result.customerId)
                    if (clientData) {
                        setCustomerName(clientData.name)
                        setClient(clientData)
                    }
                }
                // Load appointment data
                if (result.appointmentId) {
                    const apptData = await apptRepo.getById(result.appointmentId)
                    if (apptData) {
                        setAppointment(apptData)
                        // Load professional data
                        const profData = await professionalRepo.getById(apptData.professionalId)
                        if (profData) {
                            setProfessional(profData)
                        }
                    }
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

    const addService = (service: { id: string; name: string; price: number }, qty: number, price: number) => {
        if (!sale) return

        // Check if service already exists
        const existingItem = sale.items?.find(i => i.itemType === 'service' && i.serviceId === service.id)
        
        let newItems: SaleItem[] = [...(sale.items || [])]

        if (existingItem) {
            // Update quantity
            newItems = newItems.map(i => {
                if (i.id === existingItem.id) {
                    const newQty = i.qty + qty
                    return {
                        ...i,
                        qty: newQty,
                        totalPrice: newQty * price
                    }
                }
                return i
            })
        } else {
            // Add new service
            const newItem: SaleItem = {
                id: crypto.randomUUID(),
                saleId: saleId,
                itemType: 'service',
                name: service.name,
                serviceId: service.id,
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
        setEditingQty(null)
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
        setEditingPrice(null)
    }

    const [itemToDelete, setItemToDelete] = useState<string | null>(null)
    const [editingPrice, setEditingPrice] = useState<{ itemId: string; price: number } | null>(null)
    const [editingQty, setEditingQty] = useState<{ itemId: string; qty: number } | null>(null)

    const removeItem = (itemId: string) => {
        if (!sale || !sale.items) return
        const newItems = sale.items.filter((item: SaleItem) => item.id !== itemId)
        handleUpdateItems(newItems)
        setItemToDelete(null)
    }

    const handleNotesChange = async (newNotes: string) => {
        if (!sale) return
        // Limit to 500 characters
        const limitedNotes = newNotes.slice(0, 500)
        setNotes(limitedNotes)
        
        // Auto-save notes (debounced in real implementation)
        try {
            await updateSaleUseCase.execute(saleId, sale.items || [], limitedNotes)
        } catch (error) {
            console.error("Error saving notes:", error)
        }
    }

    // ... (handlePayment logic remains)
    const handlePayment = async (payments: { method: PaymentMethod; amount: number; change?: number; bankAccountId: string }[]) => {
        if (!sale) return
        setPaymentConfirming(true)
        try {
            console.log('Starting payment process...', { saleId: sale.id, payments })
            
            await paySaleUseCase.execute({
                saleId: sale.id,
                payments: payments,
                createdBy: 'current-user', // Should ideally come from auth context
            })

            console.log('Payment successful, fetching updated sale...')
            
            // Update local state after successful payment
            await fetchSale()

            const methodCount = payments.length
            toast.success(methodCount > 1 ? `Pagamento registrado (${methodCount} formas)!` : "Pagamento registrado com sucesso!")

            if (onSuccess) onSuccess()
        } catch (error: any) {
            console.error('Payment error:', error)
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
        <div className="space-y-6">
            {/* Client Header */}
            {client && <CheckoutHeader client={client} />}

            {/* Appointment Info Card */}
            {appointment && professional && (
                <AppointmentInfoCard appointment={appointment} professional={professional} />
            )}

            {/* Service Timeline */}
            {appointment && professional && sale.items && (
                <ServiceTimeline 
                    services={sale.items.filter(item => item.itemType === 'service')}
                    startTime={appointment.startTime}
                    professionalColor={professional.color}
                />
            )}

            <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
                {/* ... (Table code remains mostly same, except for isRefunded check maybe?) */}
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5" /> Itens
                        {isRefunded && <Badge variant="destructive" className="ml-2">ESTORNADO</Badge>}
                    </h2>
                    {!isPaid && !isRefunded && (
                        <div className="flex gap-2">
                            <Button onClick={() => setAddServiceOpen(true)} variant="outline" size="sm">
                                <Plus className="mr-2 h-4 w-4" /> Adicionar Serviço
                            </Button>
                            <Button onClick={() => setAddProductOpen(true)} variant="outline" size="sm">
                                <Plus className="mr-2 h-4 w-4" /> Adicionar Produto
                            </Button>
                        </div>
                    )}
                </div>

                <div className="border rounded-lg overflow-hidden bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead className="w-[100px]">Tipo</TableHead>
                                <TableHead className="w-[120px]">Profissional</TableHead>
                                <TableHead className="w-[80px] text-center">Duração</TableHead>
                                <TableHead className="w-[100px] text-center">Qtd</TableHead>
                                <TableHead className="w-[100px] text-center">Estoque</TableHead>
                                <TableHead className="text-right w-[120px]">Unitário</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                {!isPaid && !isRefunded && <TableHead className="w-[50px]"></TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sale.items?.map((item: SaleItem) => {
                                const product = item.itemType === 'product' && item.productId 
                                    ? products.find(p => p.id === item.productId)
                                    : null
                                const stockAfterSale = product ? product.currentStock - item.qty : null
                                
                                return (
                                <TableRow key={item.id} className={isRefunded ? "opacity-50" : ""}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={item.itemType === 'service' ? 'secondary' : 'outline'}>
                                            {item.itemType === 'service' ? 'Serviço' : 'Produto'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {item.itemType === 'service' && professional ? (
                                            <div className="flex items-center gap-2">
                                                <div 
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ backgroundColor: professional.color }}
                                                />
                                                <span className="text-xs">{professional.name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {item.itemType === 'service' ? (
                                            <Badge variant="outline" className="text-xs">
                                                Serviço
                                            </Badge>
                                        ) : (
                                            <span className="text-xs text-gray-400">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {isPaid || isRefunded ? (
                                            item.qty
                                        ) : (
                                            <Popover 
                                                open={editingQty?.itemId === item.id} 
                                                onOpenChange={(open) => {
                                                    if (!open) setEditingQty(null)
                                                }}
                                            >
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        className="h-8 w-16 mx-auto justify-center hover:bg-gray-100"
                                                        onClick={() => setEditingQty({ itemId: item.id, qty: item.qty })}
                                                    >
                                                        <span className="text-sm font-medium">{item.qty}</span>
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-64" align="center">
                                                    <div className="space-y-3">
                                                        <div className="space-y-1">
                                                            <h4 className="font-medium text-sm">Editar Quantidade</h4>
                                                            <p className="text-xs text-gray-500">{item.name}</p>
                                                            {item.itemType === 'product' && product && (
                                                                <p className="text-xs text-amber-600">
                                                                    Estoque disponível: {product.currentStock}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-xs text-gray-600">Quantidade</label>
                                                            <Input
                                                                type="number"
                                                                min={1}
                                                                max={item.itemType === 'product' && product ? product.currentStock : undefined}
                                                                className="text-center"
                                                                value={editingQty?.itemId === item.id ? editingQty.qty : item.qty}
                                                                onChange={(e) => setEditingQty({ itemId: item.id, qty: Number(e.target.value) })}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        updateItemQty(item.id, editingQty?.qty ?? item.qty)
                                                                    }
                                                                }}
                                                                autoFocus
                                                            />
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                className="flex-1"
                                                                onClick={() => updateItemQty(item.id, editingQty?.qty ?? item.qty)}
                                                            >
                                                                Salvar
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => setEditingQty(null)}
                                                            >
                                                                Cancelar
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {item.itemType === 'product' && product ? (
                                            <div className="flex flex-col items-center gap-1">
                                                <span className={cn(
                                                    "text-sm font-medium",
                                                    product.currentStock === 0 ? "text-red-600" :
                                                    product.currentStock <= (product.minStock || 0) ? "text-yellow-600" :
                                                    "text-gray-600"
                                                )}>
                                                    {product.currentStock}
                                                </span>
                                                {!isPaid && !isRefunded && stockAfterSale !== null && (
                                                    <span className="text-xs text-gray-500">
                                                        → {stockAfterSale}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right w-[120px]">
                                        {isPaid || isRefunded ? (
                                            `R$ ${(item.unitPrice ?? 0).toFixed(2)}`
                                        ) : (
                                            <Popover 
                                                open={editingPrice?.itemId === item.id} 
                                                onOpenChange={(open) => {
                                                    if (!open) setEditingPrice(null)
                                                }}
                                            >
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        className="h-8 w-full justify-between px-2 hover:bg-gray-100"
                                                        onClick={() => setEditingPrice({ itemId: item.id, price: item.unitPrice })}
                                                    >
                                                        <span className="text-sm">R$ {(item.unitPrice ?? 0).toFixed(2)}</span>
                                                        <Pencil className="h-3 w-3 ml-2 text-gray-400" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-64" align="end">
                                                    <div className="space-y-3">
                                                        <div className="space-y-1">
                                                            <h4 className="font-medium text-sm">Editar Preço</h4>
                                                            <p className="text-xs text-gray-500">{item.name}</p>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-xs text-gray-600">Valor Unitário</label>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-2 text-sm text-gray-500">R$</span>
                                                                <Input
                                                                    type="number"
                                                                    min={0}
                                                                    step="0.01"
                                                                    className="pl-9"
                                                                    value={editingPrice?.itemId === item.id ? editingPrice.price : item.unitPrice}
                                                                    onChange={(e) => setEditingPrice({ itemId: item.id, price: Number(e.target.value) })}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            updateItemPrice(item.id, editingPrice?.price ?? item.unitPrice)
                                                                        }
                                                                    }}
                                                                    autoFocus
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                className="flex-1"
                                                                onClick={() => updateItemPrice(item.id, editingPrice?.price ?? item.unitPrice)}
                                                            >
                                                                Salvar
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => setEditingPrice(null)}
                                                            >
                                                                Cancelar
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right font-bold">R$ {(item.totalPrice ?? 0).toFixed(2)}</TableCell>
                                    {!isPaid && !isRefunded && (
                                        <TableCell>
                                            <AlertDialog open={itemToDelete === item.id} onOpenChange={(open) => !open && setItemToDelete(null)}>
                                                <AlertDialogTrigger asChild>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => setItemToDelete(item.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Remover item?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Tem certeza que deseja remover <span className="font-semibold">{item.name}</span> do atendimento?
                                                            {item.itemType === 'service' && (
                                                                <span className="block mt-2 text-amber-600">
                                                                    ⚠️ Este é um serviço do agendamento.
                                                                </span>
                                                            )}
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction 
                                                            onClick={() => removeItem(item.id)}
                                                            className="bg-red-600 hover:bg-red-700"
                                                        >
                                                            Sim, Remover
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    )}
                                </TableRow>
                            )})}
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

                {/* Observações do Atendimento */}
                {!isRefunded && (
                    <div className="space-y-2">
                        <label htmlFor="notes" className="text-sm font-medium text-gray-700">
                            Observações do Atendimento
                        </label>
                        {isPaid && notes ? (
                            <div className="p-4 rounded-lg border bg-gray-50 text-gray-700 min-h-24">
                                {notes}
                            </div>
                        ) : (
                            <>
                                <Textarea
                                    id="notes"
                                    placeholder="Ex: Cliente solicitou corte mais curto, Alergia a produto X, Preferências especiais..."
                                    value={notes}
                                    onChange={(e) => handleNotesChange(e.target.value)}
                                    disabled={isPaid}
                                    maxLength={500}
                                    className="min-h-24"
                                />
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>Opcional - Máximo 500 caracteres</span>
                                    <span className={notes.length >= 500 ? "text-red-600 font-medium" : ""}>
                                        {notes.length}/500
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <SaleSummaryCard
                    subtotal={sale.subtotal}
                    discount={sale.discount}
                    total={sale.total}
                    totalPaid={totalPaid}
                    items={sale.items}
                    payments={sale.payments}
                    onPay={() => {
                        setPaymentOpen(true)
                        if (onPaymentStart) onPaymentStart()
                    }}
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
            </div>

            <AddProductDialog
                open={addProductOpen}
                onOpenChange={setAddProductOpen}
                onAdd={addItem}
            />

            <AddServiceDialog
                open={addServiceOpen}
                onOpenChange={setAddServiceOpen}
                onAdd={addService}
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
