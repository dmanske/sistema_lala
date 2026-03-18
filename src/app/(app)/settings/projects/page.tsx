import { Suspense } from 'react';
import { ProjectsContent } from '@/components/projects/ProjectsContent';
import { Skeleton } from '@/components/ui/skeleton';
import { FolderKanban, Lightbulb } from 'lucide-react';

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
