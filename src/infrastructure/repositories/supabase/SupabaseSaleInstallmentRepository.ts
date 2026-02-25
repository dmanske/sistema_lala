import { createClient } from '@/lib/supabase/client';
import type { 
  SaleInstallment,
  SaleInstallmentWithDetails,
  CreateSaleInstallmentInput,
  RegisterReceiptInput
} from '@/core/domain/entities/SaleInstallment';
import type { ISaleInstallmentRepository } from '@/core/repositories/SaleInstallmentRepository';

export class SupabaseSaleInstallmentRepository implements ISaleInstallmentRepository {
  private supabase = createClient();

  private async getTenantId(): Promise<string> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: profile } = await this.supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    if (!profile?.tenant_id) throw new Error('Tenant not found');
    return profile.tenant_id;
  }

  private mapWithDetailsFromDb(row: any): SaleInstallmentWithDetails {
    // Parse due_date como data local
    const [year, month, day] = row.due_date.split('-').map(Number);
    const dueDate = new Date(year, month - 1, day);

    // Parse received_at se existir
    let receivedAt: Date | undefined;
    if (row.received_at) {
      const [rYear, rMonth, rDay] = row.received_at.split('-').map(Number);
      receivedAt = new Date(rYear, rMonth - 1, rDay);
    }

    return {
      id: row.id,
      tenantId: row.tenant_id,
      saleId: row.sale_id,
      installmentNumber: row.installment_number,
      amount: parseFloat(row.amount),
      dueDate,
      status: row.status,
      receivedAt,
      receivedAmount: row.received_amount ? parseFloat(row.received_amount) : undefined,
      bankAccountId: row.bank_account_id,
      notes: row.notes,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      saleTotal: parseFloat(row.sale_total),
      saleDate: new Date(row.sale_date),
      clientId: row.client_id,
      clientName: row.client_name,
      clientPhone: row.client_phone,
      clientWhatsapp: row.client_whatsapp,
      bankAccountName: row.bank_account_name,
      daysOverdue: row.days_overdue,
      isOverdue: row.is_overdue,
    };
  }

  async getById(id: string): Promise<SaleInstallmentWithDetails | null> {
    const tenantId = await this.getTenantId();

    const { data, error } = await this.supabase
      .from('vw_contas_receber')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('id', id)
      .single();

    if (error) throw new Error(`Failed to get installment: ${error.message}`);
    if (!data) return null;

    return this.mapWithDetailsFromDb(data);
  }

  async getBySaleId(saleId: string): Promise<SaleInstallmentWithDetails[]> {
    const tenantId = await this.getTenantId();

    const { data, error } = await this.supabase
      .from('vw_contas_receber')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('sale_id', saleId)
      .order('installment_number', { ascending: true });

    if (error) throw new Error(`Failed to get installments: ${error.message}`);
    return data.map(row => this.mapWithDetailsFromDb(row));
  }

  async getPending(filters?: {
    clientId?: string;
    startDate?: Date;
    endDate?: Date;
    overdue?: boolean;
  }): Promise<SaleInstallmentWithDetails[]> {
    const tenantId = await this.getTenantId();

    let query = this.supabase
      .from('vw_contas_receber')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('status', 'PENDING');

    if (filters?.clientId) {
      query = query.eq('client_id', filters.clientId);
    }

    if (filters?.startDate) {
      const year = filters.startDate.getFullYear();
      const month = String(filters.startDate.getMonth() + 1).padStart(2, '0');
      const day = String(filters.startDate.getDate()).padStart(2, '0');
      query = query.gte('due_date', `${year}-${month}-${day}`);
    }

    if (filters?.endDate) {
      const year = filters.endDate.getFullYear();
      const month = String(filters.endDate.getMonth() + 1).padStart(2, '0');
      const day = String(filters.endDate.getDate()).padStart(2, '0');
      query = query.lte('due_date', `${year}-${month}-${day}`);
    }

    if (filters?.overdue) {
      query = query.eq('is_overdue', true);
    }

    query = query.order('due_date', { ascending: true });

    const { data, error } = await query;

    if (error) throw new Error(`Failed to get pending installments: ${error.message}`);
    return data.map(row => this.mapWithDetailsFromDb(row));
  }

  async getOverdue(): Promise<SaleInstallmentWithDetails[]> {
    return this.getPending({ overdue: true });
  }

  async create(input: CreateSaleInstallmentInput): Promise<string> {
    const tenantId = await this.getTenantId();

    // Formatar dueDate como YYYY-MM-DD
    const year = input.dueDate.getFullYear();
    const month = String(input.dueDate.getMonth() + 1).padStart(2, '0');
    const day = String(input.dueDate.getDate()).padStart(2, '0');
    const dueDateStr = `${year}-${month}-${day}`;

    const { data, error } = await this.supabase
      .from('sale_installments')
      .insert({
        tenant_id: tenantId,
        sale_id: input.saleId,
        installment_number: input.installmentNumber,
        amount: input.amount,
        due_date: dueDateStr,
        status: 'PENDING',
      })
      .select('id')
      .single();

    if (error) throw new Error(`Failed to create installment: ${error.message}`);
    return data.id;
  }

  async createBatch(inputs: CreateSaleInstallmentInput[]): Promise<string[]> {
    const tenantId = await this.getTenantId();

    const records = inputs.map(input => {
      const year = input.dueDate.getFullYear();
      const month = String(input.dueDate.getMonth() + 1).padStart(2, '0');
      const day = String(input.dueDate.getDate()).padStart(2, '0');
      const dueDateStr = `${year}-${month}-${day}`;

      return {
        tenant_id: tenantId,
        sale_id: input.saleId,
        installment_number: input.installmentNumber,
        amount: input.amount,
        due_date: dueDateStr,
        status: 'PENDING',
      };
    });

    const { data, error } = await this.supabase
      .from('sale_installments')
      .insert(records)
      .select('id');

    if (error) throw new Error(`Failed to create installments: ${error.message}`);
    return data.map(row => row.id);
  }

  async registerReceipt(input: RegisterReceiptInput): Promise<string> {
    // Formatar receivedAt como YYYY-MM-DD
    const year = input.receivedAt.getFullYear();
    const month = String(input.receivedAt.getMonth() + 1).padStart(2, '0');
    const day = String(input.receivedAt.getDate()).padStart(2, '0');
    const receivedAtStr = `${year}-${month}-${day}`;

    const { data, error } = await this.supabase.rpc('register_installment_receipt', {
      p_installment_id: input.installmentId,
      p_received_amount: input.receivedAmount,
      p_received_at: receivedAtStr,
      p_bank_account_id: input.bankAccountId,
      p_payment_method: input.paymentMethod,
      p_notes: input.notes || null,
    });

    if (error) throw new Error(`Failed to register receipt: ${error.message}`);
    return data;
  }

  async getSummary(): Promise<{
    totalPending: number;
    totalOverdue: number;
    totalDueIn7Days: number;
    totalDueIn30Days: number;
    countPending: number;
    countOverdue: number;
  }> {
    const tenantId = await this.getTenantId();

    const { data, error } = await this.supabase
      .from('vw_contas_receber')
      .select('amount, due_date, status, is_overdue')
      .eq('tenant_id', tenantId)
      .eq('status', 'PENDING');

    if (error) throw new Error(`Failed to get summary: ${error.message}`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const in7Days = new Date(today);
    in7Days.setDate(in7Days.getDate() + 7);

    const in30Days = new Date(today);
    in30Days.setDate(in30Days.getDate() + 30);

    let totalPending = 0;
    let totalOverdue = 0;
    let totalDueIn7Days = 0;
    let totalDueIn30Days = 0;
    let countOverdue = 0;

    data.forEach(row => {
      const amount = parseFloat(row.amount);
      totalPending += amount;

      if (row.is_overdue) {
        totalOverdue += amount;
        countOverdue++;
      } else {
        const [year, month, day] = row.due_date.split('-').map(Number);
        const dueDate = new Date(year, month - 1, day);
        dueDate.setHours(0, 0, 0, 0);

        if (dueDate <= in7Days) {
          totalDueIn7Days += amount;
        }
        if (dueDate <= in30Days) {
          totalDueIn30Days += amount;
        }
      }
    });

    return {
      totalPending,
      totalOverdue,
      totalDueIn7Days,
      totalDueIn30Days,
      countPending: data.length,
      countOverdue,
    };
  }
}
