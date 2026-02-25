'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getProfitabilityByService,
  getProfitabilityByProfessional,
} from '@/app/(app)/reports/financial/actions';

interface ProfitabilityAnalysisProps {
  startDate: string;
  endDate: string;
}

export function ProfitabilityAnalysis({ startDate, endDate }: ProfitabilityAnalysisProps) {
  const { data: byService, isLoading: loadingService } = useQuery({
    queryKey: ['profitability-service', startDate, endDate],
    queryFn: () => getProfitabilityByService(startDate, endDate),
  });

  const { data: byProfessional, isLoading: loadingProfessional } = useQuery({
    queryKey: ['profitability-professional', startDate, endDate],
    queryFn: () => getProfitabilityByProfessional(startDate, endDate),
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loadingService || loadingProfessional) {
    return <div>Carregando análise de lucratividade...</div>;
  }

  return (
    <Tabs defaultValue="service" className="space-y-4">
      <TabsList>
        <TabsTrigger value="service">Por Serviço</TabsTrigger>
        <TabsTrigger value="professional">Por Profissional</TabsTrigger>
      </TabsList>

      <TabsContent value="service" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Lucratividade por Serviço</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {byService && byService.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Serviço</th>
                        <th className="text-right py-2">Qtd</th>
                        <th className="text-right py-2">Receita</th>
                        <th className="text-right py-2">Custo</th>
                        <th className="text-right py-2">Lucro</th>
                        <th className="text-right py-2">Margem</th>
                        <th className="text-right py-2">Ticket Médio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {byService.map((item: any) => (
                        <tr key={item.service_id} className="border-b">
                          <td className="py-2">{item.service_name}</td>
                          <td className="text-right">{item.quantity}</td>
                          <td className="text-right">{formatCurrency(item.revenue)}</td>
                          <td className="text-right text-red-600">{formatCurrency(item.cost)}</td>
                          <td className="text-right text-green-600">{formatCurrency(item.profit)}</td>
                          <td className="text-right">{formatPercent(item.margin)}</td>
                          <td className="text-right">{formatCurrency(item.avg_ticket)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum dado de serviço encontrado para o período selecionado.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="professional" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Lucratividade por Profissional</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {byProfessional && byProfessional.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Profissional</th>
                        <th className="text-right py-2">Atendimentos</th>
                        <th className="text-right py-2">Receita</th>
                        <th className="text-right py-2">Ticket Médio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {byProfessional.map((item: any) => (
                        <tr key={item.professionalId} className="border-b">
                          <td className="py-2">{item.professionalName}</td>
                          <td className="text-right">{item.servicesCount}</td>
                          <td className="text-right text-green-600">{formatCurrency(item.revenue)}</td>
                          <td className="text-right">{formatCurrency(item.avgTicket)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum dado de profissional encontrado para o período selecionado.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
