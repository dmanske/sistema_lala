'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Projeto
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects?.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {projects?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Nenhum projeto cadastrado
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
