import { Suspense } from 'react';
import { BankAccountsDashboard } from '@/components/bank-accounts/BankAccountsDashboard';
import { Skeleton } from '@/components/ui/skeleton';

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

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Para que serve?</h3>
          <p className="text-sm text-blue-800 mb-2">
            Gerencie todas as suas contas em um só lugar: veja saldos, faça transferências entre contas e acompanhe a evolução.
          </p>
          <p className="text-sm text-blue-800 font-medium">Funcionalidades:</p>
          <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
            <li>Saldo total consolidado de todas as contas</li>
            <li>Transferências entre contas (imediatas ou agendadas)</li>
            <li>Histórico detalhado por conta</li>
            <li>Gráfico de evolução de saldo</li>
          </ul>
        </div>
      </div>

      <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
        <BankAccountsDashboard />
      </Suspense>
    </div>
  );
}
