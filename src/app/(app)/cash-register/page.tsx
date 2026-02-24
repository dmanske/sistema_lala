"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, History, Plus } from "lucide-react"
import { CashRegisterCard } from "@/components/cash/CashRegisterCard"
import { CashRegisterHistory } from "@/components/cash/CashRegisterHistory"
import { CashRegisterDialog } from "@/components/cash/CashRegisterDialog"
import { useCashRegister } from "@/hooks/useCashRegister"

export default function CashRegisterPage() {
    const [openDialog, setOpenDialog] = useState(false)
    const { currentCashRegister, history, isLoading, refresh } = useCashRegister()

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestão de Caixa</h1>
                    <p className="text-muted-foreground">
                        Controle de abertura, fechamento e movimentações do caixa
                    </p>
                </div>
                {!currentCashRegister && (
                    <Button onClick={() => setOpenDialog(true)} size="lg">
                        <Plus className="mr-2 h-4 w-4" />
                        Abrir Caixa
                    </Button>
                )}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="current" className="space-y-4">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="current" className="flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        Caixa Atual
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Histórico
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="current" className="space-y-4">
                    {isLoading ? (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <CashRegisterCard 
                            summary={currentCashRegister} 
                            onUpdate={refresh}
                        />
                    )}

                    {!currentCashRegister && !isLoading && (
                        <Card className="border-dashed">
                            <CardHeader>
                                <CardTitle>Nenhum caixa aberto</CardTitle>
                                <CardDescription>
                                    Abra um caixa para começar a registrar movimentações e vendas
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button onClick={() => setOpenDialog(true)} className="w-full">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Abrir Novo Caixa
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Histórico de Fechamentos</CardTitle>
                            <CardDescription>
                                Visualize todos os fechamentos de caixa anteriores
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : (
                                <CashRegisterHistory cashRegisters={history} />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Dialogs */}
            <CashRegisterDialog
                isOpen={openDialog}
                onOpenChange={setOpenDialog}
                onSuccess={refresh}
            />
        </div>
    )
}
