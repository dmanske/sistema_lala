'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProjection, getRecurringExpenses } from '@/app/(app)/cash/projection/actions';
import { ScenarioSelector } from './ScenarioSelector';
import { ProjectionChart } from './ProjectionChart';
import { ProjectionTable } from './ProjectionTable';
import { RecurringExpensesDialog } from './RecurringExpensesDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, TrendingDown, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { ProjectionScenario } from '@/core/domain/entities/CashFlowProjection';

export function ProjectionContent() {
  const [scenario, setScenario] = useState<ProjectionScenario>('REALISTIC');
  const [days, setDays] = useState(30);
  const [showRecurringDialog, setShowRecurringDialog] = useState(false);

  const { data: projection, isLoading, error } = useQuery({
    queryKey: ['cash-projection', scenario, days],
    queryFn: () => getProjection(scenario, days),
  });

  const { data: recurringExpenses } = useQuery({
    queryKey: ['recurring-expenses'],
    queryFn: getRecurringExpenses,
  });

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar projeção</AlertTitle>
        <AlertDescription>
          Não foi possível carregar a projeção de fluxo de caixa. Tente novamente.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading || !projection) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  const negativeBalanceDays = projection.dailyProjection.filter(
    (d) => d.closingBalance < 0
  );

  const lowBalanceDays = projection.dailyProjection.filter(
    (d) => d.closingBalance > 0 && d.closingBalance < d.minimumRequired
  );

  return (
    <div className="space-y-6">
      {/* Alertas */}
      {negativeBalanceDays.length > 0 && (
        <Alert variant="destructive">
          <TrendingDown className="h-4 w-4" />
          <AlertTitle>Atenção: Saldo Negativo Projetado</AlertTitle>
          <AlertDescription>
            Foram identificados {negativeBalanceDays.length} dia(s) com saldo negativo projetado.
            Considere ajustar suas despesas ou buscar fontes de receita adicionais.
          </AlertDescription>
        </Alert>
      )}

      {lowBalanceDays.length > 0 && negativeBalanceDays.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Saldo Baixo Projetado</AlertTitle>
          <AlertDescription>
            Foram identificados {lowBalanceDays.length} dia(s) com saldo abaixo do mínimo
            recomendado (R$ {projection.dailyProjection[0]?.minimumRequired.toLocaleString('pt-BR')}).
          </AlertDescription>
        </Alert>
      )}

      {/* Controles */}
      <div className="flex items-center justify-between gap-4">
        <ScenarioSelector value={scenario} onChange={setScenario} />
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDays(7)}
            className={days === 7 ? 'bg-primary text-primary-foreground' : ''}
          >
            7 dias
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDays(30)}
            className={days === 30 ? 'bg-primary text-primary-foreground' : ''}
          >
            30 dias
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDays(90)}
            className={days === 90 ? 'bg-primary text-primary-foreground' : ''}
          >
            90 dias
          </Button>
        </div>

        <Button onClick={() => setShowRecurringDialog(true)}>
          Gerenciar Despesas Recorrentes
        </Button>
      </div>

      {/* Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Inicial</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {projection.dailyProjection[0]?.openingBalance.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Final Projetado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R${' '}
              {projection.dailyProjection[
                projection.dailyProjection.length - 1
              ]?.closingBalance.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {projection.dailyProjection[projection.dailyProjection.length - 1]?.closingBalance >
              projection.dailyProjection[0]?.openingBalance ? (
                <span className="text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Crescimento projetado
                </span>
              ) : (
                <span className="text-red-600 flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" />
                  Redução projetada
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Entradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R${' '}
              {projection.expectedInflows
                .reduce((sum, i) => sum + i.amount, 0)
                .toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {projection.expectedInflows.length} entrada(s) esperada(s)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico e Tabela */}
      <Tabs defaultValue="chart" className="space-y-4">
        <TabsList>
          <TabsTrigger value="chart">Gráfico</TabsTrigger>
          <TabsTrigger value="table">Tabela Detalhada</TabsTrigger>
        </TabsList>

        <TabsContent value="chart" className="space-y-4">
          <ProjectionChart projection={projection} />
        </TabsContent>

        <TabsContent value="table" className="space-y-4">
          <ProjectionTable projection={projection} />
        </TabsContent>
      </Tabs>

      {/* Dialog de Despesas Recorrentes */}
      <RecurringExpensesDialog
        open={showRecurringDialog}
        onOpenChange={setShowRecurringDialog}
        expenses={recurringExpenses || []}
      />
    </div>
  );
}
