'use client';

import { Edit, Trash2, Calendar, Wallet, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProjectCardProps {
  project: any;
  onEdit: (project: any) => void;
  onDelete: (id: string) => void;
}

const statusConfig = {
  ACTIVE:    { label: 'Ativo',      dot: 'bg-emerald-400', text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100', bar: 'border-t-emerald-400' },
  COMPLETED: { label: 'Concluído', dot: 'bg-blue-400',    text: 'text-blue-700',    bg: 'bg-blue-50 border-blue-100',       bar: 'border-t-blue-400'    },
  ON_HOLD:   { label: 'Em Espera', dot: 'bg-amber-400',   text: 'text-amber-700',   bg: 'bg-amber-50 border-amber-100',     bar: 'border-t-amber-400'   },
  CANCELLED: { label: 'Cancelado', dot: 'bg-red-400',     text: 'text-red-700',     bg: 'bg-red-50 border-red-100',         bar: 'border-t-red-400'     },
};

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const status = statusConfig[project.status as keyof typeof statusConfig] ?? statusConfig.ACTIVE;

  return (
    <div className={`bg-card rounded-2xl border border-border shadow-sm overflow-hidden border-t-2 ${status.bar} flex flex-col`}>

      {/* Top */}
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-800 text-base leading-tight truncate">{project.name}</h3>
            {project.code && (
              <p className="text-xs font-mono text-slate-400 mt-0.5">{project.code}</p>
            )}
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border shrink-0 ${status.bg} ${status.text}`}>
            <Circle className={`h-1.5 w-1.5 fill-current`} />
            {status.label}
          </span>
        </div>

        {project.description && (
          <p className="text-sm text-slate-500 line-clamp-2 mb-3">{project.description}</p>
        )}

        {/* Datas */}
        {(project.start_date || project.end_date) && (
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="h-3.5 w-3.5 text-slate-300 shrink-0" />
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              {project.start_date && (
                <span>{format(new Date(project.start_date), 'dd/MM/yy', { locale: ptBR })}</span>
              )}
              {project.start_date && project.end_date && (
                <span className="text-slate-300">→</span>
              )}
              {project.end_date && (
                <span>{format(new Date(project.end_date), 'dd/MM/yy', { locale: ptBR })}</span>
              )}
            </div>
          </div>
        )}

        {/* Orçamento */}
        {project.budget && (
          <div className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
            <div className="flex items-center gap-1.5">
              <Wallet className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs text-slate-500 font-medium">Orçamento</span>
            </div>
            <span className="text-sm font-bold text-slate-700">{brl(project.budget)}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 pb-4 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 rounded-xl h-8 text-xs gap-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
          onClick={() => onEdit(project)}
        >
          <Edit className="h-3 w-3" />
          Editar
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 rounded-xl h-8 text-xs gap-1 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
          onClick={() => onDelete(project.id)}
        >
          <Trash2 className="h-3 w-3" />
          Excluir
        </Button>
      </div>
    </div>
  );
}
