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
            className="group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-primary/20 cursor-pointer"
        >
            {/* Gradient Background Decoration */}
            <div
                className="absolute top-0 left-0 w-full h-1.5 transition-all duration-300 group-hover:h-2"
                style={{ backgroundColor: account.color }}
            />

            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-5 blur-3xl transition-all duration-500 group-hover:opacity-20 group-hover:scale-150"
                style={{ backgroundColor: account.color }}
            />

            <div className="p-6 relative z-10">
                {/* Header */}
                <div
                    className="flex items-start justify-between mb-4"
                    onClick={() => router.push(`/contas/${account.id}`)}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50 text-2xl shadow-inner border border-white/10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                            style={{ color: account.color }}
                        >
                            {isEmoji(account.icon) ? (
                                <span>{account.icon}</span>
                            ) : (
                                (() => {
                                    const Logo = BankLogos[account.icon] || BankLogos['generic-bank']
                                    return <Logo className="h-6 w-6" />
                                })()
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                                    {account.name}
                                </h3>
                                {account.isFavorite && (
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-500 animate-pulse" />
                                )}
                            </div>
                            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mt-1">
                                {getTypeLabel(account.type)}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary/10 hover:text-primary focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-primary"
                            onClick={() => onEdit(account)}
                            title="Editar"
                            aria-label="Editar conta"
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Balance Section */}
                <div className="mb-4">
                    <p className="text-[11px] font-medium text-muted-foreground mb-2 uppercase tracking-wide">Saldo Disponível</p>
                    <div className="flex items-baseline gap-2">
                        <h2 className={cn(
                            "text-3xl font-bold tracking-tight transition-all duration-300 group-hover:scale-105",
                            isNegative ? "text-red-500" : "text-foreground"
                        )}>
                            {formatCurrency(account.currentBalance)}
                        </h2>
                        {isNegative ? (
                            <TrendingDown className="h-5 w-5 text-red-500" />
                        ) : (
                            <TrendingUp className="h-5 w-5 text-green-500" />
                        )}
                    </div>
                    {account.type === 'CARD' && account.creditLimit && (
                        <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border/50">
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
                    <div className="flex flex-col gap-2 p-3 rounded-lg bg-muted/40 text-[11px] border border-border/50 transition-all duration-300 group-hover:bg-muted/60">
                        {account.bankName && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Banco</span>
                                <span className="font-medium truncate max-w-[140px]">{account.bankName}</span>
                            </div>
                        )}
                        {(account.agency || account.accountNumber) && (
                            <div className="flex justify-between items-center group/copy cursor-pointer hover:bg-muted/60 -mx-1 px-1 py-1 rounded transition-colors"
                                onClick={() => copyToClipboard(`${account.agency} ${account.accountNumber}`, 'Dados bancários')}
                                role="button"
                                tabIndex={0}
                                aria-label="Copiar dados bancários"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        copyToClipboard(`${account.agency} ${account.accountNumber}`, 'Dados bancários');
                                    }
                                }}
                            >
                                <span className="text-muted-foreground">Ag/Conta</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium font-mono">
                                        {account.agency} / {account.accountNumber}
                                    </span>
                                    <Copy className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover/copy:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer Status */}
            <div className={cn(
                "h-1 w-full transition-all duration-300",
                account.isActive ? "bg-muted group-hover:bg-primary/20" : "bg-muted-foreground/20"
            )} />
        </div>
    )
}
