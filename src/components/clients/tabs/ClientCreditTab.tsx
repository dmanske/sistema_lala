"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { CreditCard, ArrowDownLeft, ArrowUpRight, Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RegisterCreditDialog } from "@/components/clients/RegisterCreditDialog";

import { CreditMovement } from "@/core/domain/Credit";
import { CreditService } from "@/core/services/CreditService";
import { getCreditRepository, getClientRepository } from "@/infrastructure/repositories/factory";
import { formatDate, formatDateTime } from "@/core/formatters/date";

interface ClientCreditTabProps {
    clientId: string;
    creditBalance: number;
}


const ORIGIN_LABELS: Record<string, string> = {
    WALLET: 'Carteira / Fiado',
    CASH: 'Dinheiro',
    PIX: 'Pix',
    CARD: 'Cartão',
    TRANSFER: 'Transferência',
    CREDIT: 'Crédito',
};

// Helper function to safely get label
const getOriginLabel = (origin: string) => ORIGIN_LABELS[origin] || origin;


export function ClientCreditTab({ clientId, creditBalance }: ClientCreditTabProps) {
    const [movements, setMovements] = useState<CreditMovement[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            const creditRepo = getCreditRepository();
            const clientRepo = getClientRepository();
            const service = new CreditService(creditRepo, clientRepo);
            const data = await service.getHistory(clientId);
            setMovements(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [clientId]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-inner">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Saldo Disponível
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/20 rounded-full text-primary">
                                <CreditCard className="h-8 w-8" />
                            </div>
                            <div>
                                <span className={`text-4xl font-bold ${creditBalance < 0 ? 'text-red-500' : 'bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-800'}`}>
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(creditBalance)}
                                </span>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Saldo atualizado em tempo real
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex flex-col justify-center items-start p-6 bg-card/40 backdrop-blur-sm">
                    <h3 className="text-lg font-semibold mb-2">Ações Rápidas</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Adicione crédito manualmente para o cliente utilizar em serviços futurs.
                    </p>
                    <RegisterCreditDialog clientId={clientId} onSuccess={fetchHistory} />
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Movimentações</CardTitle>
                    <CardDescription>
                        Extrato completo de créditos e débitos deste cliente.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : movements.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Nenhuma movimentação registrada até o momento.
                        </div>
                    ) : (
                        <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
                            <Table className="min-w-[600px] sm:min-w-full">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Data/Hora</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Origem</TableHead>
                                        <TableHead>Valor</TableHead>
                                        <TableHead>Obs</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {movements.map((movement) => (
                                        <TableRow key={movement.id} className="hover:bg-white/40 transition-colors">
                                            <TableCell className="font-medium">
                                                {formatDateTime(movement.createdAt)}
                                            </TableCell>
                                            <TableCell>
                                                {movement.type === 'CREDIT' ? (
                                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 gap-1 pl-1">
                                                        <ArrowDownLeft className="h-3 w-3" /> Entrada
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="gap-1 pl-1">
                                                        <ArrowUpRight className="h-3 w-3" /> Saída
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm">{getOriginLabel(movement.origin)}</TableCell>
                                            <TableCell className={movement.type === 'CREDIT' ? 'text-green-600 font-bold' : ''}>
                                                {movement.type === 'CREDIT' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(movement.amount)}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                                                {movement.note || '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
