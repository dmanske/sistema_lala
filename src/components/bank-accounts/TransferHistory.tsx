'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { getTransferHistory } from '@/app/(app)/bank-accounts/dashboard/actions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusConfig = {
  SCHEDULED: { label: 'Agendada', variant: 'outline' as const },
  EXECUTED: { label: 'Executada', variant: 'default' as const },
  CANCELLED: { label: 'Cancelada', variant: 'destructive' as const },
};

export function TransferHistory() {
  const { data: transfers, isLoading } = useQuery({
    queryKey: ['transfer-history'],
    queryFn: getTransferHistory,
  });

  if (isLoading) {
    return <div>Carregando histórico...</div>;
  }

  if (!transfers || transfers.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Transferências</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transfers.map((transfer: any) => {
            const statusInfo = statusConfig[transfer.status as keyof typeof statusConfig];
            
            return (
              <div
                key={transfer.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="text-sm">
                      <p className="font-medium">{transfer.from_account?.name}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div className="text-sm">
                      <p className="font-medium">{transfer.to_account?.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 ml-auto">
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(transfer.amount)}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(transfer.scheduled_date), 'dd/MM/yyyy', { locale: ptBR })}
                        {transfer.executed_date && (
                          <>
                            <Clock className="h-3 w-3 ml-2" />
                            {format(new Date(transfer.executed_date), 'dd/MM/yyyy', { locale: ptBR })}
                          </>
                        )}
                      </div>
                    </div>
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  </div>
                </div>

                {transfer.description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {transfer.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
