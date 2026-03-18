"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Wallet, History, Plus, Loader2 } from "lucide-react"
import { CashRegisterCard } from "@/components/cash/CashRegisterCard"
import { CashRegisterHistory } from "@/components/cash/CashRegisterHistory"
import { CashRegisterDialog } from "@/components/cash/CashRegisterDialog"
import { useCashRegister } from "@/hooks/useCashRegister"

export default function CashRegisterPage() {
    const [openDialog, setOpenDialog] = useState(false)
    const { currentCashRegister, history, isLoading, refresh } = useCashRegister()

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            <div className="container mx-auto p-6 space-y-8 max-w-5xl">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200">
                            <Wallet className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-800">Gestão de Caixa</h1>
                            <p className="text-sm text-slate-500">Abertura, fechamento e movimentações</p>
                        </div>
                    </div>
                    {!currentCashRegister && !isLoading && (
                        <Button
                            onClick={() => setOpenDialog(true)}
                            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-200 rounded-xl h-11 px-6"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Abrir Caixa
                        </Button>
                    )}
                </div>

                {/* Tabs */}
                <Tabs defaultValue="current" className="space-y-6">
                    <TabsList className="bg-white border border-slate-200 shadow-sm rounded-xl p-1 h-auto w-fit gap-1">
                        <TabsTrigger
                            value="current"
                            className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
                        >
                            <Wallet className="h-4 w-4" />
                            Caixa Atual
                        </TabsTrigger>
                        <TabsTrigger
                            value="history"
                            className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
                        >
                            <History className="h-4 w-4" />
                            Histórico
                        </TabsTrigger>
                    </TabsList>

                    {/* Caixa Atual */}
                    <TabsContent value="current" className="mt-0">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-24">
                                <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                            </div>
                        ) : currentCashRegister ? (
                            <CashRegisterCard summary={currentCashRegister} onUpdate={refresh} />
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <div className="h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-5">
                                    <Wallet className="h-10 w-10 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-700 mb-1">Nenhum caixa aberto</h3>
                                <p className="text-sm text-slate-400 mb-6 max-w-xs">
                                    Abra um caixa para começar a registrar movimentações e vendas
                                </p>
                                <Button
                                    onClick={() => setOpenDialog(true)}
                                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-xl h-11 px-8 shadow-lg shadow-violet-100"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Abrir Novo Caixa
                                </Button>
                            </div>
                        )}
                    </TabsContent>

                    {/* Histórico */}
                    <TabsContent value="history" className="mt-0">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-24">
                                <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                            </div>
                        ) : (
                            <CashRegisterHistory cashRegisters={history} />
                        )}
                    </TabsContent>
                </Tabs>

                <CashRegisterDialog
                    isOpen={openDialog}
                    onOpenChange={setOpenDialog}
                    onSuccess={refresh}
                />
            </div>
        </div>
    )
}
