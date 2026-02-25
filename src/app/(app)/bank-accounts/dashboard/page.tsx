'use client';

import { Suspense, useState } from 'react';
import { BankAccountsDashboard } from '@/components/bank-accounts/BankAccountsDashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

function HelpBanner() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-100 text-blue-600 shrink-0">
            <Info className="h-5 w-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="font-semibold text-blue-900">Para que serve?</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-7 text-blue-700 hover:text-blue-900 hover:bg-blue-100"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Ocultar
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Ver mais
                  </>
                )}
              </Button>
            </div>
            
            <p className="text-sm text-blue-800">
              Gerencie todas as suas contas em um só lugar: veja saldos, faça transferências entre contas e acompanhe a evolução.
            </p>
            
            {isExpanded && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-sm text-blue-800 font-medium mb-2">Funcionalidades:</p>
                <ul className="text-sm text-blue-800 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>Saldo total consolidado de todas as contas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>Transferências entre contas (imediatas ou agendadas)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>Histórico detalhado por conta</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>Gráfico de evolução de saldo</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function BankAccountsDashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard de Contas</h2>
            <p className="text-muted-foreground mt-1">
              Visão consolidada de todas as suas contas bancárias
            </p>
          </div>
        </div>

        {/* Help Banner - Redesigned */}
        <HelpBanner />
      </div>

      <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
        <BankAccountsDashboard />
      </Suspense>
    </div>
  );
}
