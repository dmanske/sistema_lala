import { Suspense } from 'react';
import { CostCentersContent } from '@/components/cost-centers/CostCentersContent';
import { Layers, Lightbulb, MousePointerClick, FolderOpen, Plus, ChevronRight } from 'lucide-react';

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

      {/* Como funciona */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center">
            <MousePointerClick className="h-3.5 w-3.5 text-slate-600" />
          </div>
          <p className="text-sm font-semibold text-slate-700">Como funciona a hierarquia</p>
        </div>

        {/* Exemplo visual */}
        <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Exemplo de estrutura</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-blue-100 flex items-center justify-center shrink-0">
                <FolderOpen className="h-3 w-3 text-blue-600" />
              </div>
              <span className="text-sm font-bold text-slate-700">Operacional</span>
              <span className="text-xs text-slate-400">← Centro principal (raiz)</span>
            </div>
            <div className="ml-8 border-l border-slate-200 pl-4 space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-md bg-indigo-50 flex items-center justify-center shrink-0">
                  <ChevronRight className="h-3 w-3 text-indigo-400" />
                </div>
                <span className="text-sm text-slate-600">Produtos de Cabelo</span>
                <span className="text-xs text-slate-400">← Subcategoria</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-md bg-indigo-50 flex items-center justify-center shrink-0">
                  <ChevronRight className="h-3 w-3 text-indigo-400" />
                </div>
                <span className="text-sm text-slate-600">Materiais de Consumo</span>
                <span className="text-xs text-slate-400">← Subcategoria</span>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <div className="h-6 w-6 rounded-md bg-blue-100 flex items-center justify-center shrink-0">
                <FolderOpen className="h-3 w-3 text-blue-600" />
              </div>
              <span className="text-sm font-bold text-slate-700">Infraestrutura</span>
              <span className="text-xs text-slate-400">← Outro centro principal</span>
            </div>
          </div>
        </div>

        {/* Passos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-start gap-3 bg-blue-50/60 rounded-xl p-3 border border-blue-100">
            <div className="h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
            <div>
              <p className="text-xs font-semibold text-blue-800">Criar um Centro Principal</p>
              <p className="text-xs text-blue-700 mt-0.5">Clique em <strong>Novo Centro</strong> e selecione <strong>"Centro Principal"</strong>. Ele ficará no topo da hierarquia.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-indigo-50/60 rounded-xl p-3 border border-indigo-100">
            <div className="h-6 w-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
            <div>
              <p className="text-xs font-semibold text-indigo-800">Criar uma Subcategoria</p>
              <p className="text-xs text-indigo-700 mt-0.5">Passe o mouse sobre um centro e clique no <strong>ícone <Plus className="h-3 w-3 inline" /></strong> que aparecer. O pai já vem preenchido.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-3 border border-slate-200 sm:col-span-2">
            <div className="h-6 w-6 rounded-full bg-slate-400 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
            <div>
              <p className="text-xs font-semibold text-slate-700">Usar nas despesas</p>
              <p className="text-xs text-slate-500 mt-0.5">Ao cadastrar uma despesa, selecione o centro de custos no campo correspondente. Os relatórios vão agrupar os valores automaticamente por centro.</p>
            </div>
          </div>
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
