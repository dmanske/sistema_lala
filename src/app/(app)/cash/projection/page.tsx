import { Suspense } from 'react';
import { ProjectionContent } from '@/components/cash/projection/ProjectionContent';

export default function CashProjectionPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projeção de Fluxo de Caixa</h1>
          <p className="text-muted-foreground mt-1">
            Visualize projeções futuras baseadas em recebíveis, contas a pagar e despesas recorrentes
          </p>
        </div>
      </div>

      <Suspense fallback={<div>Carregando...</div>}>
        <ProjectionContent />
      </Suspense>
    </div>
  );
}
