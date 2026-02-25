import { createClient } from '@/lib/supabase/server';
import type { Project } from '@/core/domain/entities/Project';

export async function createProject(
  data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Project> {
  const supabase = await createClient();

  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      tenant_id: data.tenantId,
      name: data.name,
      code: data.code,
      description: data.description,
      start_date: data.startDate?.toISOString().split('T')[0],
      end_date: data.endDate?.toISOString().split('T')[0],
      budget: data.budget,
      status: data.status,
    })
    .select()
    .single();

  if (error) throw error;

  return mapToProject(project);
}

export async function updateProject(
  id: string,
  data: Partial<Omit<Project, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>
): Promise<Project> {
  const supabase = await createClient();

  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.code !== undefined) updateData.code = data.code;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.startDate !== undefined)
    updateData.start_date = data.startDate?.toISOString().split('T')[0];
  if (data.endDate !== undefined)
    updateData.end_date = data.endDate?.toISOString().split('T')[0];
  if (data.budget !== undefined) updateData.budget = data.budget;
  if (data.status !== undefined) updateData.status = data.status;

  const { data: project, error } = await supabase
    .from('projects')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return mapToProject(project);
}

export async function deleteProject(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from('projects').delete().eq('id', id);

  if (error) throw error;
}

export async function listProjects(tenantId: string): Promise<Project[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data?.map(mapToProject) || [];
}

export async function getProjectById(id: string): Promise<Project | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;

  return mapToProject(data);
}

function mapToProject(data: any): Project {
  return {
    id: data.id,
    tenantId: data.tenant_id,
    name: data.name,
    code: data.code,
    description: data.description,
    startDate: data.start_date ? new Date(data.start_date) : undefined,
    endDate: data.end_date ? new Date(data.end_date) : undefined,
    budget: data.budget ? Number(data.budget) : undefined,
    status: data.status,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}
