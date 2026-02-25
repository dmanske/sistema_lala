'use server';

import {
  createCostCenter,
  updateCostCenter,
  deleteCostCenter,
  listCostCenters,
  getCostCenterTree,
} from '@/core/usecases/cost-centers/ManageCostCenters';
import { createClient } from '@/lib/supabase/server';

export async function getCostCenters() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Não autenticado');

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile?.tenant_id) throw new Error('Tenant não encontrado');

  return listCostCenters(profile.tenant_id);
}

export async function getCostCentersTree() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Não autenticado');

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile?.tenant_id) throw new Error('Tenant não encontrado');

  return getCostCenterTree(profile.tenant_id);
}

export async function createCostCenterAction(data: any) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Não autenticado');

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile?.tenant_id) throw new Error('Tenant não encontrado');

  return createCostCenter({
    tenantId: profile.tenant_id,
    ...data,
  });
}

export async function updateCostCenterAction(id: string, data: any) {
  return updateCostCenter(id, data);
}

export async function deleteCostCenterAction(id: string) {
  return deleteCostCenter(id);
}
