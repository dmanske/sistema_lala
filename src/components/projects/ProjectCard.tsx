'use client';

import { Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProjectCardProps {
  project: any;
  onEdit: (project: any) => void;
  onDelete: (id: string) => void;
}

const statusConfig = {
  ACTIVE: { label: 'Ativo', variant: 'default' as const },
  COMPLETED: { label: 'Concluído', variant: 'secondary' as const },
  ON_HOLD: { label: 'Em Espera', variant: 'outline' as const },
  CANCELLED: { label: 'Cancelado', variant: 'destructive' as const },
};

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const statusInfo = statusConfig[project.status as keyof typeof statusConfig] || statusConfig.ACTIVE;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">
            {project.name}
          </CardTitle>
          {project.code && (
            <p className="text-sm text-muted-foreground">{project.code}</p>
          )}
        </div>
        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {project.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description}
            </p>
          )}

          {(project.start_date || project.end_date) && (
            <div className="text-sm space-y-1">
              {project.start_date && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Início:</span>
                  <span>{format(new Date(project.start_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                </div>
              )}
              {project.end_date && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Término:</span>
                  <span>{format(new Date(project.end_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                </div>
              )}
            </div>
          )}

          {project.budget && (
            <div className="flex justify-between text-sm pt-2 border-t">
              <span className="text-muted-foreground">Orçamento:</span>
              <span className="font-semibold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(project.budget)}
              </span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onEdit(project)}
            >
              <Edit className="h-3 w-3 mr-1" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-destructive hover:text-destructive"
              onClick={() => onDelete(project.id)}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Excluir
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
