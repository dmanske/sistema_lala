'use client'

import { CashMovement } from '@/core/domain/CashMovement'
import { GroupedMovement, groupMovements } from '@/lib/cash/groupMovements'
import { groupMovementsByDay, DayGroup } from '@/lib/cash/groupByDate'
import { CashMovementDetailsDialog } from './CashMovementDetailsDialog'
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { formatBrazilDate } from "@/lib/utils/dateUtils"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState, useMemo, Fragment } from 'react'
import { SupabaseBankAccountRepository } from '@/infrastructure/repositories/supabase/SupabaseBankAccountRepository'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
    ArrowUpCircle,
    ArrowDownCircle,
    ShoppingBag,
    RotateCcw,
    Truck,
    Settings,
    Eye,
    ChevronDown,
    ChevronRight,
    Package,
    ShoppingCart,
    Wallet,
    HandCoins,
    Calendar
} from 'lucide-react'

const SOURCE_ICONS: Record<string, React.ReactNode> = {
    SALE: <ShoppingBag className="h-4 w-4 text-emerald-500" />,
    REFUND: <RotateCcw className="h-4 w-4 text-rose-500" />,
    PURCHASE: <Truck className="h-4 w-4 text-rose-500" />,
    MANUAL: <Settings className="h-4 w-4 text-slate-500" />,
    CREDIT: <Wallet className="h-4 w-4 text-purple-500" />,
    PAYMENT: <HandCoins className="h-4 w-4 text-orange-500" />,
    RECEIVABLE: <HandCoins className="h-4 w-4 text-green-500" />,
}

const SOURCE_LABELS: Record<string, string> = {
    SALE: 'Venda',
    REFUND: 'Estorno',
    PURCHASE: 'Compra',
    MANUAL: 'Manual',
    CREDIT: 'Recarga de Crédito',
    PAYMENT: 'Contas a Pagar',
    RECEIVABLE: 'Contas a Receber',
}

interface CashListProps {
    movements: CashMovement[]
}

