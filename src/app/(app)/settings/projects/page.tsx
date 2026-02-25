import { Suspense } from 'react';
import { ProjectsContent } from '@/components/projects/ProjectsContent';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProjectsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Projetos</h2>
            <p className="text-muted-foreground mt-1">
              Acompanhe investimentos e iniciativas temporárias
            </p>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-900 mb-2">💡 O que são Projetos?</h3>
          <p className="text-sm text-purple-800 mb-2">
            São investimentos pontuais com começo, meio e fim. Têm orçamento definido e você quer acompanhar quanto gastou vs quanto planejou.
          </p>
          <p className="text-sm text-purple-800 font-medium mb-1">Exemplos para salão:</p>
          <ul className="text-sm text-purple-800 list-disc list-inside space-y-1">
            <li><strong>Reforma Recepção:</strong> Orçamento R$ 15.000 - acompanhe os gastos</li>
            <li><strong>Campanha Dia das Mães:</strong> Investimento em marketing com data de início e fim</li>
            <li><strong>Expansão Sala de Manicure:</strong> Obra, equipamentos, produtos iniciais</li>
            <li><strong>Treinamento Equipe:</strong> Curso de colorimetria avançada</li>
          </ul>
          <p className="text-sm text-purple-800 mt-2 italic">
            💰 Diferença: Centro de Custos = despesas mensais | Projetos = investimentos pontuais
          </p>
        </div>
      </div>

      <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
        <ProjectsContent />
      </Suspense>
    </div>
  );
}
