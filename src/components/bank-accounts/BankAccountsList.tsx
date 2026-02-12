'use client'

import { BankAccountWithBalance } from '@/core/domain/BankAccount'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, CreditCard, Wallet, Edit, Power } from 'lucide-react'

interface BankAccountsListProps {
    accounts: BankAccountWithBalance[]
    onEdit: (account: BankAccountWithBalance) => void
    onToggleActive: (id: string, isActive: boolean) => void
}

export function BankAccountsList({ accounts, onEdit, onToggleActive }: BankAccountsListProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value)
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'BANK': return <Building2 className="h-4 w-4" />
            case 'CARD': return <CreditCard className="h-4 w-4" />
            case 'WALLET': return <Wallet className="h-4 w-4" />
            default: return null
        }
    }

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'BANK': return 'Banco'
            case 'CARD': return 'Cartão'
            case 'WALLET': return 'Carteira Digital'
            default: return type
        }
    }

    return (
        <div className="rounded-lg border bg-card/50 backdrop-blur-sm">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b bg-muted/50">
                            <th className="px-4 py-3 text-left text-sm font-medium">Nome</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Tipo</th>
                            <th className="px-4 py-3 text-right text-sm font-medium">Saldo Atual</th>
                            <th className="px-4 py-3 text-center text-sm font-medium">Status</th>
                            <th className="px-4 py-3 text-right text-sm font-medium">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts.map((account) => (
                            <tr key={account.id} className="border-b last:border-0 hover:bg-muted/30">
                                <td className="px-4 py-3 font-medium">{account.name}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        {getTypeIcon(account.type)}
                                        <span className="text-sm">{getTypeLabel(account.type)}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-right font-mono">
                                    {formatCurrency(account.currentBalance)}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <Badge variant={account.isActive ? 'default' : 'secondary'}>
                                        {account.isActive ? 'Ativa' : 'Inativa'}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onEdit(account)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onToggleActive(account.id, account.isActive)}
                                        >
                                            <Power className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
