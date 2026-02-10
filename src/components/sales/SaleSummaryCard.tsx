
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface SaleSummaryProps {
    subtotal: number
    discount: number
    total: number
    onPay: () => void
    loading?: boolean
    paid?: boolean
    totalPaid?: number
}

export function SaleSummaryCard({ subtotal, discount, total, onPay, loading, paid, totalPaid }: SaleSummaryProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>R$ {(subtotal ?? 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Descontos</span>
                    <span>- R$ {(discount ?? 0).toFixed(2)}</span>
                </div>
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
