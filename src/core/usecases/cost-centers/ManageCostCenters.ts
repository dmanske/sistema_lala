import { createClient } from '@/lib/supabase/server';
import type { CostCenter, CostCenterWithChildren } from '@/core/domain/entities/CostCenter';

export async function createCostCenter(
  data: Omit<CostCenter, 'id' | 'createdAt' | 'updatedAt'>
): Promise<CostCenter> {
  const supabase = await createClient();

  // Verificar se não cria ciclo na hierarquia
  if (data.parentId) {
    const hasCircle = await checkForCircularReference(supabase, data.parentId, data.tenantId);
    if (hasCircle) {
      throw new Error('Não é possível criar um ciclo na hierarquia de centros de custos');
    }
  }

  const { data: costCenter, error } = await supabase
    .from('cost_centers')
    .insert({
      tenant_id: data.tenantId,
      name: data.name,
      code: data.code,
      parent_id: data.parentId,
      description: data.description,
      is_active: data.isActive,
    })
    .select()
    .single();

  if (error) throw error;

  return mapToCostCenter(costCenter);
}

export async function updateCostCenter(
  id: string,
  data: Partial<Omit<CostCenter, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>
): Promise<CostCenter> {
  const supabase = await createClient();

  // Se está mudando o parent, verificar ciclos
  if (data.parentId !== undefined) {
    const { data: current } = await supabase
      .from('cost_centers')
      .select('tenant_id')
      .eq('id', id)
      .single();

    if (current && data.parentId) {
      const hasCircle = await checkForCircularReference(
        supabase,
        data.parentId,
        current.tenant_id,
        id
      );
      if (hasCircle) {
        throw new Error('Não é possível criar um ciclo na hierarquia de centros de custos');
      }
    }
  }

  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.code !== undefined) updateData.code = data.code;
  if (data.parentId !== undefined) updateData.parent_id = data.parentId;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.isActive !== undefined) updateData.is_active = data.isActive;

  const { data: costCenter, error } = await supabase
    .from('cost_centers')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return mapToCostCenter(costCenter);
}

export async function deleteCostCenter(id: string): Promise<void> {
  const supabase = await createClient();

  // Verificar se tem filhos
  const { data: children } = await supabase
    .from('cost_centers')
    .select('id')
    .eq('parent_id', id)
    .limit(1);

  if (children && children.length > 0) {
    throw new Error('Não é possível excluir um centro de custos que possui sub-centros');
  }

  const { error } = await supabase.from('cost_centers').delete().eq('id', id);

  if (error) throw error;
}

export async function listCostCenters(tenantId: string): Promise<CostCenter[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('cost_centers')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('name');

  if (error) throw error;

  return data?.map(mapToCostCenter) || [];
}

export async function getCostCenterTree(tenantId: string): Promise<CostCenterWithChildren[]> {
  const costCenters = await listCostCenters(tenantId);

  const buildTree = (
    parentId: string | undefined,
    level: number = 0
  ): CostCenterWithChildren[] => {
    return costCenters
      .filter((cc) => cc.parentId === parentId)
      .map((cc) => ({
        ...cc,
        level,
        children: buildTree(cc.id, level + 1),
      }));
  };

  return buildTree(undefined);
}

async function checkForCircularReference(
  supabase: any,
  parentId: string,
  tenantId: string,
  excludeId?: string
): Promise<boolean> {
  const visited = new Set<string>();
  let currentId: string | null = parentId;

  while (currentId) {
    if (currentId === excludeId) return true;
    if (visited.has(currentId)) return true;

    visited.add(currentId);

    const { data: result }: { data: any } = await supabase
      .from('cost_centers')
      .select('parent_id')
      .eq('id', currentId)
      .eq('tenant_id', tenantId)
      .single();

    currentId = result?.parent_id || null;
  }

  return false;
}

function mapToCostCenter(data: any): CostCenter {
  return {
    id: data.id,
    tenantId: data.tenant_id,
    name: data.name,
    code: data.code,
    parentId: data.parent_id,
    description: data.description,
    isActive: data.is_active,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}
