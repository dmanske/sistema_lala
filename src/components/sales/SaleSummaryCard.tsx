
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SaleItem, SalePayment } from "@/core/domain/sales/types"
import { HandCoins, AlertTriangle } from "lucide-react"

interface SaleSummaryProps {
    subtotal: number
    discount: number
    total: number
    onPay: () => void
    loading?: boolean
    paid?: boolean
    totalPaid?: number
    items?: SaleItem[]
    payments?: SalePayment[]
}

export function SaleSummaryCard({ subtotal, discount, total, onPay, loading, paid, totalPaid, items, payments }: SaleSummaryProps) {
    // Calculate subtotals
    const servicesSubtotal = items?.filter(i => i.itemType === 'service').reduce((acc, i) => acc + (i.totalPrice || 0), 0) || 0
    const productsSubtotal = items?.filter(i => i.itemType === 'product').reduce((acc, i) => acc + (i.totalPrice || 0), 0) || 0
    
    // Check if there's any "fiado" payment
    const hasFiadoPayment = payments?.some(p => p.method === 'fiado') || false
    const fiadoAmount = payments?.filter(p => p.method === 'fiado').reduce((acc, p) => acc + p.amount, 0) || 0
    
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Resumo do Pedido</CardTitle>
                    {hasFiadoPayment && (
                        <Badge variant="destructive" className="gap-1.5 animate-pulse">
                            <HandCoins className="h-3.5 w-3.5" />
                            Ficou Devendo
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                {servicesSubtotal > 0 && (
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Subtotal Serviços</span>
                        <span>R$ {servicesSubtotal.toFixed(2)}</span>
                    </div>
                )}
                {productsSubtotal > 0 && (
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Subtotal Produtos</span>
                        <span>R$ {productsSubtotal.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>R$ {(subtotal ?? 0).toFixed(2)}</span>
                </div>
                {(discount ?? 0) > 0 && (
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Descontos</span>
                        <span>- R$ {(discount ?? 0).toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>R$ {(total ?? 0).toFixed(2)}</span>
                </div>
                {(totalPaid ?? 0) > 0 && (
                    <>
                        <div className="flex justify-between text-sm text-green-600 font-medium">
                            <span>Já Pago</span>
                            <span>R$ {(totalPaid ?? 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold text-slate-700 bg-slate-50 p-2 rounded -mx-2">
                            <span>A Pagar</span>
                            <span>R$ {((total ?? 0) - (totalPaid ?? 0)).toFixed(2)}</span>
                        </div>
                    </>
                )}
                {hasFiadoPayment && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg -mx-2 mt-2">
                        <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium text-red-900">
                                Cliente ficou devendo
                            </p>
                            <p className="text-xs text-red-700">
                                Valor fiado: R$ {fiadoAmount.toFixed(2)}
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button className="w-full" size="lg" onClick={onPay} disabled={loading || paid}>
                    {paid ? "Pago (Concluído)" : "Receber Pagamento"}
                </Button>
            </CardFooter>
        </Card>
    )
}
