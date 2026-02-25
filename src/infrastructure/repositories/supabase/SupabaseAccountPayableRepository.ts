import { createClient } from '@/lib/supabase/client';
import {
  IAccountPayableRepository,
  AccountPayableFilters,
} from '@/core/repositories/AccountPayableRepository';
import {
  AccountPayable,
  AccountPayableWithDetails,
  CreateAccountPayableInput,
  AccountPayableSummary,
} from '@/core/domain/entities/AccountPayable';
import {
  AccountPayablePayment,
  CreateAccountPayablePaymentInput,
} from '@/core/domain/entities/AccountPayablePayment';

export class SupabaseAccountPayableRepository implements IAccountPayableRepository {
  private supabase = createClient();

  private async getTenantId(): Promise<string> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: profile, error } = await this.supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    if (error || !profile) {
      throw new Error('Failed to fetch user profile for tenant context');
    }

    return profile.tenant_id;
  }

  async create(input: CreateAccountPayableInput): Promise<AccountPayable> {
    const tenantId = await this.getTenantId();
    
    const dueDate = typeof input.dueDate === 'string' 
      ? input.dueDate 
      : input.dueDate.toISOString().split('T')[0];
    
    const { data, error } = await this.supabase
      .from('accounts_payable')
      .insert({
        tenant_id: tenantId,
        description: input.description,
        amount: input.amount,
        due_date: dueDate,
        purchase_id: input.purchaseId,
        supplier_id: input.supplierId,
        category: input.category || 'COMPRA',
        payment_status: input.status || 'PENDING',
        notes: input.notes,
        installment_number: input.installmentNumber,
        total_installments: input.totalInstallments,
        cost_center_id: input.costCenterId,
        project_id: input.projectId,
        created_by: input.createdBy,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create account payable: ${error.message}`);
    return this.mapFromDb(data);
  }

  async getById(id: string): Promise<AccountPayableWithDetails | null> {
    const tenantId = await this.getTenantId();
    
    const { data, error } = await this.supabase
      .from('accounts_payable')
      .select(`
        *,
        supplier:suppliers(name),
        purchase:purchases(id)
      `)
      .eq('tenant_id', tenantId)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to get account payable: ${error.message}`);
    }

    return this.mapWithDetailsFromDb(data);
  }

  async list(filters?: AccountPayableFilters): Promise<AccountPayableWithDetails[]> {
    const tenantId = await this.getTenantId();
    
    let query = this.supabase
      .from('accounts_payable')
      .select(`
        *,
        supplier:suppliers(name),
        purchase:purchases(id)
      `)
      .eq('tenant_id', tenantId)
      .order('due_date', { ascending: true });

    if (filters?.status) {
      query = query.eq('payment_status', filters.status);
    }

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.supplierId) {
      query = query.eq('supplier_id', filters.supplierId);
    }

    if (filters?.startDate) {
      query = query.gte('due_date', filters.startDate.toISOString().split('T')[0]);
    }

    if (filters?.endDate) {
      query = query.lte('due_date', filters.endDate.toISOString().split('T')[0]);
    }

    if (filters?.overdue) {
      const today = new Date().toISOString().split('T')[0];
      query = query.lt('due_date', today).neq('payment_status', 'PAID');
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to list accounts payable: ${error.message}`);
    return data.map((item) => this.mapWithDetailsFromDb(item));
  }

  async update(id: string, data: Partial<AccountPayable>): Promise<AccountPayable> {
    const tenantId = await this.getTenantId();
    
    const updateData: any = {};

    if (data.description !== undefined) updateData.description = data.description;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.dueDate !== undefined) updateData.due_date = data.dueDate.toISOString().split('T')[0];
    if (data.category !== undefined) updateData.category = data.category;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.paymentStatus !== undefined) updateData.payment_status = data.paymentStatus;

    const { data: updated, error } = await this.supabase
      .from('accounts_payable')
      .update(updateData)
      .eq('tenant_id', tenantId)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update account payable: ${error.message}`);
    return this.mapFromDb(updated);
  }

  async delete(id: string): Promise<void> {
    const tenantId = await this.getTenantId();
    
    const { error } = await this.supabase
      .from('accounts_payable')
      .delete()
      .eq('tenant_id', tenantId)
      .eq('id', id);

    if (error) throw new Error(`Failed to delete account payable: ${error.message}`);
  }

  async registerPayment(input: CreateAccountPayablePaymentInput): Promise<string> {
    const { data, error } = await this.supabase.rpc('register_account_payable_payment', {
      p_account_payable_id: input.accountPayableId,
      p_amount: input.amount,
      p_paid_at: input.paidAt.toISOString().split('T')[0],
      p_payment_method: input.paymentMethod,
      p_bank_account_id: input.bankAccountId,
      p_notes: input.notes,
      p_created_by: input.createdBy,
    });

    if (error) throw new Error(`Failed to register payment: ${error.message}`);
    return data;
  }

  async getPayments(accountPayableId: string): Promise<AccountPayablePayment[]> {
    const tenantId = await this.getTenantId();
    
    const { data, error } = await this.supabase
      .from('account_payable_payments')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('account_payable_id', accountPayableId)
      .order('paid_at', { ascending: false });

    if (error) throw new Error(`Failed to get payments: ${error.message}`);
    return data.map((item) => this.mapPaymentFromDb(item));
  }

  async getOverdue(): Promise<AccountPayableWithDetails[]> {
    const tenantId = await this.getTenantId();
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await this.supabase
      .from('accounts_payable')
      .select(`
        *,
        supplier:suppliers(name),
        purchase:purchases(id)
      `)
      .eq('tenant_id', tenantId)
      .lt('due_date', today)
      .neq('payment_status', 'PAID')
      .neq('payment_status', 'CANCELLED')
      .order('due_date', { ascending: true });

    if (error) throw new Error(`Failed to get overdue accounts: ${error.message}`);
    return data.map((item) => this.mapWithDetailsFromDb(item));
  }

  async getDueSoon(days: number = 7): Promise<AccountPayableWithDetails[]> {
    const tenantId = await this.getTenantId();
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + days);

    const { data, error } = await this.supabase
      .from('accounts_payable')
      .select(`
        *,
        supplier:suppliers(name),
        purchase:purchases(id)
      `)
      .eq('tenant_id', tenantId)
      .gte('due_date', today.toISOString().split('T')[0])
      .lte('due_date', futureDate.toISOString().split('T')[0])
      .neq('payment_status', 'PAID')
      .neq('payment_status', 'CANCELLED')
      .order('due_date', { ascending: true });

    if (error) throw new Error(`Failed to get due soon accounts: ${error.message}`);
    return data.map((item) => this.mapWithDetailsFromDb(item));
  }

  async getSummary(): Promise<AccountPayableSummary> {
    const tenantId = await this.getTenantId();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Get all accounts
    const { data: allAccounts, error: allError } = await this.supabase
      .from('accounts_payable')
      .select('*')
      .eq('tenant_id', tenantId);

    if (allError) throw new Error(`Failed to get summary: ${allError.message}`);

    const summary: AccountPayableSummary = {
      totalPending: 0,
      totalOverdue: 0,
      totalPaidThisMonth: 0,
      countPending: 0,
      countOverdue: 0,
      byCategory: {
        COMPRA: 0,
        ALUGUEL: 0,
        ENERGIA: 0,
        AGUA: 0,
        INTERNET: 0,
        TELEFONE: 0,
        IMPOSTOS: 0,
        SALARIOS: 0,
        OUTROS: 0,
      },
    };

    allAccounts.forEach((account) => {
      // Parse date as local date (YYYY-MM-DD format)
      const [year, month, day] = account.due_date.split('-').map(Number);
      const dueDate = new Date(year, month - 1, day);
      dueDate.setHours(0, 0, 0, 0);
      
      const remaining = account.amount - account.paid_amount;

      // Pending
      if (account.payment_status === 'PENDING' || account.payment_status === 'PARTIAL') {
        summary.totalPending += remaining;
        summary.countPending++;
      }

      // Overdue (compare only dates without time)
      if (dueDate < today && account.payment_status !== 'PAID' && account.payment_status !== 'CANCELLED') {
        summary.totalOverdue += remaining;
        summary.countOverdue++;
      }

      // Paid this month
      if (account.payment_status === 'PAID') {
        const updatedAt = new Date(account.updated_at);
        if (updatedAt >= firstDayOfMonth && updatedAt <= lastDayOfMonth) {
          summary.totalPaidThisMonth += account.amount;
        }
      }

      // By category
      if (account.payment_status !== 'CANCELLED') {
        summary.byCategory[account.category as keyof typeof summary.byCategory] += remaining;
      }
    });

    return summary;
  }

  private mapFromDb(data: any): AccountPayable {
    // Parse date as local date (YYYY-MM-DD format)
    const [year, month, day] = data.due_date.split('-').map(Number);
    const dueDate = new Date(year, month - 1, day);

    return {
      id: data.id,
      tenantId: data.tenant_id,
      description: data.description,
      amount: parseFloat(data.amount),
      dueDate,
      purchaseId: data.purchase_id,
      supplierId: data.supplier_id,
      category: data.category,
      paymentStatus: data.payment_status,
      paidAmount: parseFloat(data.paid_amount || 0),
      notes: data.notes,
      createdBy: data.created_by,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapWithDetailsFromDb(data: any): AccountPayableWithDetails {
    const base = this.mapFromDb(data);
    
    // Compare only dates (without time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDate = new Date(base.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    const isOverdue = dueDate < today && base.paymentStatus !== 'PAID' && base.paymentStatus !== 'CANCELLED';
    const daysOverdue = isOverdue ? Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : undefined;

    return {
      ...base,
      supplierName: data.supplier?.name,
      purchaseNumber: data.purchase?.id,
      remainingAmount: base.amount - base.paidAmount,
      daysOverdue,
      isOverdue,
    };
  }

  private mapPaymentFromDb(data: any): AccountPayablePayment {
    // Parse date as local date (YYYY-MM-DD format)
    const [year, month, day] = data.paid_at.split('-').map(Number);
    const paidAt = new Date(year, month - 1, day);

    return {
      id: data.id,
      tenantId: data.tenant_id,
      accountPayableId: data.account_payable_id,
      amount: parseFloat(data.amount),
      paidAt,
      paymentMethod: data.payment_method,
      bankAccountId: data.bank_account_id,
      notes: data.notes,
      createdBy: data.created_by,
      createdAt: new Date(data.created_at),
    };
  }
}
