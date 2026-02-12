'use client'

import { useState } from 'react'
import { AccountStatement } from '@/core/domain/BankAccount'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ArrowDownCircle, ArrowUpCircle, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface AccountStatementViewProps {
    statement: AccountStatement
    onFilterChange: (startDate?: Date, endDate?: Date) => void
}

export function AccountStatementView({ statement, onFilterChange }: AccountStatementViewProps) {
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value)
    }

    const formatDate = (date: Date) => {
        return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    }

    const handleFilter = () => {
        const start = startDate ? new Date(startDate) : undefined
        const end = endDate ? new Date(endDate) : undefined
        onFilterChange(start, end)
    }

    const handleClearFilter = () => {
        setStartDate('')
        setEndDate('')
        onFilterChange()
    }

    return (
        <div className="space-y-6">
            {/* Account Details */}
            <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>{statement.account.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Saldo Inicial</p>
                            <p className="text-lg font-semibold">
                                {formatCurrency(statement.summary.initialBalance)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Entradas</p>
                            <p className="text-lg font-semibold text-green-600">
                                {formatCurrency(statement.summary.totalIn)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Saídas</p>
                            <p className="text-lg font-semibold text-red-600">
                                {formatCurrency(statement.summary.totalOut)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Saldo Atual</p>
                            <p className="text-lg font-semibold">
                                {formatCurrency(statement.summary.currentBalance)}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Date Filter */}
            <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Filtrar por Período
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <Label htmlFor="startDate">Data Inicial</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="flex-1">
                            <Label htmlFor="endDate">Data Final</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <div className="flex items-end gap-2">
                            <Button onClick={handleFilter}>Aplicar</Button>
                            <Button variant="outline" onClick={handleClearFilter}>Limpar</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Movements Table */}
            <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Movimentações</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="px-4 py-2 text-left text-sm font-medium">Data/Hora</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium">Descrição</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium">Tipo</th>
                                    <th className="px-4 py-2 text-right text-sm font-medium">Valor</th>
                                    <th className="px-4 py-2 text-right text-sm font-medium">Saldo Após</th>
                                </tr>
                            </thead>
                            <tbody>
                                {statement.movements.map((movement) => (
                                    <tr key={movement.id} className="border-b last:border-0">
                                        <td className="px-4 py-3 text-sm">
                                            {formatDate(movement.occurredAt)}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {movement.description || '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={movement.type === 'IN' ? 'default' : 'destructive'}>
                                                {movement.type === 'IN' ? (
                                                    <><ArrowUpCircle className="h-3 w-3 mr-1" /> Entrada</>
                                                ) : (
                                                    <><ArrowDownCircle className="h-3 w-3 mr-1" /> Saída</>
                                                )}
                                            </Badge>
                                        </td>
                                        <td className={`px-4 py-3 text-right font-mono ${
                                            movement.type === 'IN' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {movement.type === 'IN' ? '+' : '-'}{formatCurrency(movement.amount)}
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono font-semibold">
                                            {formatCurrency(movement.balanceAfter)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
