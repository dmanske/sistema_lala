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
    const isPositive = summary.balance >= 0

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Entradas</span>
                    <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
                    </div>
                </div>
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(summary.totalIn)}</p>
                <p className="text-xs text-slate-400 mt-1">Total de recebimentos no período</p>
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Saídas</span>
                    <div className="h-8 w-8 rounded-xl bg-rose-50 flex items-center justify-center">
                        <ArrowDownCircle className="h-4 w-4 text-rose-500" />
                    </div>
                </div>
                <p className="text-2xl font-bold text-rose-500">{formatCurrency(summary.totalOut)}</p>
                <p className="text-xs text-slate-400 mt-1">Total de pagamentos no período</p>
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Saldo Líquido</span>
                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${isPositive ? 'bg-blue-50' : 'bg-amber-50'}`}>
                        <Wallet className={`h-4 w-4 ${isPositive ? 'text-blue-500' : 'text-amber-500'}`} />
                    </div>
                </div>
                <p className={`text-2xl font-bold ${isPositive ? 'text-blue-600' : 'text-amber-600'}`}>
                    {formatCurrency(summary.balance)}
                </p>
                <p className="text-xs text-slate-400 mt-1">Resultado final (Entradas − Saídas)</p>
            </div>
        </div>
    )
}
