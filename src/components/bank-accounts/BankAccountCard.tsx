'use client'

import { BankAccountWithBalance } from '@/core/domain/BankAccount'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Edit2, Star, Copy, TrendingUp, TrendingDown, MoreVertical, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
        <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800">
            {/* Decorative Top Gradient based on account color */}
            <div
                className="absolute top-0 left-0 w-full h-1"
                style={{ background: `linear-gradient(to r, ${account.color}, ${account.color}dd)` }}
            />

            <div className="p-5 relative z-10">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div
                            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-slate-50 text-2xl shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700"
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
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg leading-tight text-slate-900 truncate dark:text-slate-100 group-hover:text-primary transition-colors">
                                    {account.name}
                                </h3>
                                {account.isFavorite && (
                                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-500" />
                                )}
                            </div>
                            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">
                                {getTypeLabel(account.type)}
                            </p>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 -mr-2 relative z-20">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/contas/${account.id}`)}>
                                <ExternalLink className="mr-2 h-3.5 w-3.5" />
                                Ver Extrato
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(account)}>
                                <Edit2 className="mr-2 h-3.5 w-3.5" />
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onToggleActive(account.id, !account.isActive)}>
                                {account.isActive ? 'Arquivar' : 'Reativar'}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Balance Section */}
                <div className="mb-5">
                    <p className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Saldo Disponível</p>
                    <div className="flex items-baseline gap-2">
                        <h2 className={cn(
                            "text-3xl font-bold tracking-tight",
                            isNegative ? "text-red-500" : "text-slate-900 dark:text-slate-100"
                        )}>
                            {formatCurrency(account.currentBalance)}
                        </h2>
                        {isNegative ? (
                            <TrendingDown className="h-5 w-5 text-red-500" />
                        ) : (
                            <TrendingUp className="h-5 w-5 text-emerald-500" />
                        )}
                    </div>
                    {account.type === 'CARD' && account.creditLimit && (
                        <div className="mt-3 overflow-hidden rounded-lg border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between px-3 py-1.5 text-[10px] font-medium bg-slate-50 dark:bg-slate-800/50">
                                <span className="text-muted-foreground uppercase">Crédito Disponível</span>
                                <span className={cn(
                                    "font-bold",
                                    account.currentBalance < 0 ? "text-red-500" : "text-emerald-500"
                                )}>
                                    {((account.creditLimit + account.currentBalance) / account.creditLimit * 100).toFixed(0)}%
                                </span>
                            </div>
                            <div className="px-3 py-1 text-[10px] text-muted-foreground bg-white dark:bg-slate-900">
                                Limite: {formatCurrency(account.creditLimit)}
                            </div>
                        </div>
                    )}
                </div>

                {/* Account Details Box */}
                {(account.bankName || account.agency || account.accountNumber) && (
                    <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-700/50">
                        {account.bankName && (
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Instituição</span>
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[140px]">{account.bankName}</span>
                            </div>
                        )}
                        {(account.agency || account.accountNumber) && (
                            <div
                                className="flex justify-between items-center group/copy cursor-pointer py-1 border-t border-slate-200/50 dark:border-slate-700/30 mt-1"
                                onClick={() => copyToClipboard(`${account.agency} ${account.accountNumber}`, 'Dados bancários')}
                            >
                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Agência/Conta</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                                        {account.agency} / {account.accountNumber}
                                    </span>
                                    <Copy className="h-3 w-3 text-slate-400 opacity-0 group-hover/copy:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Simple hover edit button instead of footer */}
                <div className="flex items-center justify-between mt-4">
                    {!account.isActive && (
                        <Badge variant="outline" className="text-[9px] uppercase tracking-widest bg-slate-100 text-slate-500 px-1.5 py-0 border-slate-200">
                            Arquivada
                        </Badge>
                    )}
                    <div className="flex-1" />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 bg-slate-50 hover:bg-slate-100 hover:text-primary opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(account);
                        }}
                    >
                        <Edit2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </Card>
    )
}

