'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CashMovement } from '@/core/domain/CashMovement'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ExternalLink, User, Package, ShoppingBag, Calendar, Clock, CreditCard, FileText, Building2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface CashMovementDetailsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    movement: CashMovement | null
}

interface SaleDetails {
    id: string
    appointmentId?: string
    clientId?: string
    clientName?: string
    items: Array<{ name: string; quantity: number; price: number }>
    notes?: string
}

interface PurchaseDetails {
    id: string
    supplierId?: string
    supplierName?: string
    items: Array<{ name: string; quantity: number; price: number }>
    notes?: string
}

const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const getMethodLabel = (method: string): string => {
    const labels: Record<string, string> = {
        CASH: 'Dinheiro',
        PIX: 'Pix',
        CARD: 'Cartão',
        TRANSFER: 'Transferência',
        WALLET: 'Carteira'
    }
    return labels[method] || method
}

const getSourceLabel = (source: string): string => {
    const labels: Record<string, string> = {
        SALE: 'Venda',
        REFUND: 'Estorno',
        PURCHASE: 'Compra',
        MANUAL: 'Lançamento Manual'
    }
    return labels[source] || source
}

export function CashMovementDetailsDialog({ open, onOpenChange, movement }: CashMovementDetailsDialogProps) {
    const [saleDetails, setSaleDetails] = useState<SaleDetails | null>(null)
    const [purchaseDetails, setPurchaseDetails] = useState<PurchaseDetails | null>(null)
    const [accountName, setAccountName] = useState<string>('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!movement || !open) {
            setSaleDetails(null)
            setPurchaseDetails(null)
            setAccountName('')
            return
        }

        async function loadDetails() {
            if (!movement) return
            
            setLoading(true)
            const supabase = createClient()

            try {
                // Load account name
                const { data: account } = await supabase
                    .from('bank_accounts')
                    .select('name')
                    .eq('id', movement.bankAccountId)
                    .single()
                
                if (account) {
                    setAccountName(account.name)
                }

                // Load sale or purchase details
                if (movement.sourceType === 'SALE' && movement.sourceId) {
                    const { data: sale } = await supabase
                        .from('sales')
                        .select(`
                            id,
                            appointment_id,
                            client_id,
                            notes,
                            clients(name),
                            sale_items(
                                quantity,
                                price,
                                services(name),
                                products(name)
                            )
                        `)
                        .eq('id', movement.sourceId)
                        .single()

                    if (sale) {
                        setSaleDetails({
                            id: sale.id,
                            appointmentId: sale.appointment_id,
                            clientId: sale.client_id,
                            clientName: (sale.clients as any)?.name,
                            items: (sale.sale_items || []).map((item: any) => ({
                                name: item.services?.name || item.products?.name || 'Item',
                                quantity: item.quantity,
                                price: item.price
                            })),
                            notes: sale.notes
                        })
                    }
                } else if (movement.sourceType === 'PURCHASE' && movement.sourceId) {
                    const { data: purchase } = await supabase
                        .from('purchases')
                        .select(`
                            id,
                            supplier_id,
                            notes,
                            suppliers(name),
                            purchase_items(
                                quantity,
                                unit_price,
                                products(name)
                            )
                        `)
                        .eq('id', movement.sourceId)
                        .single()

                    if (purchase) {
                        setPurchaseDetails({
                            id: purchase.id,
                            supplierId: purchase.supplier_id,
                            supplierName: (purchase.suppliers as any)?.name,
                            items: (purchase.purchase_items || []).map((item: any) => ({
                                name: item.products?.name || 'Produto',
                                quantity: item.quantity,
                                price: item.unit_price
                            })),
                            notes: purchase.notes
                        })
                    }
                }
            } catch (error) {
                console.error('Error loading movement details:', error)
            } finally {
                setLoading(false)
            }
        }

        loadDetails()
    }, [movement, open])

    if (!movement) return null

    const isIncome = movement.type === 'IN'
    
    // Para vendas, usar o appointment_id da venda
    const getLinkUrl = () => {
        if (movement.sourceType === 'SALE') {
            // Only show link if we have loaded the appointment ID
            if (!saleDetails?.appointmentId) {
                return null
            }
            return `/appointments/${saleDetails.appointmentId}/checkout`
        }
        if (movement.sourceType === 'PURCHASE' && movement.sourceId) {
            return `/purchases/${movement.sourceId}`
        }
        return null
    }
    
    const linkUrl = getLinkUrl()

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${isIncome ? 'bg-green-100 text-green-600' : 'bg-rose-100 text-rose-600'}`}>
                            {movement.sourceType === 'SALE' ? <ShoppingBag className="h-5 w-5" /> : <Package className="h-5 w-5" />}
                        </div>
                        Detalhes da Movimentação
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Calendar className="h-4 w-4" />
                                <span>Data</span>
                            </div>
                            <div className="font-semibold">
                                {format(movement.occurredAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Clock className="h-4 w-4" />
                                <span>Horário</span>
                            </div>
                            <div className="font-semibold">
                                {format(movement.occurredAt, 'HH:mm', { locale: ptBR })}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <CreditCard className="h-4 w-4" />
                                <span>Método</span>
                            </div>
                            <div className="font-semibold">
                                {getMethodLabel(movement.method)}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <FileText className="h-4 w-4" />
                                <span>Origem</span>
                            </div>
                            <div className="font-semibold">
                                {getSourceLabel(movement.sourceType)}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Building2 className="h-4 w-4" />
                                <span>Conta</span>
                            </div>
                            <div className="font-semibold">
                                {accountName || 'Carregando...'}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="text-sm text-slate-500">Valor</div>
                            <div className={`text-2xl font-bold ${isIncome ? 'text-green-600' : 'text-rose-600'}`}>
                                {formatCurrency(movement.amount)}
                            </div>
                        </div>
                    </div>

                    {/* Customer/Supplier Info */}
                    {(saleDetails?.clientName || purchaseDetails?.supplierName) && (
                        <div className="p-4 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                                <User className="h-4 w-4" />
                                <span>{saleDetails ? 'Cliente' : 'Fornecedor'}</span>
                            </div>
                            <div className="font-semibold text-lg">
                                {saleDetails?.clientName || purchaseDetails?.supplierName}
                            </div>
                        </div>
                    )}

                    {/* Items */}
                    {(saleDetails?.items.length || purchaseDetails?.items.length) ? (
                        <div className="space-y-2">
                            <div className="text-sm font-semibold text-slate-700">
                                {saleDetails ? 'Itens da Venda' : 'Itens da Compra'}
                            </div>
                            <div className="border rounded-lg overflow-hidden">
                                {(saleDetails?.items || purchaseDetails?.items || []).map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex justify-between items-center p-3 border-b last:border-b-0 bg-white"
                                    >
                                        <div className="flex-1">
                                            <div className="font-medium">{item.name}</div>
                                            <div className="text-sm text-slate-500">
                                                Quantidade: {item.quantity}
                                            </div>
                                        </div>
                                        <div className="font-semibold">
                                            {formatCurrency(item.price * item.quantity)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : loading ? (
                        <div className="text-center text-sm text-slate-500 py-4">
                            Carregando detalhes...
                        </div>
                    ) : null}

                    {/* Notes */}
                    {(saleDetails?.notes || purchaseDetails?.notes || movement.description) && (
                        <div className="space-y-2">
                            <div className="text-sm font-semibold text-slate-700">Observações</div>
                            <div className="p-3 bg-slate-50 rounded-lg text-sm">
                                {saleDetails?.notes || purchaseDetails?.notes || movement.description}
                            </div>
                        </div>
                    )}

                    {/* Link to Original */}
                    {linkUrl && (
                        <div className="pt-4 border-t">
                            <Link href={linkUrl}>
                                <Button variant="outline" className="w-full" size="sm">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Ver {movement.sourceType === 'SALE' ? 'Venda' : 'Compra'} Original
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
