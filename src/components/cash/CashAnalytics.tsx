'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { CashMovement } from '@/core/domain/CashMovement';
import { CashDistributionCharts } from './CashDistributionCharts';
import { CashComparison } from './CashComparison';

interface CashAnalyticsProps {
  movements: CashMovement[];
  period: {
    start: Date;
    end: Date;
  };
}

export function CashAnalytics({ movements, period }: CashAnalyticsProps) {
  const analytics = useMemo(() => {
    // Distribuição por Método
    const byMethod = movements.reduce((acc, m) => {
      const method = m.method || 'OUTROS';
      if (!acc[method]) {
        acc[method] = { inflow: 0, outflow: 0, net: 0 };
      }
      if (m.type === 'IN') {
        acc[method].inflow += m.amount;
      } else {
        acc[method].outflow += m.amount;
      }
      acc[method].net = acc[method].inflow - acc[method].outflow;
      return acc;
    }, {} as Record<string, { inflow: number; outflow: number; net: number }>);

    // Distribuição por Categoria (usando source como categoria)
    const byCategory = movements
      .filter((m) => m.type === 'OUT')
      .reduce((acc, m) => {
        const category = m.sourceType || 'Outros';
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += m.amount;
        return acc;
      }, {} as Record<string, number>);

    const totalExpenses = Object.values(byCategory).reduce((sum, val) => sum + val, 0);

    const byCategoryArray = Object.entries(byCategory).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
    }));

    return {
      byMethod: Object.entries(byMethod).map(([method, data]) => ({
        method,
        ...data,
      })),
      byCategory: byCategoryArray,
    };
  }, [movements]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análises e Estatísticas</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="distribution" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="distribution">Distribuição</TabsTrigger>
            <TabsTrigger value="comparison">Comparativo</TabsTrigger>
          </TabsList>

          <TabsContent value="distribution" className="space-y-4">
            <CashDistributionCharts
              byMethod={analytics.byMethod}
              byCategory={analytics.byCategory}
              movements={movements}
            />
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4">
            <CashComparison movements={movements} period={period} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
