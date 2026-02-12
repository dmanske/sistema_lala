
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SaleItem } from "@/core/domain/sales/types"

interface SaleSummaryProps {
    subtotal: number
    discount: number
    total: number
    onPay: () => void
    loading?: boolean
    paid?: boolean
    totalPaid?: number
    items?: SaleItem[]
}

export function SaleSummaryCard({ subtotal, discount, total, onPay, loading, paid, totalPaid, items }: SaleSummaryProps) {
    // Calculate subtotals
    const servicesSubtotal = items?.filter(i => i.itemType === 'service').reduce((acc, i) => acc + (i.totalPrice || 0), 0) || 0
    const productsSubtotal = items?.filter(i => i.itemType === 'product').reduce((acc, i) => acc + (i.totalPrice || 0), 0) || 0
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
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
            </CardContent>
            <CardFooter>
                <Button className="w-full" size="lg" onClick={onPay} disabled={loading || paid}>
                    {paid ? "Pago (Concluído)" : "Receber Pagamento"}
                </Button>
            </CardFooter>
        </Card>
    )
}
