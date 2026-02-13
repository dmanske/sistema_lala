import { Card, CardContent } from '@/components/ui/card'
import { Wallet, TrendingUp, TrendingDown, Target, Landmark } from 'lucide-react'
import { BankAccountWithBalance } from '@/core/domain/BankAccount'
import { cn } from '@/lib/utils'

interface StatsCardsProps {
    accounts: BankAccountWithBalance[]
}

export function StatsCards({ accounts }: StatsCardsProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value)
    }

    const totalBalance = accounts
        .filter(a => a.isActive)
        .reduce((sum, a) => sum + a.currentBalance, 0)

    const positiveBalance = accounts
        .filter(a => a.isActive && a.currentBalance > 0)
        .reduce((sum, a) => sum + a.currentBalance, 0)

    const negativeBalance = accounts
        .filter(a => a.isActive && a.currentBalance < 0)
        .reduce((sum, a) => sum + Math.abs(a.currentBalance), 0)

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="group relative overflow-hidden bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:shadow-md transition-all duration-300">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/60 to-primary" />
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-primary/10 text-primary rounded-xl dark:bg-primary/20">
                            <Wallet className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                            Patrimônio Total
                        </span>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                            {formatCurrency(totalBalance)}
                        </h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Landmark className="h-3 w-3" />
                            {accounts.filter(a => a.isActive).length} contas ativas gerenciadas
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card className="group relative overflow-hidden bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:shadow-md transition-all duration-300">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl dark:bg-emerald-900/20 dark:text-emerald-400">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/80 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                            Saldo Disponível
                        </span>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
                            {formatCurrency(positiveBalance)}
                        </h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Target className="h-3 w-3" />
                            {accounts.filter(a => a.isActive && a.currentBalance > 0).length} contas com saldo positivo
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card className="group relative overflow-hidden bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:shadow-md transition-all duration-300">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 to-rose-600" />
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl dark:bg-rose-900/20 dark:text-rose-400">
                            <TrendingDown className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600/80 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400 px-2 py-0.5 rounded-full">
                            Total de Dívidas
                        </span>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400 tracking-tight">
                            {formatCurrency(-negativeBalance)}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            {accounts.filter(a => a.isActive && a.currentBalance < 0).length} contas com saldo devedor
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

