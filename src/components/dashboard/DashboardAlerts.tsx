'use client'

import { AlertCircle, AlertTriangle, CheckCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState } from 'react'

export interface Alert {
    id: string
    type: 'error' | 'warning' | 'success' | 'info'
    title: string
    message: string
    dismissible?: boolean
}

interface DashboardAlertsProps {
    alerts: Alert[]
    onDismiss?: (id: string) => void
}

export function DashboardAlerts({ alerts, onDismiss }: DashboardAlertsProps) {
    const [dismissed, setDismissed] = useState<Set<string>>(new Set())

    const handleDismiss = (id: string) => {
        setDismissed(prev => new Set([...prev, id]))
        onDismiss?.(id)
    }

    const visibleAlerts = alerts.filter(alert => !dismissed.has(alert.id))

    if (visibleAlerts.length === 0) return null

    return (
        <div className="grid gap-2 md:grid-cols-2">
            {visibleAlerts.map((alert) => {
                const config = {
                    error: {
                        icon: AlertCircle,
                        bg: 'bg-red-50 border-red-200',
                        iconColor: 'text-red-600',
                        textColor: 'text-red-900',
                        badge: '🔴'
                    },
                    warning: {
                        icon: AlertTriangle,
                        bg: 'bg-amber-50 border-amber-200',
                        iconColor: 'text-amber-600',
                        textColor: 'text-amber-900',
                        badge: '⚠️'
                    },
                    success: {
                        icon: CheckCircle,
                        bg: 'bg-emerald-50 border-emerald-200',
                        iconColor: 'text-emerald-600',
                        textColor: 'text-emerald-900',
                        badge: '✅'
                    },
                    info: {
                        icon: AlertCircle,
                        bg: 'bg-blue-50 border-blue-200',
                        iconColor: 'text-blue-600',
                        textColor: 'text-blue-900',
                        badge: 'ℹ️'
                    }
                }[alert.type]

                const Icon = config.icon

                return (
                    <div
                        key={alert.id}
                        className={cn(
                            'flex items-start gap-2 p-3 rounded-lg border',
                            config.bg
                        )}
                    >
                        <div className="shrink-0 mt-0.5">
                            <Icon className={cn('h-4 w-4', config.iconColor)} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={cn('font-semibold text-xs', config.textColor)}>
                                {alert.title}
                            </p>
                            <p className={cn('text-xs mt-0.5', config.textColor, 'opacity-90')}>
                                {alert.message}
                            </p>
                        </div>
                        {alert.dismissible && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDismiss(alert.id)}
                                className="h-5 w-5 shrink-0"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
