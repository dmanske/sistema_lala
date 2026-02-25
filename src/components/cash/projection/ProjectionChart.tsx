'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { CashFlowProjection } from '@/core/domain/entities/CashFlowProjection';

interface ProjectionChartProps {
  projection: CashFlowProjection;
}

export function ProjectionChart({ projection }: ProjectionChartProps) {
  const chartData = projection.dailyProjection.map((day) => ({
    date: format(day.date, 'dd/MM', { locale: ptBR }),
    fullDate: format(day.date, 'dd/MM/yyyy', { locale: ptBR }),
    saldo: day.closingBalance,
    entradas: day.inflows,
    saidas: day.outflows,
    minimo: day.minimumRequired,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução do Saldo Projetado</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorMinimo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              tickFormatter={(value) =>
                `R$ ${value.toLocaleString('pt-BR', {
                  notation: 'compact',
                  compactDisplay: 'short',
                })}`
              }
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="bg-background border rounded-lg p-3 shadow-lg">
                    <p className="font-semibold mb-2">{payload[0].payload.fullDate}</p>
                    <div className="space-y-1 text-sm">
                      <p className="text-blue-600">
                        Saldo: R${' '}
                        {payload[0].value?.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-green-600">
                        Entradas: R${' '}
                        {payload[0].payload.entradas.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-red-600">
                        Saídas: R${' '}
                        {payload[0].payload.saidas.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>
                );
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="saldo"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorSaldo)"
              name="Saldo Projetado"
            />
            <Area
              type="monotone"
              dataKey="minimo"
              stroke="#ef4444"
              strokeDasharray="5 5"
              fillOpacity={1}
              fill="url(#colorMinimo)"
              name="Saldo Mínimo"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
