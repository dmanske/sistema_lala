'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FolderKanban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProjectDialog } from './ProjectDialog';
import { ProjectCard } from './ProjectCard';
import { getProjects, deleteProject } from '@/app/(app)/settings/projects/actions';
import { toast } from 'sonner';

export function ProjectsContent() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Projeto excluído com sucesso');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao excluir projeto');
    },
  });

  const handleEdit = (project: any) => {
    setEditingProject(project);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este projeto?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProject(null);
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-52 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
          {projects?.length ?? 0} {projects?.length === 1 ? 'projeto' : 'projetos'} cadastrados
        </p>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="rounded-xl h-9 px-4 bg-gradient-to-r from-purple-500 to-violet-600 shadow-lg shadow-purple-200 hover:shadow-purple-300 transition-shadow"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Projeto
        </Button>
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-card rounded-2xl border border-border shadow-sm">
          <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <FolderKanban className="h-7 w-7 text-slate-300" />
          </div>
          <h3 className="text-base font-semibold text-slate-600 mb-1">Nenhum projeto cadastrado</h3>
          <p className="text-sm text-slate-400 mb-5 max-w-xs">
            Crie projetos para acompanhar investimentos pontuais com orçamento definido
          </p>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="rounded-xl h-9 px-5 bg-gradient-to-r from-purple-500 to-violet-600 shadow-lg shadow-purple-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Projeto
          </Button>
        </div>
      )}

      <ProjectDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        project={editingProject}
      />
    </div>
  );
}
