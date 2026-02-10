
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface SaleSummaryProps {
    subtotal: number
    discount: number
    total: number
    onPay: () => void
    loading?: boolean
    paid?: boolean
}

export function SaleSummaryCard({ subtotal, discount, total, onPay, loading, paid }: SaleSummaryProps) {
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
            </CardContent>
            <CardFooter>
                <Button className="w-full" size="lg" onClick={onPay} disabled={loading || paid}>
                    {paid ? "Pago (Concluído)" : "Receber Pagamento"}
                </Button>
            </CardFooter>
        </Card>
    )
}
