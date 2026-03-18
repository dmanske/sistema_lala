import { Suspense } from 'react';
import { ProjectsContent } from '@/components/projects/ProjectsContent';
import { Skeleton } from '@/components/ui/skeleton';
import { FolderKanban, Lightbulb, MousePointerClick, Plus, PencilLine, TrendingUp, CircleDot } from 'lucide-react';

export default function ProjectsPage() {
  return (
    <div className="space-y-6 pb-10">

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-200">
          <FolderKanban className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Projetos</h1>
          <p className="text-sm text-slate-500">Acompanhe investimentos e iniciativas temporárias</p>
        </div>
      </div>

      {/* Info card */}
      <div className="rounded-2xl border border-purple-100 bg-purple-50/60 p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-7 w-7 rounded-lg bg-purple-100 flex items-center justify-center">
            <Lightbulb className="h-3.5 w-3.5 text-purple-600" />
          </div>
          <p className="text-sm font-semibold text-purple-800">O que são Projetos?</p>
        </div>
        <p className="text-sm text-purple-700 mb-3">
          São investimentos <strong>pontuais</strong> com começo, meio e fim — com orçamento definido para acompanhar quanto gastou vs quanto planejou.
        </p>
        <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-2">Exemplos para salão</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-3">
          {[
            { name: 'Reforma Recepção', desc: 'Orçamento R$ 15.000 — acompanhe os gastos' },
            { name: 'Campanha Dia das Mães', desc: 'Investimento em marketing com data fim' },
            { name: 'Expansão Manicure', desc: 'Obra, equipamentos, produtos iniciais' },
            { name: 'Treinamento Equipe', desc: 'Curso de colorimetria avançada' },
          ].map(item => (
            <div key={item.name} className="flex items-start gap-2 bg-white/70 rounded-xl px-3 py-2 border border-purple-100">
              <div className="h-1.5 w-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
              <p className="text-xs text-purple-800">
                <span className="font-semibold">{item.name}:</span> {item.desc}
              </p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-white/60 rounded-xl px-3 py-2 border border-purple-100">
          <div className="h-1.5 w-1.5 rounded-full bg-purple-300 shrink-0" />
          <p className="text-xs text-purple-700 italic">
            <span className="font-semibold">Diferença:</span> Centro de Custos = despesas mensais &nbsp;|&nbsp; Projetos = investimentos pontuais
          </p>
        </div>
      </div>

      {/* Como funciona */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center">
            <MousePointerClick className="h-3.5 w-3.5 text-slate-600" />
          </div>
          <p className="text-sm font-semibold text-slate-700">Como funciona</p>
        </div>

        {/* Ciclo de vida visual */}
        <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Ciclo de vida de um projeto</p>
          <div className="flex items-center gap-1 flex-wrap">
            {[
              { label: 'Ativo', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400' },
              { label: '→', color: 'text-slate-300', dot: null },
              { label: 'Em Espera', color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-400' },
              { label: '→', color: 'text-slate-300', dot: null },
              { label: 'Concluído', color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-400' },
            ].map((item, i) => (
              item.dot
                ? <span key={i} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border ${item.color}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${item.dot}`} />
                    {item.label}
                  </span>
                : <span key={i} className={`text-sm font-bold ${item.color}`}>{item.label}</span>
            ))}
            <span className="text-slate-300 mx-1 font-bold">|</span>
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border bg-red-50 text-red-600 border-red-200">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
              Cancelado
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Você pode mudar o status a qualquer momento editando o projeto.</p>
        </div>

        {/* Passos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-start gap-3 bg-purple-50/60 rounded-xl p-3 border border-purple-100">
            <div className="h-6 w-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
            <div>
              <p className="text-xs font-semibold text-purple-800 flex items-center gap-1">
                <Plus className="h-3 w-3" /> Criar o projeto
              </p>
              <p className="text-xs text-purple-700 mt-0.5">Clique em <strong>Novo Projeto</strong> e preencha nome, datas de início/fim e o orçamento previsto.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-violet-50/60 rounded-xl p-3 border border-violet-100">
            <div className="h-6 w-6 rounded-full bg-violet-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
            <div>
              <p className="text-xs font-semibold text-violet-800 flex items-center gap-1">
                <CircleDot className="h-3 w-3" /> Vincular despesas
              </p>
              <p className="text-xs text-violet-700 mt-0.5">Ao cadastrar uma despesa, selecione o projeto no campo <strong>"Projeto"</strong>. O valor será somado ao gasto do projeto.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-indigo-50/60 rounded-xl p-3 border border-indigo-100">
            <div className="h-6 w-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
            <div>
              <p className="text-xs font-semibold text-indigo-800 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Acompanhar o orçamento
              </p>
              <p className="text-xs text-indigo-700 mt-0.5">Nos relatórios financeiros você verá quanto foi gasto vs orçado em cada projeto.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-3 border border-slate-200">
            <div className="h-6 w-6 rounded-full bg-slate-400 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</div>
            <div>
              <p className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <PencilLine className="h-3 w-3" /> Encerrar ou pausar
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Quando terminar, edite o projeto e mude o status para <strong>Concluído</strong>. Se precisar pausar, use <strong>Em Espera</strong>.</p>
            </div>
          </div>
        </div>
      </div>

      <Suspense fallback={
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      }>
        <ProjectsContent />
      </Suspense>
    </div>
  );
}
