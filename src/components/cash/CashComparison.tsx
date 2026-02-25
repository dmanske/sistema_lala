'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import type { CashMovement } from '@/core/domain/CashMovement';
import { subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

interface CashComparisonProps {
  movements: CashMovement[];
  period: {
    start: Date;
    end: Date;
  };
}

interface PeriodData {
  inflow: number;
  outflow: number;
  net: number;
}

export function CashComparison({ movements, period }: CashComparisonProps) {
  const comparison = useMemo(() => {
    // Período atual
    const currentPeriod: PeriodData = {
      inflow: 0,
      outflow: 0,
      net: 0,
    };

    // Período anterior (mesmo intervalo, mas um mês antes)
    const previousStart = subMonths(period.start, 1);
    const previousEnd = subMonths(period.end, 1);

    const previousPeriod: PeriodData = {
      inflow: 0,
      outflow: 0,
      net: 0,
    };

    movements.forEach((m) => {
      const movementDate = new Date(m.date);

      // Período atual
      if (
        isWithinInterval(movementDate, {
          start: period.start,
          end: period.end,
        })
      ) {
        if (m.type === 'IN') {
          currentPeriod.inflow += m.amount;
        } else {
          currentPeriod.outflow += m.amount;
        }
      }

      // Período anterior
      if (
        isWithinInterval(movementDate, {
          start: previousStart,
          end: previousEnd,
        })
      ) {
        if (m.type === 'IN') {
          previousPeriod.inflow += m.amount;
        } else {
          previousPeriod.outflow += m.amount;
        }
      }
    });

    currentPeriod.net = currentPeriod.inflow - currentPeriod.outflow;
    previousPeriod.net = previousPeriod.inflow - previousPeriod.outflow;

    // Calcular crescimento
    const growth = {
      inflow:
        previousPeriod.inflow > 0
          ? ((currentPeriod.inflow - previousPeriod.inflow) / previousPeriod.inflow) * 100
          : 0,
      outflow:
        previousPeriod.outflow > 0
          ? ((currentPeriod.outflow - previousPeriod.outflow) / previousPeriod.outflow) * 100
          : 0,
      net:
        previousPeriod.net !== 0
          ? ((currentPeriod.net - previousPeriod.net) / Math.abs(previousPeriod.net)) * 100
          : 0,
    };

    return {
      current: currentPeriod,
      previous: previousPeriod,
      growth,
    };
  }, [movements, period]);

  const GrowthIndicator = ({ value }: { value: number }) => {
    if (Math.abs(value) < 0.01) {
      return (
        <span className="inline-flex items-center gap-1 text-gray-600">
          <Minus className="h-4 w-4" />
          Sem alteração
        </span>
      );
    }

    const isPositive = value > 0;
    return (
      <span
        className={`inline-flex items-center gap-1 ${
          isPositive ? 'text-green-600' : 'text-red-600'
        }`}
      >
        {isPositive ? (
          <ArrowUp className="h-4 w-4" />
        ) : (
          <ArrowDown className="h-4 w-4" />
        )}
        {Math.abs(value).toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {/* Entradas */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Entradas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Período Atual</p>
              <p className="text-2xl font-bold text-green-600">
                R${' '}
                {comparison.current.inflow.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Período Anterior</p>
              <p className="text-sm text-muted-foreground">
                R${' '}
                {comparison.previous.inflow.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="pt-2 border-t">
              <GrowthIndicator value={comparison.growth.inflow} />
            </div>
          </CardContent>
        </Card>

        {/* Saídas */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saídas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Período Atual</p>
              <p className="text-2xl font-bold text-red-600">
                R${' '}
                {comparison.current.outflow.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Período Anterior</p>
              <p className="text-sm text-muted-foreground">
                R${' '}
                {comparison.previous.outflow.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="pt-2 border-t">
              <GrowthIndicator value={comparison.growth.outflow} />
            </div>
          </CardContent>
        </Card>

        {/* Saldo Líquido */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saldo Líquido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Período Atual</p>
              <p
                className={`text-2xl font-bold ${
                  comparison.current.net >= 0 ? 'text-blue-600' : 'text-orange-600'
                }`}
              >
                R${' '}
                {comparison.current.net.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Período Anterior</p>
              <p className="text-sm text-muted-foreground">
                R${' '}
                {comparison.previous.net.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="pt-2 border-t">
              <GrowthIndicator value={comparison.growth.net} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
