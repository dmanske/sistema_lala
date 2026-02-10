"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment } from "@/core/domain/Appointment";
import { AppointmentService } from "@/core/services/AppointmentService";
import { LocalStorageAppointmentRepository } from "@/infrastructure/repositories/LocalStorageAppointmentRepository";
import { cn } from "@/lib/utils";

interface ClientProductsTabProps {
    clientId: string;
}

interface ProductUsage {
    id: string; // unique key (apptId + prodId)
    date: string;
    productName: string;
    quantity: number;
    appointmentId: string;
}

export function ClientProductsTab({ clientId }: ClientProductsTabProps) {
    const [usageList, setUsageList] = useState<ProductUsage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const appRepo = new LocalStorageAppointmentRepository();
                const appService = new AppointmentService(appRepo);
                const appointments = await appService.getAll({ clientId });

                const usages: ProductUsage[] = [];

                appointments
                    .filter(a => a.status === 'DONE' && a.usedProducts && a.usedProducts.length > 0)
                    .forEach(apt => {
                        apt.usedProducts?.forEach(p => {
                            usages.push({
                                id: `${apt.id}-${p.productId}`,
                                date: apt.date,
                                productName: p.name,
                                quantity: p.quantity,
                                appointmentId: apt.id
                            });
                        });
                    });

                // Sort by date desc
                usages.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setUsageList(usages);

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
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
                    <CardTitle className="text-xl font-bold font-heading flex items-center gap-2">
                        <Package className="h-5 w-5 text-purple-500" />
                        Produtos Utilizados
                    </CardTitle>
                    <Badge variant="secondary" className="rounded-full px-4">{usageList.length} registros</Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {usageList.length === 0 ? (
                    <div className="text-center py-16 px-4">
                        <div className="bg-slate-100/50 h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Package className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800">Nenhum produto utilizado</h3>
                        <p className="text-sm text-muted-foreground mt-1 text-balance">
                            Este cliente não possui registros de produtos consumidos em atendimentos.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/20">
                        {usageList.map((item) => (
                            <div key={item.id} className="p-4 hover:bg-white/40 transition-colors flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                                        {item.quantity}x
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-800">{item.productName}</h4>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(item.date + 'T00:00:00'), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                                        </div>
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
