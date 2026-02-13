'use client'

import { BankAccountWithBalance } from '@/core/domain/BankAccount'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Star, Copy, TrendingUp, TrendingDown } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { BankLogos, isEmoji } from './BankLogos'


interface BankAccountCardProps {
    account: BankAccountWithBalance
    onEdit: (account: BankAccountWithBalance) => void
    onToggleActive: (id: string, isActive: boolean) => void
}

export function BankAccountCard({ account, onEdit, onToggleActive }: BankAccountCardProps) {
    const router = useRouter()
    const isNegative = account.currentBalance < 0

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value)
    }

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'BANK': return 'Banco'
            case 'CARD': return 'Cartão de Crédito'
            case 'WALLET': return 'Carteira Digital'
            default: return type
        }
    }

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text)
        toast.success(`${label} copiado!`)
    }

    return (
        <div
            className="group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
        >
            {/* Gradient Background Decoration */}
            <div
                className="absolute top-0 left-0 w-full h-1.5"
                style={{ backgroundColor: account.color }}
            />

            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-5 blur-3xl transition-all group-hover:opacity-10"
                style={{ backgroundColor: account.color }}
            />

            <div className="p-5 relative z-10">
                {/* Header */}
                <div
                    className="flex items-start justify-between mb-3 cursor-pointer"
                    onClick={() => router.push(`/contas/${account.id}`)}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50 text-xl shadow-inner border border-white/10"
                            style={{ color: account.color }}
                        >
                            {isEmoji(account.icon) ? (
                                <span>{account.icon}</span>
                            ) : (
                                (() => {
                                    const Logo = BankLogos[account.icon] || BankLogos['generic-bank']
                                    return <Logo className="h-5 w-5" /> // Lucide icons accept className
                                })()
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-base leading-tight group-hover:text-primary transition-colors">
                                    {account.name}
                                </h3>
                                {account.isFavorite && (
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-500" />
                                )}
                            </div>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
                                {getTypeLabel(account.type)}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => onEdit(account)}
                            title="Editar"
                        >
                            <Edit className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>

                {/* Balance Section */}
                <div className="mb-4">
                    <p className="text-[10px] font-medium text-muted-foreground mb-1 uppercase tracking-wide">Saldo Disponível</p>
                    <div className="flex items-baseline gap-2">
                        <h2 className={cn(
                            "text-2xl font-bold tracking-tight",
                            isNegative ? "text-red-500" : "text-foreground"
                        )}>
                            {formatCurrency(account.currentBalance)}
                        </h2>
                        {isNegative ? (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                        ) : (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        )}
                    </div>
                    {account.type === 'CARD' && account.creditLimit && (
                        <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground bg-muted/30 p-2 rounded-md">
                            <span>Limite: {formatCurrency(account.creditLimit)}</span>
                            <span className={cn(
                                "font-medium",
                                account.currentBalance < 0 ? "text-red-500" : "text-green-500"
                            )}>
                                {((account.creditLimit + account.currentBalance) / account.creditLimit * 100).toFixed(0)}% disp.
                            </span>
                        </div>
                    )}
                </div>

                {/* Account Details */}
                {(account.bankName || account.agency || account.accountNumber) && (
                    <div className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-muted/40 text-[10px] border border-border/50">
                        {account.bankName && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Banco</span>
                                <span className="font-medium truncate max-w-[120px]">{account.bankName}</span>
                            </div>
                        )}
                        {(account.agency || account.accountNumber) && (
                            <div className="flex justify-between items-center group/copy cursor-pointer"
                                onClick={() => copyToClipboard(`${account.agency} ${account.accountNumber}`, 'Dados bancários')}>
                                <span className="text-muted-foreground">Ag/Conta</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="font-medium font-mono">
                                        {account.agency} / {account.accountNumber}
                                    </span>
                                    <Copy className="h-3 w-3 text-muted-foreground opacity-0 group-hover/copy:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer Status */}
            <div className={cn(
                "h-1 w-full transition-colors",
                account.isActive ? "bg-muted" : "bg-muted-foreground/20"
            )} />
        </div>
    )
}
