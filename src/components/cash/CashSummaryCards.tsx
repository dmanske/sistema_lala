import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { ArrowDownCircle, ArrowUpCircle, Wallet } from "lucide-react"

interface CashSummaryProps {
    summary: {
        totalIn: number
        totalOut: number
        balance: number
    }
}

export function CashSummaryCards({ summary }: CashSummaryProps) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Entradas</CardTitle>
                    <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-emerald-600">{formatCurrency(summary.totalIn)}</div>
                    <p className="text-xs text-muted-foreground">
                        + no período selecionado
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Saídas</CardTitle>
                    <ArrowDownCircle className="h-4 w-4 text-rose-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-rose-600">{formatCurrency(summary.totalOut)}</div>
                    <p className="text-xs text-muted-foreground">
                        - no período selecionado
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Saldo do Período</CardTitle>
                    <Wallet className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                        {formatCurrency(summary.balance)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Resultado líquido do período
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
