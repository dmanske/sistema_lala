'use client'

import { NewTransactionDialog } from "./NewTransactionDialog"

export function CashHeader() {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Fluxo de Caixa</h1>
                <p className="text-sm text-muted-foreground">Gerencie as entradas e saídas do período.</p>
            </div>
            <div className="flex items-center gap-2">
                <NewTransactionDialog type="OUT" />
                <NewTransactionDialog type="IN" />
            </div>
        </div>
    )
}