export function CashList({ movements }: CashListProps) {
    const [accountNames, setAccountNames] = useState<Record<string, string>>({})
    const [customerNames, setCustomerNames] = useState<Record<string, string>>({})
    const [supplierNames, setSupplierNames] = useState<Record<string, string>>({})
    const [selectedMovement, setSelectedMovement] = useState<CashMovement | null>(null)
    const [detailsOpen, setDetailsOpen] = useState(false)
    const [salesWithFiado, setSalesWithFiado] = useState<Set<string>>(new Set())
    const [fiadoAmounts, setFiadoAmounts] = useState<Record<string, number>>({})
    const [salesWithCredit, setSalesWithCredit] = useState<Set<string>>(new Set())
    const [creditAmounts, setCreditAmounts] = useState<Record<string, number>>({})
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
    const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({})

    // Agrupar por dia
    const dayGroups = useMemo(() => groupMovementsByDay(movements), [movements])

    // Auto-expandir o primeiro dia
    useEffect(() => {
        if (dayGroups.length > 0 && Object.keys(expandedDays).length === 0) {
            setExpandedDays({ [dayGroups[0].dateKey]: true })
        }
    }, [dayGroups])

    const handleViewDetails = (movement: CashMovement) => {
        setSelectedMovement(movement)
        setDetailsOpen(true)
    }

    const toggleGroup = (groupId: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }))
    }

    const toggleDay = (dateKey: string) => {
        setExpandedDays(prev => ({
            ...prev,
            [dateKey]: !prev[dateKey]
        }))
    }

    useEffect(() => {
        async function loadAccountNames() {
            const supabase = createClient()
            const repo = new SupabaseBankAccountRepository(supabase)
            const accounts = await repo.list()
            const names: Record<string, string> = {}
            accounts.forEach(account => {
                names[account.id] = account.name
            })
            setAccountNames(names)
        }
        loadAccountNames()
    }, [])

    useEffect(() => {
        async function loadCustomerAndSupplierNames() {
            const supabase = createClient()

            // Get unique sale and purchase IDs
            const saleIds = new Set<string>()
            const purchaseIds = new Set<string>()

            movements.forEach(m => {
                if (m.sourceId) {
                    if (m.sourceType === 'SALE') saleIds.add(m.sourceId)
                    if (m.sourceType === 'PURCHASE') purchaseIds.add(m.sourceId)
                }
            })

            // Fetch customer names from sales AND check for fiado payments
            if (saleIds.size > 0) {
                try {
                    // Limitar a 50 IDs por vez para evitar URLs muito longas
                    const saleIdsArray = Array.from(saleIds)
                    const batchSize = 50
                    const customerMap: Record<string, string> = {}
                    const fiadoSet = new Set<string>()

                    for (let i = 0; i < saleIdsArray.length; i += batchSize) {
                        const batch = saleIdsArray.slice(i, i + batchSize)
                        const { data: sales, error } = await supabase
                            .from('sales')
                            .select('id, customer_id, clients(name)')
                            .in('id', batch)

                        if (error) {
                            console.error('Erro ao buscar vendas:', error)
                            // Se der erro de autenticação, tenta refresh
                            if (error.message.includes('JWT') || error.message.includes('auth')) {
                                const { error: refreshError } = await supabase.auth.refreshSession()
                                if (refreshError) {
                                    console.error('Erro ao fazer refresh da sessão:', refreshError)
                                }
                            }
                            continue
                        }

                        sales?.forEach((sale: any) => {
                            if (sale && sale.clients?.name) {
                                customerMap[sale.id] = sale.clients.name
                            }
                        })

                        // Check for fiado payments in these sales
                        const { data: payments } = await supabase
                            .from('sale_payments')
                            .select('sale_id, method, amount')
                            .in('sale_id', batch)

                        const fiadoMap: Record<string, number> = {}
                        const creditMap: Record<string, number> = {}
                        const creditSet = new Set<string>()
                        
                        payments?.forEach((payment: any) => {
                            if (payment.method?.toLowerCase() === 'fiado') {
                                fiadoSet.add(payment.sale_id)
                                fiadoMap[payment.sale_id] = (fiadoMap[payment.sale_id] || 0) + parseFloat(payment.amount)
                            } else if (payment.method?.toLowerCase() === 'credit' || payment.method?.toLowerCase() === 'wallet') {
                                creditSet.add(payment.sale_id)
                                creditMap[payment.sale_id] = (creditMap[payment.sale_id] || 0) + parseFloat(payment.amount)
                            }
                        })
                        
                        setFiadoAmounts(prev => ({ ...prev, ...fiadoMap }))
                        setCreditAmounts(prev => ({ ...prev, ...creditMap }))
                        setSalesWithCredit(prev => new Set([...prev, ...creditSet]))
                    }
                    setCustomerNames(customerMap)
                    setSalesWithFiado(fiadoSet)
                } catch (error) {
                    console.error('Erro ao carregar nomes de clientes:', error)
                }
            }

            // Fetch supplier names from purchases
            if (purchaseIds.size > 0) {
                try {
                    // Limitar a 50 IDs por vez para evitar URLs muito longas
                    const purchaseIdsArray = Array.from(purchaseIds)
                    const batchSize = 50
                    const supplierMap: Record<string, string> = {}

                    for (let i = 0; i < purchaseIdsArray.length; i += batchSize) {
                        const batch = purchaseIdsArray.slice(i, i + batchSize)
                        const { data: purchases, error } = await supabase
                            .from('purchases')
                            .select('id, supplier_id, suppliers(name)')
                            .in('id', batch)

                        if (error) {
                            console.error('Erro ao buscar compras:', error)
                            // Se der erro de autenticação, tenta refresh
                            if (error.message.includes('JWT') || error.message.includes('auth')) {
                                const { error: refreshError } = await supabase.auth.refreshSession()
                                if (refreshError) {
                                    console.error('Erro ao fazer refresh da sessão:', refreshError)
                                }
                            }
                            continue
                        }

                        purchases?.forEach((purchase: any) => {
                            if (purchase && purchase.suppliers?.name) {
                                supplierMap[purchase.id] = purchase.suppliers.name
                            }
                        })
                    }
                    setSupplierNames(supplierMap)
                } catch (error) {
                    console.error('Erro ao carregar nomes de fornecedores:', error)
                }
            }
        }

        if (movements.length > 0) {
            loadCustomerAndSupplierNames()
        }
    }, [movements])

    // Renderizar movimento individual
    const renderMovement = (movement: CashMovement, isNested = false) => {
        const Icon = movement.type === 'IN' ? ArrowUpCircle : ArrowDownCircle
        const colorClass = movement.type === 'IN' ? "text-emerald-600" : "text-rose-600"

        return (
            <div 
                key={movement.id}
                className={cn(
                    "flex items-center justify-between py-3 px-4 hover:bg-muted/30 transition-colors border-b last:border-b-0",
                    isNested && "bg-muted/10 pl-12"
                )}
            >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground w-12 shrink-0">
                        {formatBrazilDate(movement.occurredAt, "HH:mm")}
                    </div>
                    
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        {SOURCE_ICONS[movement.sourceType] || <Settings className="h-4 w-4 text-muted-foreground" />}
                        <span className="text-sm font-medium truncate">{movement.description || "-"}</span>
                    </div>

                    <Badge variant="secondary" className="font-normal capitalize text-xs shrink-0">
                        {movement.method === 'WALLET' ? 'Carteira' :
                            movement.method === 'CASH' ? 'Dinheiro' :
                                movement.method === 'CARD' ? 'Cartão' :
                                    movement.method === 'PIX' ? 'Pix' :
                                        movement.method === 'TRANSFER' ? 'Transf.' : movement.method}
                    </Badge>
                </div>

                <div className="flex items-center gap-3 ml-4">
                    <div className={cn("font-bold text-sm flex items-center gap-1 w-28 justify-end", colorClass)}>
                        {movement.type === 'IN' ? <ArrowUpCircle className="h-3 w-3" /> : <ArrowDownCircle className="h-3 w-3" />}
                        {formatCurrency(movement.amount)}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDetails(movement)}
                        className="h-7 w-7 shrink-0"
                    >
                        <Eye className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>
        )
    }

    // Renderizar grupo de venda/compra
    const renderGroupedMovement = (item: GroupedMovement, dayKey: string) => {
        const isExpanded = expandedGroups[`${dayKey}-${item.sourceId}`] || false
        const isSale = item.sourceType === 'SALE'
        const displayName = isSale
            ? (customerNames[item.sourceId] || 'Cliente')
            : (supplierNames[item.sourceId] || 'Fornecedor')
        const Icon = isSale ? ShoppingCart : Package
        const hasFiado = isSale && salesWithFiado.has(item.sourceId)
        const fiadoAmount = hasFiado ? fiadoAmounts[item.sourceId] : 0
        const hasCredit = isSale && salesWithCredit.has(item.sourceId)
        const creditAmount = hasCredit ? creditAmounts[item.sourceId] : 0

        return (
            <Fragment key={`group-${dayKey}-${item.sourceId}`}>
                <div
                    className={cn(
                        "flex items-center justify-between py-3 px-4 cursor-pointer hover:bg-muted/50 transition-colors border-b",
                        isExpanded && "bg-muted/30"
                    )}
                    onClick={() => toggleGroup(`${dayKey}-${item.sourceId}`)}
                >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="text-xs text-muted-foreground w-12 shrink-0">
                            {format(new Date(item.date), "HH:mm", { locale: ptBR })}
                        </div>
                        
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className={cn("p-1.5 rounded-full shrink-0", isSale ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600")}>
                                <Icon className="h-3.5 w-3.5" />
                            </div>
                            <span className="font-medium text-sm">{isSale ? 'Venda' : 'Compra'} - {displayName}</span>
                            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
                                {item.movements.length} itens
                            </Badge>
                            {hasFiado && (
                                <Badge variant="destructive" className="text-[10px] h-5 px-1.5 font-medium gap-1">
                                    <HandCoins className="h-2.5 w-2.5" />
                                    Fiado: {formatCurrency(fiadoAmount)}
                                </Badge>
                            )}
                            {hasCredit && (
                                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-medium gap-1 bg-purple-100 text-purple-700">
                                    <Wallet className="h-2.5 w-2.5" />
                                    Crédito: {formatCurrency(creditAmount)}
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 ml-4">
                        <div className={cn("font-bold text-sm w-28 text-right", isSale ? "text-emerald-600" : "text-rose-600")}>
                            {formatCurrency(item.total)}
                        </div>
                        {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                    </div>
                </div>

                {isExpanded && item.movements.map((movement) => renderMovement(movement, true))}
            </Fragment>
        )
    }

    if (dayGroups.length === 0) {
        return (
            <div className="rounded-lg border bg-card p-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma movimentação no período selecionado.</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {dayGroups.map((dayGroup) => {
                const isExpanded = expandedDays[dayGroup.dateKey] || false
                const groupedMovements = groupMovements(dayGroup.movements)

                return (
                    <div key={dayGroup.dateKey} className="rounded-lg border bg-card overflow-hidden">
                        {/* Header do Dia */}
                        <div
                            className="flex items-center justify-between p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors sticky top-0 z-10"
                            onClick={() => toggleDay(dayGroup.dateKey)}
                        >
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-semibold capitalize">{dayGroup.displayDate}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {dayGroup.movements.length} {dayGroup.movements.length === 1 ? 'transação' : 'transações'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <div className={cn("font-bold", dayGroup.netAmount >= 0 ? "text-emerald-600" : "text-rose-600")}>
                                        {formatCurrency(dayGroup.netAmount)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        <span className="text-emerald-600">+{formatCurrency(dayGroup.totalIn)}</span>
                                        {' / '}
                                        <span className="text-rose-600">-{formatCurrency(dayGroup.totalOut)}</span>
                                    </div>
                                </div>
                                {isExpanded ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
                            </div>
                        </div>

                        {/* Movimentos do Dia */}
                        {isExpanded && (
                            <div className="divide-y">
                                {groupedMovements.map((item) => {
                                    if (item._type === 'group') {
                                        return renderGroupedMovement(item, dayGroup.dateKey)
                                    } else {
                                        return renderMovement(item)
                                    }
                                })}
                            </div>
                        )}
                    </div>
                )
            })}

            <CashMovementDetailsDialog
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                movement={selectedMovement}
            />
        </div>
    )
}
