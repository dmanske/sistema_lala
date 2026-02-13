'use client'

import { BankAccountWithBalance } from '@/core/domain/BankAccount'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Power, Eye, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface BankAccountCardProps {
    account: BankAccountWithBalance
    onEdit: (account: BankAccountWithBalance) => void
    onToggleActive: (id: string, isActive: boolean) => void
}

export function BankAccountCard({ account, onEdit, onToggleActive }: BankAccountCardProps) {
    const router = useRouter()

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value)
    }

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'BANK': return 'Banco'
            case 'CARD': return 'Cartão'
            case 'WALLET': return 'Carteira Digital'
            default: return type
        }
    }

    const isNegative = account.currentBalance < 0

    return (
        <div 
            className="relative rounded-lg border-2 bg-card/50 backdrop-blur-sm p-6 hover:shadow-lg transition-all"
            style={{ borderColor: account.color }}
        >
            {/* Favorita */}
            {account.isFavorite && (
                <div className="absolute top-3 right-3">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                </div>
            )}

            {/* Ícone e Nome */}
            <div className="flex items-start gap-4 mb-4">
                <div 
                    className="text-5xl p-3 rounded-lg"
                    style={{ backgroundColor: `${account.color}20` }}
                >
                    {account.icon}
                </div>
                <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">{account.name}</h3>
                    <p className="text-sm text-muted-foreground">{getTypeLabel(account.type)}</p>
                    {account.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {account.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Saldo */}
            <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-1">Saldo Atual</p>
                <p className={`text-3xl font-bold ${isNegative ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(account.currentBalance)}
                </p>
                {account.creditLimit && (
                    <p className="text-xs text-muted-foreground mt-1">
                        Limite: {formatCurrency(account.creditLimit)}
                    </p>
                )}
            </div>

            {/* Dados Bancários */}
            {(account.bankName || account.agency || account.accountNumber) && (
                <div className="mb-4 p-3 rounded bg-muted/30 text-xs space-y-1">
                    {account.bankName && <p><span className="font-medium">Banco:</span> {account.bankName}</p>}
                    {account.agency && account.accountNumber && (
                        <p><span className="font-medium">Ag/Conta:</span> {account.agency} / {account.accountNumber}</p>
                    )}
                </div>
            )}

            {/* Status e Ações */}
            <div className="flex items-center justify-between pt-4 border-t">
                <Badge variant={account.isActive ? 'default' : 'secondary'}>
                    {account.isActive ? 'Ativa' : 'Inativa'}
                </Badge>
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/contas/${account.id}`)}
                        title="Ver Dashboard"
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(account)}
                        title="Editar"
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleActive(account.id, account.isActive)}
                        title={account.isActive ? 'Desativar' : 'Ativar'}
                    >
                        <Power className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
