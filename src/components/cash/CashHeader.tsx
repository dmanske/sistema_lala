'use client'

import { TrendingUp } from 'lucide-react'
import { NewTransactionDialog } from "./NewTransactionDialog"

export function CashHeader() {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                    <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-800">Fluxo de Caixa</h1>
                    <p className="text-sm text-slate-500">Entradas e saídas do período</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <NewTransactionDialog type="OUT" />
                <NewTransactionDialog type="IN" />
            </div>
        </div>
    )
}
