'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { CashMovement } from '@/core/domain/CashMovement';

interface CashDistributionChartsProps {
  byMethod: Array<{
    method: string;
    inflow: number;
    outflow: number;
    net: number;
  }>;
  byCategory: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  movements: CashMovement[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const METHOD_LABELS: Record<string, string> = {
  CASH: 'Dinheiro',
  PIX: 'Pix',
  CARD: 'Cartão',
  TRANSFER: 'Transferência',
  WALLET: 'Carteira',
};

const CATEGORY_LABELS: Record<string, string> = {
  SALE: 'Venda',
  PURCHASE: 'Compra',
  REFUND: 'Estorno',
  MANUAL: 'Manual',
};

export function CashDistributionCharts({
  byMethod,
  byCategory,
  movements,
}: CashDistributionChartsProps) {
  // Top 10 maiores movimentações
  const topMovements = [...movements]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10)
    .map((m) => ({
      description: m.description.substring(0, 30) + (m.description.length > 30 ? '...' : ''),
      amount: m.amount,
      type: m.type,
    }));

  // Preparar dados para gráfico de pizza de métodos
  const methodPieData = byMethod.map((item) => ({
    name: METHOD_LABELS[item.method] || item.method,
    value: Math.abs(item.net),
  }));

  // Preparar dados para gráfico de pizza de categorias
  const categoryPieData = byCategory.map((item) => ({
    name: CATEGORY_LABELS[item.category] || item.category,
    value: item.amount,
  }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Distribuição por Método de Pagamento */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Distribuição por Método</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={methodPieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {methodPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) =>
                  `R$ ${value.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}`
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Distribuição de Despesas por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Despesas por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryPieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) =>
                  `R$ ${value.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}`
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top 10 Maiores Movimentações */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Top 10 Maiores Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topMovements} layout="vertical">
              <XAxis
                type="number"
                tickFormatter={(value) =>
                  `R$ ${value.toLocaleString('pt-BR', {
                    notation: 'compact',
                    compactDisplay: 'short',
                  })}`
                }
              />
              <YAxis
                type="category"
                dataKey="description"
                width={150}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: number) =>
                  `R$ ${value.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}`
                }
              />
              <Bar dataKey="amount" fill="#3b82f6">
                {topMovements.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.type === 'IN' ? '#10b981' : '#ef4444'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
