'use client'

import { NewTransactionDialog } from "./NewTransactionDialog"

export function CashHeader() {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Caixa</h1>
                <p className="text-muted-foreground">Gerencie o fluxo de caixa do salão.</p>
            </div>
            <div className="flex items-center gap-2">
                <NewTransactionDialog type="IN" />
                <NewTransactionDialog type="OUT" />
            </div>
        </div>
    )
}
