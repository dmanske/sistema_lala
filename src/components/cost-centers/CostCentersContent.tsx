'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Layers } from 'lucide-react';
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
    return (
      <div className="space-y-2 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-12 rounded-xl bg-slate-100" style={{ marginLeft: `${(i % 2) * 24}px` }} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
          {costCenters?.length ?? 0} {costCenters?.length === 1 ? 'centro' : 'centros'} cadastrados
        </p>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="rounded-xl h-9 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-shadow"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Centro
        </Button>
      </div>

      {costCenters && costCenters.length > 0 ? (
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <CostCenterTree
            costCenters={costCenters as any}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-card rounded-2xl border border-border shadow-sm">
          <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Layers className="h-7 w-7 text-slate-300" />
          </div>
          <h3 className="text-base font-semibold text-slate-600 mb-1">Nenhum centro cadastrado</h3>
          <p className="text-sm text-slate-400 mb-5 max-w-xs">
            Crie categorias para organizar suas despesas recorrentes
          </p>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="rounded-xl h-9 px-5 bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Centro
          </Button>
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
