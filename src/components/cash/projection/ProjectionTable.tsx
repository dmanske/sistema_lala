'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingDown, TrendingUp } from 'lucide-react';
import type { CashFlowProjection } from '@/core/domain/entities/CashFlowProjection';

interface ProjectionTableProps {
  projection: CashFlowProjection;
}

export function ProjectionTable({ projection }: ProjectionTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Projeção Detalhada</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Saldo Inicial</TableHead>
                <TableHead className="text-right">Entradas</TableHead>
                <TableHead className="text-right">Saídas</TableHead>
                <TableHead className="text-right">Saldo Final</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projection.dailyProjection.map((day, index) => {
                const isNegative = day.closingBalance < 0;
                const isLow =
                  day.closingBalance > 0 && day.closingBalance < day.minimumRequired;

                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {format(day.date, 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-right">
                      R${' '}
                      {day.openingBalance.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {day.inflows > 0 && '+'}R${' '}
                      {day.inflows.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      {day.outflows > 0 && '-'}R${' '}
                      {day.outflows.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold ${
                        isNegative
                          ? 'text-red-600'
                          : isLow
                          ? 'text-yellow-600'
                          : 'text-green-600'
                      }`}
                    >
                      R${' '}
                      {day.closingBalance.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-center">
                      {isNegative ? (
                        <span className="inline-flex items-center gap-1 text-red-600 text-xs">
                          <TrendingDown className="h-3 w-3" />
                          Negativo
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 text-yellow-600 text-xs">
                          <TrendingDown className="h-3 w-3" />
                          Baixo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-green-600 text-xs">
                          <TrendingUp className="h-3 w-3" />
                          Saudável
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
