"use client"

import { Client } from "@/core/domain/Client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Phone, MessageCircle, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"

interface CheckoutHeaderProps {
    client: Client
}

export function CheckoutHeader({ client }: CheckoutHeaderProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-500/10 text-green-700 border-green-200'
            case 'ATTENTION':
                return 'bg-yellow-500/10 text-yellow-700 border-yellow-200'
            case 'INACTIVE':
                return 'bg-gray-500/10 text-gray-700 border-gray-200'
            default:
                return 'bg-gray-500/10 text-gray-700 border-gray-200'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'Cliente Ativo'
            case 'ATTENTION':
                return 'Atenção'
            case 'INACTIVE':
                return 'Inativo'
            default:
                return status
        }
    }

    const getCreditBalanceColor = (balance: number) => {
        if (balance > 0) return 'text-green-600'
        if (balance < 0) return 'text-red-600'
        return 'text-gray-600'
    }

    const getCreditBalanceIcon = (balance: number) => {
        if (balance < 0) return '⚠️'
        return '💰'
    }

    const formatPhone = (phone?: string) => {
        if (!phone) return null
        // Remove non-numeric characters
        const cleaned = phone.replace(/\D/g, '')
        // Format as (XX) XXXXX-XXXX or (XX) XXXX-XXXX
        if (cleaned.length === 11) {
            return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
        } else if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
        }
        return phone
    }

    const getInitials = (name: string) => {
        const parts = name.split(' ')
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        }
        return name.slice(0, 2).toUpperCase()
    }

    return (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between gap-4">
                {/* Left: Avatar + Name + Contact */}
                <div className="flex items-center gap-4 flex-1">
                    <Avatar className="h-16 w-16 border-2 border-purple-200">
                        <AvatarImage src={client.photoUrl} alt={client.name} />
                        <AvatarFallback className="bg-purple-100 text-purple-700 text-lg font-semibold">
                            {getInitials(client.name)}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-2xl font-bold text-gray-900">{client.name}</h2>
                            <Badge className={cn("border", getStatusColor(client.status))}>
                                {getStatusLabel(client.status)}
                            </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                            {client.phone && (
                                <a
                                    href={`tel:${client.phone}`}
                                    className="flex items-center gap-1 hover:text-purple-600 transition-colors"
                                >
                                    <Phone className="h-4 w-4" />
                                    <span>{formatPhone(client.phone)}</span>
                                </a>
                            )}

                            {client.whatsapp && (
                                <a
                                    href={`https://wa.me/${client.whatsapp.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 hover:text-green-600 transition-colors"
                                >
                                    <MessageCircle className="h-4 w-4" />
                                    <span>WhatsApp</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Credit Balance */}
                <div className="text-right">
                    <div className="text-sm text-gray-600 mb-1 flex items-center justify-end gap-1">
                        <Wallet className="h-4 w-4" />
                        <span>Saldo</span>
                    </div>
                    <div className={cn("text-2xl font-bold flex items-center gap-1", getCreditBalanceColor(client.creditBalance))}>
                        <span>{getCreditBalanceIcon(client.creditBalance)}</span>
                        <span>
                            {client.creditBalance < 0 ? '-' : ''}R$ {Math.abs(client.creditBalance).toFixed(2)}
                        </span>
                    </div>
                    {client.creditBalance < 0 && (
                        <div className="text-xs text-red-600 mt-1">Fiado pendente</div>
                    )}
                </div>
            </div>
        </div>
    )
}
