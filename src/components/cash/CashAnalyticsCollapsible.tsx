'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, BarChart3 } from 'lucide-react'
import { PaymentMethodSummary } from './PaymentMethodSummary'
import { AccountSummary } from './AccountSummary'
import { CashAnalytics } from './CashAnalytics'
import { CashComparison } from './CashComparison'
import { CashDistributionCharts } from './CashDistributionCharts'
import type { CashMovement } from '@/core/domain/CashMovement'

interface CashAnalyticsCollapsibleProps {
    movements: CashMovement[]
    period: {
        start: Date
        end: Date
    }
    accountNames: Record<string, string>
}

export function CashAnalyticsCollapsible({ 
    movements, 
    period,
    accountNames 
}: CashAnalyticsCollapsibleProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <div className="border rounded-lg bg-card">
            <Button
                variant="ghost"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full h-14 flex items-center justify-between px-4 hover:bg-muted/50"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                        <p className="font-semibold">Análises Detalhadas</p>
                        <p className="text-xs text-muted-foreground">
                            Gráficos, comparações e distribuições
                        </p>
                    </div>
                </div>
                {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
            </Button>

            {isExpanded && (
                <div className="p-6 pt-2 space-y-6 border-t animate-in slide-in-from-top-2">
                    {/* Comparação com Período Anterior */}
                    <div>
                        <h3 className="text-sm font-semibold mb-4">Comparação com Período Anterior</h3>
                        <CashComparison movements={movements} period={period} />
                    </div>

                    {/* Resumos por Método e Conta */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-semibold mb-4">Por Método de Pagamento</h3>
                            <PaymentMethodSummary movements={movements} />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold mb-4">Por Conta Bancária</h3>
                            <AccountSummary movements={movements} accountNames={accountNames} />
                        </div>
                    </div>

                    {/* Analytics Completo */}
                    <div>
                        <h3 className="text-sm font-semibold mb-4">Análise Detalhada</h3>
                        <CashAnalytics movements={movements} period={period} />
                    </div>
                </div>
            )}
        </div>
    )
}
