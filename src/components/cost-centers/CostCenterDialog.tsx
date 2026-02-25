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
import { getCostCenters } from '@/app/(app)/settings/cost-centers/actions';
import type { CostCenter } from '@/core/domain/entities/CostCenter';

interface CostCenterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  costCenter: CostCenter | null;
  onSave: (data: any) => Promise<void>;
}

export function CostCenterDialog({
  open,
  onOpenChange,
  costCenter,
  onSave,
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
        parentId: '',
        description: '',
        isActive: true,
      });
    }
  }, [costCenter, open]);

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

  // Filtrar centros de custos disponíveis para parent (excluir o próprio e seus descendentes)
  const availableParents = allCostCenters?.filter(
    (cc) => cc.id !== costCenter?.id && cc.parentId !== costCenter?.id
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {costCenter ? 'Editar Centro de Custos' : 'Novo Centro de Custos'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Código</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="parentId">Centro de Custos Pai</Label>
              <Select
                value={formData.parentId || 'none'}
                onValueChange={(value) =>
                  setFormData({ ...formData, parentId: value === 'none' ? '' : value })
                }
              >
                <SelectTrigger id="parentId">
                  <SelectValue placeholder="Nenhum (raiz)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum (raiz)</SelectItem>
                  {availableParents?.map((cc) => (
                    <SelectItem key={cc.id} value={cc.id}>
                      {cc.name} {cc.code && `(${cc.code})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2 md:col-span-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <Label htmlFor="isActive">Ativo</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Salvando...' : costCenter ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
