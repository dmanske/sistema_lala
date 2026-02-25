'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getProjects() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile?.tenant_id) throw new Error('Tenant not found');

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .order('name');

  if (error) throw error;
  return data;
}

export async function createProject(formData: {
  name: string;
  code?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  status: string;
}) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile?.tenant_id) throw new Error('Tenant not found');

  const { error } = await supabase
    .from('projects')
    .insert({
      tenant_id: profile.tenant_id,
      name: formData.name,
      code: formData.code || null,
      description: formData.description || null,
      start_date: formData.startDate || null,
      end_date: formData.endDate || null,
      budget: formData.budget || null,
      status: formData.status,
    });

  if (error) throw error;
  
  revalidatePath('/settings/projects');
}

export async function updateProject(id: string, formData: {
  name: string;
  code?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  status: string;
}) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('projects')
    .update({
      name: formData.name,
      code: formData.code || null,
      description: formData.description || null,
      start_date: formData.startDate || null,
      end_date: formData.endDate || null,
      budget: formData.budget || null,
      status: formData.status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;
  
  revalidatePath('/settings/projects');
}

export async function deleteProject(id: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) throw error;
  
  revalidatePath('/settings/projects');
}
