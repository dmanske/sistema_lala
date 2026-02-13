
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react'
import { BankAccountWithBalance } from '@/core/domain/BankAccount'

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
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
                    <Wallet className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
                    <p className="text-xs text-muted-foreground">
                        {accounts.filter(a => a.isActive).length} contas ativas
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-green-500/20 hover:border-green-500/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Saldos Positivos</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(positiveBalance)}</div>
                    <p className="text-xs text-muted-foreground">
                        {accounts.filter(a => a.isActive && a.currentBalance > 0).length} contas
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-red-500/20 hover:border-red-500/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Saldos Negativos</CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">{formatCurrency(-negativeBalance)}</div>
                    <p className="text-xs text-muted-foreground">
                        {accounts.filter(a => a.isActive && a.currentBalance < 0).length} contas
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
