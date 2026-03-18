'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Layers, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { CostCenterDialog } from './CostCenterDialog';
import { CostCenterTree } from './CostCenterTree';
import { getCostCenters, deleteCostCenterAction, createCostCenterAction, updateCostCenterAction } from '@/app/(app)/settings/cost-centers/actions';
import { toast } from 'sonner';

export function CostCentersContent() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCostCenter, setEditingCostCenter] = useState<any>(null);
  const [defaultParentId, setDefaultParentId] = useState<string | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);
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

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = () => {
    if (deletingId) {
      deleteMutation.mutate(deletingId, {
        onSettled: () => setDeletingId(null),
      });
    }
  };

  const handleAddChild = (parentId: string) => {
    setEditingCostCenter(null);
    setDefaultParentId(parentId);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCostCenter(null);
    setDefaultParentId(undefined);
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
          onClick={() => { setDefaultParentId(undefined); setEditingCostCenter(null); setIsDialogOpen(true); }}
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
            onAddChild={handleAddChild}
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
            onClick={() => { setDefaultParentId(undefined); setEditingCostCenter(null); setIsDialogOpen(true); }}
            className="rounded-xl h-9 px-5 bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Centro
          </Button>
        </div>
      )}

      <AlertDialog open={!!deletingId} onOpenChange={(open) => { if (!open) setDeletingId(null); }}>
        <AlertDialogContent className="max-w-md p-0 gap-0 overflow-hidden">
          <div className="flex items-center gap-4 px-6 pt-6 pb-4">
            <div className="h-11 w-11 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <AlertDialogHeader className="p-0 space-y-0.5">
              <AlertDialogTitle className="text-base font-bold text-slate-800">
                Excluir centro de custos?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-slate-500">
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>

          <div className="mx-6 mb-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">
                Se este centro tiver subcategorias, elas também serão excluídas. Despesas vinculadas perderão a associação.
              </p>
            </div>
          </div>

          <AlertDialogFooter className="px-6 pb-5 flex gap-2">
            <AlertDialogCancel
              disabled={deleteMutation.isPending}
              className="flex-1 rounded-xl"
            >
              Cancelar
            </AlertDialogCancel>
            <Button
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200"
            >
              {deleteMutation.isPending
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <><Trash2 className="h-4 w-4 mr-2" />Excluir</>
              }
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CostCenterDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        costCenter={editingCostCenter}
        onSave={handleSave}
        defaultParentId={defaultParentId}
      />
    </div>
  );
}
