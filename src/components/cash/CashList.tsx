'use client'

import { CashMovement } from '@/core/domain/CashMovement'
import { GroupedMovement, groupMovements } from '@/lib/cash/groupMovements'
import { CashMovementDetailsDialog } from './CashMovementDetailsDialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
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
    Wallet
} from 'lucide-react'

const SOURCE_ICONS: Record<string, React.ReactNode> = {
    SALE: <ShoppingBag className="h-4 w-4 text-emerald-500" />,
    REFUND: <RotateCcw className="h-4 w-4 text-rose-500" />,
    PURCHASE: <Truck className="h-4 w-4 text-rose-500" />,
    MANUAL: <Settings className="h-4 w-4 text-slate-500" />,
    CREDIT: <Wallet className="h-4 w-4 text-purple-500" />,
}

const SOURCE_LABELS: Record<string, string> = {
    SALE: 'Venda',
    REFUND: 'Estorno',
    PURCHASE: 'Compra',
    MANUAL: 'Manual',
    CREDIT: 'Recarga de Crédito',
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

    // State to track expanded groups
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

    // Group movements
    const groupedMovements = useMemo(() => groupMovements(movements), [movements])

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

            // Fetch customer names from sales
            if (saleIds.size > 0) {
                try {
                    // Limitar a 50 IDs por vez para evitar URLs muito longas
                    const saleIdsArray = Array.from(saleIds)
                    const batchSize = 50
                    const customerMap: Record<string, string> = {}

                    for (let i = 0; i < saleIdsArray.length; i += batchSize) {
                        const batch = saleIdsArray.slice(i, i + batchSize)
                        const { data: sales, error } = await supabase
                            .from('sales')
                            .select('id, client_id, clients(name)')
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
                    }
                    setCustomerNames(customerMap)
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

    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="w-[140px]">Data</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="w-[120px]">Método</TableHead>
                        <TableHead className="w-[140px]">Tipo</TableHead>
                        <TableHead className="w-[150px]">Conta</TableHead>
                        <TableHead className="text-right w-[140px]">Valor</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {groupedMovements.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                Nenhuma movimentação no período.
                            </TableCell>
                        </TableRow>
                    ) : (
                        groupedMovements.map((item) => {
                            if (item._type === 'group') {
                                const isExpanded = expandedGroups[item.sourceId] || false
                                const isSale = item.sourceType === 'SALE'
                                const displayName = isSale
                                    ? (customerNames[item.sourceId] || 'Cliente')
                                    : (supplierNames[item.sourceId] || 'Fornecedor')
                                const Icon = isSale ? ShoppingCart : Package

                                return (
                                    <Fragment key={`group-${item.sourceId}`}>
                                        <TableRow
                                            className={cn(
                                                "cursor-pointer hover:bg-muted/50 transition-colors",
                                                isExpanded && "bg-muted/30 border-b-0"
                                            )}
                                            onClick={() => toggleGroup(item.sourceId)}
                                        >
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span>{format(new Date(item.date), "dd/MM/yyyy", { locale: ptBR })}</span>
                                                    <span className="text-xs text-muted-foreground">{format(new Date(item.date), "HH:mm", { locale: ptBR })}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className={cn("p-1.5 rounded-full shrink-0", isSale ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600")}>
                                                        <Icon className="h-3.5 w-3.5" />
                                                    </div>
                                                    <span className="font-medium">{isSale ? 'Venda' : 'Compra'} - {displayName}</span>
                                                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
                                                        {item.movements.length} itens
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-muted-foreground text-sm italic">Múltiplos</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    {SOURCE_ICONS[item.sourceType] || <Settings className="h-4 w-4" />}
                                                    <span className="text-sm">{SOURCE_LABELS[item.sourceType] || item.sourceType}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-muted-foreground text-sm">-</span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className={cn("font-bold", isSale ? "text-emerald-600" : "text-rose-600")}>
                                                    {formatCurrency(item.total)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                                            </TableCell>
                                        </TableRow>

                                        {isExpanded && item.movements.map((movement, idx) => (
                                            <TableRow key={movement.id} className="bg-muted/10 border-t-0">
                                                <TableCell className="pl-8 text-xs text-muted-foreground">
                                                    {formatBrazilDate(movement.occurredAt, "HH:mm")}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-muted-foreground ml-8">{movement.description || "Pagamento parcial"}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="font-normal capitalize text-xs">
                                                        {movement.method === 'WALLET' ? 'Carteira' :
                                                            movement.method === 'CASH' ? 'Dinheiro' :
                                                                movement.method === 'CARD' ? 'Cartão' :
                                                                    movement.method === 'PIX' ? 'Pix' :
                                                                        movement.method === 'TRANSFER' ? 'Transf.' : movement.method}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell></TableCell>
                                                <TableCell>
                                                    <span className="text-xs text-muted-foreground">
                                                        {accountNames[movement.bankAccountId] || '...'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className="text-sm font-medium opacity-80">
                                                        {formatCurrency(movement.amount)}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); handleViewDetails(movement) }}>
                                                        <Eye className="h-3 w-3 text-muted-foreground" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </Fragment>
                                )
                            } else {
                                // Single movement
                                const movement = item
                                const Icon = movement.type === 'IN' ? ArrowUpCircle : ArrowDownCircle
                                const colorClass = movement.type === 'IN' ? "text-emerald-600" : "text-rose-600"

                                return (
                                    <TableRow key={movement.id} className="hover:bg-muted/50">
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm">
                                                    {formatBrazilDate(movement.occurredAt, "dd/MM/yyyy")}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {formatBrazilDate(movement.occurredAt, "HH:mm")}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm font-medium">{movement.description || "-"}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="font-normal capitalize bg-muted text-muted-foreground hover:bg-muted">
                                                {movement.method === 'WALLET' ? 'Carteira' :
                                                    movement.method === 'CASH' ? 'Dinheiro' :
                                                        movement.method === 'CARD' ? 'Cartão' :
                                                            movement.method === 'PIX' ? 'Pix' :
                                                                movement.method === 'TRANSFER' ? 'Transf.' : movement.method}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {SOURCE_ICONS[movement.sourceType] || <Settings className="h-4 w-4 text-muted-foreground" />}
                                                <span className="text-sm text-muted-foreground">{SOURCE_LABELS[movement.sourceType] || movement.sourceType}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">
                                                {accountNames[movement.bankAccountId] || '...'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className={cn("font-bold flex items-center justify-end gap-1", colorClass)}>
                                                {movement.type === 'IN' ? <ArrowUpCircle className="h-3 w-3" /> : <ArrowDownCircle className="h-3 w-3" />}
                                                {formatCurrency(movement.amount)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleViewDetails(movement)}
                                                className="h-8 w-8 text-muted-foreground"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )
                            }
                        })
                    )}
                </TableBody>
            </Table>

            <CashMovementDetailsDialog
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                movement={selectedMovement}
            />
        </div>
    )
}
