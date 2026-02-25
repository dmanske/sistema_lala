import { Suspense } from 'react';
import { CostCentersContent } from '@/components/cost-centers/CostCentersContent';

export default function CostCentersPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Centros de Custos</h1>
            <p className="text-muted-foreground mt-1">
              Organize suas despesas por departamentos, áreas ou categorias
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 O que são Centros de Custos?</h3>
          <p className="text-sm text-blue-800 mb-2">
            São categorias para organizar suas despesas recorrentes (que acontecem todo mês).
          </p>
          <p className="text-sm text-blue-800 font-medium mb-1">Exemplos para salão:</p>
          <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
            <li><strong>Operacional:</strong> Produtos de beleza, materiais de consumo</li>
            <li><strong>Infraestrutura:</strong> Aluguel, energia, água, internet</li>
            <li><strong>Marketing:</strong> Redes sociais, panfletos, anúncios</li>
            <li><strong>Pessoal:</strong> Salários, comissões, benefícios</li>
          </ul>
        </div>
      </div>

      <Suspense fallback={<div>Carregando...</div>}>
        <CostCentersContent />
      </Suspense>
    </div>
  );
}
