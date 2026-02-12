"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ShoppingBag, CreditCard, CheckCircle2, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Sale } from "@/core/domain/sales/types";
import { getSaleRepository } from "@/infrastructure/repositories/factory";
import { cn, formatCurrency } from "@/lib/utils";

interface ClientHistoryTabProps {
    clientId: string;
}

const METHOD_LABELS: Record<string, string> = {
    pix: 'Pix',
    card: 'Cartão',
    cash: 'Dinheiro',
    transfer: 'Transferência',
    credit: 'Crédito',
    fiado: 'Fiado',
    wallet: 'Carteira'
};

const STATUS_LABELS: Record<string, string> = {
    paid: 'Pago',
    pending_payment: 'Pendente',
    draft: 'Rascunho',
    canceled: 'Cancelado',
    refunded: 'Estornado'
};

const STATUS_COLORS: Record<string, string> = {
    paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    pending_payment: 'bg-amber-100 text-amber-700 border-amber-200',
    draft: 'bg-slate-100 text-slate-700 border-slate-200',
    canceled: 'bg-rose-100 text-rose-700 border-rose-200',
    refunded: 'bg-purple-100 text-purple-700 border-purple-200'
};

export function ClientHistoryTab({ clientId }: ClientHistoryTabProps) {
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSales = async () => {
        setLoading(true);
        try {
            const saleRepo = getSaleRepository();
            const data = await saleRepo.findByCustomerId(clientId);
            setSales(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (clientId) {
            fetchSales();
        }
    }, [clientId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <Card className="border-none bg-white/60 backdrop-blur-xl shadow-xl shadow-purple-500/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="border-b border-white/20 pb-4">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-xl font-bold font-heading">Histórico de Compras e Serviços</CardTitle>
                        <CardDescription>Visualizar todas as vendas e serviços realizados para este cliente.</CardDescription>
                    </div>
                    <Badge variant="secondary" className="rounded-full px-4">{sales.length} registros</Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {sales.length === 0 ? (
                    <div className="text-center py-16 px-4">
                        <div className="bg-slate-100/50 h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <ShoppingBag className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800">Nenhum histórico encontrado</h3>
                        <p className="text-sm text-muted-foreground mt-1 max-w-[250px] mx-auto text-balance">
                            Vendas e serviços finalizados aparecerão aqui.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/20">
                        {sales.map((sale) => (
                            <div key={sale.id} className="p-6 hover:bg-white/40 transition-colors group">
                                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                    <div className="flex items-start gap-4">
                                        <div className={cn(
                                            "flex flex-col items-center justify-center min-w-[60px] h-[60px] rounded-xl border shadow-sm",
                                            sale.status === 'paid' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-slate-50 border-slate-100 text-slate-500"
                                        )}>
                                            <span className="text-[10px] uppercase font-bold">
                                                {format(new Date(sale.createdAt), 'dd/MM', { locale: ptBR })}
                                            </span>
                                            <span className="text-xs font-medium text-muted-foreground">
                                                {format(new Date(sale.createdAt), 'HH:mm')}
                                            </span>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="font-bold text-slate-800 font-heading text-lg">
                                                    {formatCurrency(sale.total)}
                                                </h4>
                                                <Badge variant="outline" className={cn("capitalize", STATUS_COLORS[sale.status] || "bg-gray-100")}>
                                                    {STATUS_LABELS[sale.status] || sale.status}
                                                </Badge>
                                            </div>

                                            <div className="text-sm text-slate-600 line-clamp-2">
                                                {sale.items?.map(i => i.name).join(", ") || "Sem itens"}
                                            </div>

                                            <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
                                                <CreditCard className="h-3.5 w-3.5" />
                                                <div className="flex gap-1">
                                                    {sale.payments?.map((p, idx) => (
                                                        <span key={idx} className="capitalize font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                                                            {METHOD_LABELS[p.method] || p.method}
                                                        </span>
                                                    )) || <span>Não informado</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action placeholder or details arrow */}
                                    <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowRight className="h-5 w-5 text-slate-300" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
