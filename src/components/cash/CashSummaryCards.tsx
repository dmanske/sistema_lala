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
            <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-emerald-900">Entradas</CardTitle>
                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                        <ArrowUpCircle className="h-5 w-5 text-emerald-600" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-emerald-700">{formatCurrency(summary.totalIn)}</div>
                    <p className="text-xs text-emerald-600/80 mt-1">
                        Total de recebimentos no período
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-rose-50 to-white border-rose-100 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-rose-900">Saídas</CardTitle>
                    <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center">
                        <ArrowDownCircle className="h-5 w-5 text-rose-600" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-rose-700">{formatCurrency(summary.totalOut)}</div>
                    <p className="text-xs text-rose-600/80 mt-1">
                        Total de pagamentos no período
                    </p>
                </CardContent>
            </Card>

            <Card className={`shadow-sm bg-gradient-to-br border-muted/20 ${summary.balance >= 0 ? 'from-blue-50 to-white border-blue-100' : 'from-orange-50 to-white border-orange-100'}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={`text-sm font-medium ${summary.balance >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>Saldo Líquido</CardTitle>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${summary.balance >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
                        <Wallet className={`h-5 w-5 ${summary.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                        {formatCurrency(summary.balance)}
                    </div>
                    <p className={`text-xs mt-1 ${summary.balance >= 0 ? 'text-blue-600/80' : 'text-orange-600/80'}`}>
                        Resultado final (Entradas - Saídas)
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
