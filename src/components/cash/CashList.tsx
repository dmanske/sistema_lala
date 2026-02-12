'use client'

import { CashMovement } from '@/core/domain/CashMovement'
import { GroupedMovement, groupMovements } from '@/lib/cash/groupMovements'
import { CashMovementGroup } from './CashMovementGroup'
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
import { Badge } from "@/components/ui/badge"
import { useEffect, useState, useMemo } from 'react'
import { SupabaseBankAccountRepository } from '@/infrastructure/repositories/supabase/SupabaseBankAccountRepository'
import { createClient } from '@/lib/supabase/client'

import { ArrowUpCircle, ArrowDownCircle, ShoppingBag, RotateCcw, Truck, Settings, Eye } from 'lucide-react'

const SOURCE_ICONS: Record<string, React.ReactNode> = {
    SALE: <ShoppingBag className="h-3.5 w-3.5 text-emerald-500" />,
    REFUND: <RotateCcw className="h-3.5 w-3.5 text-rose-500" />,
    PURCHASE: <Truck className="h-3.5 w-3.5 text-rose-500" />,
    MANUAL: <Settings className="h-3.5 w-3.5 text-slate-500" />,
}

const SOURCE_LABELS: Record<string, string> = {
    SALE: 'Venda',
    REFUND: 'Estorno',
    PURCHASE: 'Compra',
    MANUAL: 'Manual',
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

    // Group movements
    const groupedMovements = useMemo(() => groupMovements(movements), [movements])

    const handleViewDetails = (movement: CashMovement) => {
        setSelectedMovement(movement)
        setDetailsOpen(true)
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
                const { data: sales } = await supabase
                    .from('sales')
                    .select('id, client_id, clients(name)')
                    .in('id', Array.from(saleIds))
                
                const customerMap: Record<string, string> = {}
                sales?.forEach((sale: any) => {
                    if (sale.clients?.name) {
                        customerMap[sale.id] = sale.clients.name
                    }
                })
                setCustomerNames(customerMap)
            }

            // Fetch supplier names from purchases
            if (purchaseIds.size > 0) {
                const { data: purchases } = await supabase
                    .from('purchases')
                    .select('id, supplier_id, suppliers(name)')
                    .in('id', Array.from(purchaseIds))
                
                const supplierMap: Record<string, string> = {}
                purchases?.forEach((purchase: any) => {
                    if (purchase.suppliers?.name) {
                        supplierMap[purchase.id] = purchase.suppliers.name
                    }
                })
                setSupplierNames(supplierMap)
            }
        }
        
        if (movements.length > 0) {
            loadCustomerAndSupplierNames()
        }
    }, [movements])

    return (
        <div className="space-y-4">
            {groupedMovements.length === 0 ? (
                <div className="rounded-xl border border-white/20 bg-white/40 backdrop-blur-sm p-12 text-center text-muted-foreground">
                    Nenhuma movimentação no período.
                </div>
            ) : (
                groupedMovements.map((item) => {
                    if (item._type === 'group') {
                        return (
                            <CashMovementGroup
                                key={`group-${item.sourceId}`}
                                group={item}
                                customerName={item.sourceType === 'SALE' ? customerNames[item.sourceId] : undefined}
                                supplierName={item.sourceType === 'PURCHASE' ? supplierNames[item.sourceId] : undefined}
                                onViewDetails={handleViewDetails}
                            />
                        )
                    } else {
                        // Single movement - render as table row in a mini table
                        const movement = item
                        return (
                            <div key={movement.id} className="rounded-xl border border-white/20 bg-white/40 backdrop-blur-sm overflow-hidden shadow-sm">
                                <Table>
                                    <TableBody>
                                        <TableRow className="hover:bg-white/60 transition-colors">
                                            <TableCell className="whitespace-nowrap w-[120px]">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">
                                                        {format(new Date(movement.occurredAt), "dd/MM/yyyy", { locale: ptBR })}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {format(new Date(movement.occurredAt), "HH:mm", { locale: ptBR })}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="flex-1">
                                                <span className="text-sm text-slate-700">{movement.description || "-"}</span>
                                            </TableCell>
                                            <TableCell className="w-[100px]">
                                                <Badge variant="outline" className="font-normal capitalize bg-white/50">
                                                    {movement.method.toLowerCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="w-[100px]">
                                                <div className="flex items-center gap-2">
                                                    {SOURCE_ICONS[movement.sourceType] || <Settings className="h-3.5 w-3.5" />}
                                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-tight">
                                                        {SOURCE_LABELS[movement.sourceType] || movement.sourceType}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="w-[120px]">
                                                <span className="text-xs text-slate-600">
                                                    {accountNames[movement.bankAccountId] || 'Carregando...'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right w-[120px]">
                                                <div className="flex flex-col items-end">
                                                    <div className={`flex items-center gap-1 font-bold ${movement.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                        {movement.type === 'IN' ? <ArrowUpCircle className="h-3 w-3" /> : <ArrowDownCircle className="h-3 w-3" />}
                                                        {formatCurrency(movement.amount)}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="w-[100px]">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleViewDetails(movement)}
                                                    className="h-8"
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    Detalhes
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        )
                    }
                })
            )}

            <CashMovementDetailsDialog
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                movement={selectedMovement}
            />
        </div>
    )
}
