'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CostCenterDialog } from './CostCenterDialog';
import { CostCenterTree } from './CostCenterTree';
import { getCostCenters, deleteCostCenterAction, createCostCenterAction, updateCostCenterAction } from '@/app/(app)/settings/cost-centers/actions';
import { toast } from 'sonner';

export function CostCentersContent() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCostCenter, setEditingCostCenter] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: costCenters, isLoading } = useQuery({
    queryKey: ['cost-centers'],
    queryFn: getCostCenters,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCostCenterAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-centers'] });
      toast.success('Centro de custos excluído com sucesso');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao excluir centro de custos');
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingCostCenter) {
        return updateCostCenterAction(editingCostCenter.id, data);
      }
      return createCostCenterAction(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-centers'] });
      toast.success(editingCostCenter ? 'Centro de custos atualizado com sucesso' : 'Centro de custos criado com sucesso');
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao salvar centro de custos');
    },
  });

  const handleEdit = (costCenter: any) => {
    setEditingCostCenter(costCenter);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este centro de custos?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCostCenter(null);
  };

  const handleSave = async (data: any) => {
    await saveMutation.mutateAsync(data);
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Centro de Custos
        </Button>
      </div>

      {costCenters && costCenters.length > 0 ? (
        <CostCenterTree
          costCenters={costCenters as any}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          Nenhum centro de custos cadastrado
        </div>
      )}

      <CostCenterDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        costCenter={editingCostCenter}
        onSave={handleSave}
      />
    </div>
  );
}
