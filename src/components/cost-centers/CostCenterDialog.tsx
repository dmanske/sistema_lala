'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Layers, FolderOpen, Loader2 } from 'lucide-react';
import { getCostCenters } from '@/app/(app)/settings/cost-centers/actions';
import type { CostCenter } from '@/core/domain/entities/CostCenter';

interface CostCenterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  costCenter: CostCenter | null;
  onSave: (data: any) => Promise<void>;
  defaultParentId?: string;
}

export function CostCenterDialog({
  open,
  onOpenChange,
  costCenter,
  onSave,
  defaultParentId,
}: CostCenterDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    parentId: '',
    description: '',
    isActive: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  const { data: allCostCenters } = useQuery({
    queryKey: ['cost-centers'],
    queryFn: getCostCenters,
    enabled: open,
  });

  useEffect(() => {
    if (costCenter) {
      setFormData({
        name: costCenter.name,
        code: costCenter.code || '',
        parentId: costCenter.parentId || '',
        description: costCenter.description || '',
        isActive: costCenter.isActive,
      });
    } else {
      setFormData({
        name: '',
        code: '',
        parentId: defaultParentId || '',
        description: '',
        isActive: true,
      });
    }
  }, [costCenter, open, defaultParentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        name: formData.name,
        code: formData.code || undefined,
        parentId: formData.parentId || undefined,
        description: formData.description || undefined,
        isActive: formData.isActive,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const availableParents = allCostCenters?.filter(
    (cc) => cc.id !== costCenter?.id && cc.parentId !== costCenter?.id
  );

  const selectedParent = availableParents?.find(cc => cc.id === formData.parentId);
  const isRoot = !formData.parentId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 gap-0">

        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-blue-50 to-white">
          <DialogTitle className="text-lg font-bold flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-200">
              <Layers className="h-4 w-4 text-white" />
            </div>
            {costCenter ? 'Editar Centro de Custos' : 'Novo Centro de Custos'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-5">

            {/* Tipo: raiz ou subcategoria */}
            {!costCenter && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, parentId: '' })}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 py-3 px-2 text-center transition-all ${
                    isRoot
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-border bg-white text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <Layers className={`h-5 w-5 ${isRoot ? 'text-blue-500' : 'text-slate-300'}`} />
                  <span className="text-xs font-semibold">Centro Principal</span>
                  <span className="text-[10px] text-slate-400 leading-tight">Nível raiz, sem pai</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (availableParents && availableParents.length > 0 && !formData.parentId) {
                      setFormData({ ...formData, parentId: availableParents[0].id });
                    }
                  }}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 py-3 px-2 text-center transition-all ${
                    !isRoot
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-border bg-white text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <FolderOpen className={`h-5 w-5 ${!isRoot ? 'text-indigo-500' : 'text-slate-300'}`} />
                  <span className="text-xs font-semibold">Subcategoria</span>
                  <span className="text-[10px] text-slate-400 leading-tight">Filho de outro centro</span>
                </button>
              </div>
            )}

            {/* Pai (só aparece se subcategoria selecionada) */}
            {!isRoot && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">Pertence a qual centro?</Label>
                <Select
                  value={formData.parentId || 'none'}
                  onValueChange={(value) =>
                    setFormData({ ...formData, parentId: value === 'none' ? '' : value })
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Selecione o centro pai..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableParents?.map((cc) => (
                      <SelectItem key={cc.id} value={cc.id}>
                        {cc.name} {cc.code && `(${cc.code})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedParent && (
                  <p className="text-xs text-indigo-600 bg-indigo-50 rounded-lg px-2 py-1">
                    Este centro ficará dentro de <strong>{selectedParent.name}</strong>
                  </p>
                )}
              </div>
            )}

            {/* Nome e Código */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-medium text-slate-600">Nome <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  placeholder={isRoot ? 'Ex: Operacional' : 'Ex: Produtos'}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="code" className="text-xs font-medium text-slate-600">
                  Código <span className="text-slate-400 font-normal">(Opcional)</span>
                </Label>
                <Input
                  id="code"
                  placeholder="Ex: OP-01"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="rounded-xl font-mono"
                />
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-medium text-slate-600">
                Descrição <span className="text-slate-400 font-normal">(Opcional)</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Descreva o que será agrupado neste centro..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="rounded-xl resize-none"
                rows={2}
              />
            </div>

            {/* Ativo */}
            <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-border">
              <div>
                <p className="text-sm font-medium text-slate-700">Ativo</p>
                <p className="text-xs text-slate-400">Centros inativos não aparecem para seleção</p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 px-6 pb-5 pt-2 border-t">
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="rounded-xl px-5 bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md shadow-blue-200"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {costCenter ? 'Atualizar' : 'Criar Centro'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
