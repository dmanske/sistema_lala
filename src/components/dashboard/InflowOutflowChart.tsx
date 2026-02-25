"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface InflowOutflowData {
  period: string;
  inflow: number;
  outflow: number;
  net: number;
}

interface InflowOutflowChartProps {
  data?: InflowOutflowData[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
        <p className="text-sm font-semibold text-slate-900 mb-2">{label}</p>
        <div className="space-y-1">
          <p className="text-sm text-emerald-600">
            Entradas: <span className="font-bold">{formatCurrency(payload[0].value)}</span>
          </p>
          <p className="text-sm text-rose-600">
            Saídas: <span className="font-bold">{formatCurrency(payload[1].value)}</span>
          </p>
          <p className="text-sm text-slate-700 pt-1 border-t">
            Líquido: <span className="font-bold">{formatCurrency(payload[0].value - payload[1].value)}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function InflowOutflowChart({ data }: InflowOutflowChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <BarChart3 className="h-4 w-4 text-emerald-600" />
            </div>
            Entradas vs Saídas
          </CardTitle>
          <CardDescription>Comparativo de entradas e saídas por período</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>Carregando dados do gráfico...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <BarChart3 className="h-4 w-4 text-emerald-600" />
          </div>
          Entradas vs Saídas
        </CardTitle>
        <CardDescription>Comparativo de entradas e saídas por período</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="period" 
              stroke="#64748b"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#64748b"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              formatter={(value) => {
                if (value === 'inflow') return 'Entradas';
                if (value === 'outflow') return 'Saídas';
                return value;
              }}
            />
            <Bar 
              dataKey="inflow" 
              fill="#10b981" 
              radius={[8, 8, 0, 0]}
              name="inflow"
            />
            <Bar 
              dataKey="outflow" 
              fill="#ef4444" 
              radius={[8, 8, 0, 0]}
              name="outflow"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
