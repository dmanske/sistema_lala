'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getBankAccountsDashboard() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile?.tenant_id) throw new Error('Tenant not found');

  // Buscar todas as contas
  const { data: accounts, error: accountsError } = await supabase
    .from('bank_accounts')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .order('name');

  if (accountsError) throw accountsError;

  // Calcular saldo de cada conta
  const accountsWithBalance = await Promise.all(
    (accounts || []).map(async (account) => {
      // Buscar movimentações da conta
      const { data: movements } = await supabase
        .from('cash_movements')
        .select('type, amount')
        .eq('bank_account_id', account.id);

      // Calcular saldo: initial_balance + entradas - saídas
      const movementsBalance = (movements || []).reduce((sum, mov) => {
        return sum + (mov.type === 'IN' ? Number(mov.amount) : -Number(mov.amount));
      }, 0);

      const currentBalance = Number(account.initial_balance || 0) + movementsBalance;

      return {
        ...account,
        currentBalance,
      };
    })
  );

  // Calcular saldo total
  const totalBalance = accountsWithBalance.reduce((sum, acc) => sum + acc.currentBalance, 0);

  return {
    accounts: accountsWithBalance,
    totalBalance,
  };
}

export async function createTransfer(formData: {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  scheduledDate: string;
  description?: string;
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

  // Validar saldo da conta de origem
  const { data: fromAccount } = await supabase
    .from('bank_accounts')
    .select('initial_balance')
    .eq('id', formData.fromAccountId)
    .single();

  if (!fromAccount) {
    throw new Error('Conta de origem não encontrada');
  }

  // Calcular saldo atual da conta de origem
  const { data: movements } = await supabase
    .from('cash_movements')
    .select('type, amount')
    .eq('bank_account_id', formData.fromAccountId);

  const movementsBalance = (movements || []).reduce((sum, mov) => {
    return sum + (mov.type === 'IN' ? Number(mov.amount) : -Number(mov.amount));
  }, 0);

  const currentBalance = Number(fromAccount.initial_balance || 0) + movementsBalance;

  if (currentBalance < formData.amount) {
    throw new Error('Saldo insuficiente');
  }

  // Criar transferência
  const { error } = await supabase
    .from('bank_transfers')
    .insert({
      tenant_id: profile.tenant_id,
      from_account_id: formData.fromAccountId,
      to_account_id: formData.toAccountId,
      amount: formData.amount,
      scheduled_date: formData.scheduledDate,
      description: formData.description || null,
      created_by: user.id,
      status: 'SCHEDULED',
    });

  if (error) throw error;

  // Se for para hoje, executar imediatamente
  const today = new Date().toISOString().split('T')[0];
  if (formData.scheduledDate === today) {
    await executeTransferInternal(supabase, profile.tenant_id, formData);
  }

  revalidatePath('/bank-accounts/dashboard');
}

async function executeTransferInternal(supabase: any, tenantId: string, transfer: any) {
  // Criar movimentação de saída
  await supabase.from('cash_movements').insert({
    tenant_id: tenantId,
    type: 'OUT',
    amount: transfer.amount,
    bank_account_id: transfer.fromAccountId,
    method: 'TRANSFER',
    description: transfer.description || 'Transferência entre contas',
    source_type: 'TRANSFER',
  });

  // Criar movimentação de entrada
  await supabase.from('cash_movements').insert({
    tenant_id: tenantId,
    type: 'IN',
    amount: transfer.amount,
    bank_account_id: transfer.toAccountId,
    method: 'TRANSFER',
    description: transfer.description || 'Transferência entre contas',
    source_type: 'TRANSFER',
  });

  // Atualizar saldos
  await supabase.rpc('update_bank_account_balance', {
    p_account_id: transfer.fromAccountId,
    p_amount: -transfer.amount,
  });

  await supabase.rpc('update_bank_account_balance', {
    p_account_id: transfer.toAccountId,
    p_amount: transfer.amount,
  });
}

export async function getTransferHistory() {
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
    .from('bank_transfers')
    .select(`
      *,
      from_account:bank_accounts!bank_transfers_from_account_id_fkey(name),
      to_account:bank_accounts!bank_transfers_to_account_id_fkey(name)
    `)
    .eq('tenant_id', profile.tenant_id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data || [];
}
