"use client";

import { PurchaseForm } from "@/components/purchases/PurchaseForm";

export default function NewPurchasePage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-heading">Nova Entrada de Estoque</h1>
                <p className="text-muted-foreground">Registe uma nova compra de produtos.</p>
            </div>
            <div className="bg-card/50 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-lg shadow-purple-500/5">
                <PurchaseForm />
            </div>
        </div>
    )
}
