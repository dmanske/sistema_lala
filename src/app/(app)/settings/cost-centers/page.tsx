import { Suspense } from 'react';
import { CostCentersContent } from '@/components/cost-centers/CostCentersContent';
import { Layers, Lightbulb } from 'lucide-react';

export default function CostCentersPage() {
  return (
    <div className="space-y-6 pb-10">

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200">
          <Layers className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Centros de Custos</h1>
          <p className="text-sm text-slate-500">Organize suas despesas por departamentos, áreas ou categorias</p>
        </div>
      </div>

      {/* Info card */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-7 w-7 rounded-lg bg-blue-100 flex items-center justify-center">
            <Lightbulb className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <p className="text-sm font-semibold text-blue-800">O que são Centros de Custos?</p>
        </div>
        <p className="text-sm text-blue-700 mb-3">
          São categorias para organizar suas despesas <strong>recorrentes</strong> — aquelas que acontecem todo mês.
        </p>
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Exemplos para salão</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {[
            { name: 'Operacional', desc: 'Produtos de beleza, materiais de consumo' },
            { name: 'Infraestrutura', desc: 'Aluguel, energia, água, internet' },
            { name: 'Marketing', desc: 'Redes sociais, panfletos, anúncios' },
            { name: 'Pessoal', desc: 'Salários, comissões, benefícios' },
          ].map(item => (
            <div key={item.name} className="flex items-start gap-2 bg-white/70 rounded-xl px-3 py-2 border border-blue-100">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
              <p className="text-xs text-blue-800">
                <span className="font-semibold">{item.name}:</span> {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <Suspense fallback={
        <div className="space-y-2 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 rounded-xl bg-slate-100" />
          ))}
        </div>
      }>
        <CostCentersContent />
      </Suspense>
    </div>
  );
}
