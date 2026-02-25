'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download } from 'lucide-react';
import { generateDRE } from '@/app/(app)/reports/financial/actions';

export function DREReport() {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().split('T')[0];
  });
  
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const { data: dre, isLoading } = useQuery({
    queryKey: ['dre', startDate, endDate],
    queryFn: () => generateDRE(startDate, endDate),
  });

  if (isLoading) {
    return <div>Carregando DRE...</div>;
  }

  if (!dre) {
    return <div>Erro ao carregar DRE</div>;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data Inicial</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Data Final</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DRE */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Demonstração do Resultado do Exercício (DRE)</CardTitle>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* RECEITAS */}
            <div>
              <h3 className="font-semibold text-lg mb-2">RECEITAS</h3>
              <div className="space-y-1 pl-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Serviços</span>
                  <span>{formatCurrency(dre.revenue.services)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Produtos</span>
                  <span>{formatCurrency(dre.revenue.products)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-1">
                  <span>Total</span>
                  <span>{formatCurrency(dre.revenue.total)}</span>
                </div>
              </div>
            </div>

            {/* CUSTOS */}
            <div>
              <h3 className="font-semibold text-lg mb-2">(-) CUSTOS</h3>
              <div className="space-y-1 pl-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CMV Produtos</span>
                  <span className="text-red-600">{formatCurrency(dre.costs.products)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Custo Serviços</span>
                  <span className="text-red-600">{formatCurrency(dre.costs.services)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-1">
                  <span>Total</span>
                  <span className="text-red-600">{formatCurrency(dre.costs.total)}</span>
                </div>
              </div>
            </div>

            {/* LUCRO BRUTO */}
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">(=) LUCRO BRUTO</h3>
                  <p className="text-sm text-muted-foreground">
                    Margem Bruta: {formatPercent(dre.grossMargin)}
                  </p>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(dre.grossProfit)}
                </span>
              </div>
            </div>

            {/* DESPESAS OPERACIONAIS */}
            <div>
              <h3 className="font-semibold text-lg mb-2">(-) DESPESAS OPERACIONAIS</h3>
              <div className="space-y-1 pl-4">
                {Object.entries(dre.operatingExpenses.byCategory).map(([category, amount]) => (
                  <div key={category} className="flex justify-between">
                    <span className="text-muted-foreground">{category}</span>
                    <span className="text-red-600">{formatCurrency(amount as number)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-semibold border-t pt-1">
                  <span>Total</span>
                  <span className="text-red-600">{formatCurrency(dre.operatingExpenses.total)}</span>
                </div>
              </div>
            </div>

            {/* LUCRO OPERACIONAL */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">(=) LUCRO OPERACIONAL</h3>
                  <p className="text-sm text-muted-foreground">
                    Margem Operacional: {formatPercent(dre.operatingMargin)}
                  </p>
                </div>
                <span className="text-2xl font-bold text-blue-600">
                  {formatCurrency(dre.operatingProfit)}
                </span>
              </div>
            </div>

            {/* LUCRO LÍQUIDO */}
            <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-xl">(=) LUCRO LÍQUIDO</h3>
                  <p className="text-sm text-muted-foreground">
                    Margem Líquida: {formatPercent(dre.netMargin)}
                  </p>
                </div>
                <span className="text-3xl font-bold text-purple-600">
                  {formatCurrency(dre.netProfit)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
