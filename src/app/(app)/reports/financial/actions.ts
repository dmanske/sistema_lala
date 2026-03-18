'use server';

import { createClient } from '@/lib/supabase/server';

export async function generateDRE(startDate: string, endDate: string) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    if (!profile?.tenant_id) throw new Error('Tenant not found');

    // Buscar receitas de vendas
    const { data: sales } = await supabase
      .from('sales')
      .select(`
        total,
        sale_items (
          item_type,
          total_price,
          cost_snapshot,
          qty
        )
      `)
      .eq('tenant_id', profile.tenant_id)
      .eq('status', 'paid')
      .gte('created_at', startDate)
      .lte('created_at', `${endDate}T23:59:59`);

    // Calcular receitas
    let revenueServices = 0;
    let revenueProducts = 0;
    let costServices = 0;
    let costProducts = 0;

    sales?.forEach((sale: any) => {
      sale.sale_items?.forEach((item: any) => {
        if (item.item_type === 'service') {
          revenueServices += Number(item.total_price || 0);
          costServices += Number(item.cost_snapshot || 0) * Number(item.qty || 0);
        } else if (item.item_type === 'product') {
          revenueProducts += Number(item.total_price || 0);
          costProducts += Number(item.cost_snapshot || 0) * Number(item.qty || 0);
        }
      });
    });

    const totalRevenue = revenueServices + revenueProducts;
    const totalCosts = costServices + costProducts;
    const grossProfit = totalRevenue - totalCosts;
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    // Buscar despesas operacionais (filtrar por paid_at — data real do pagamento)
    const { data: expenses } = await supabase
      .from('accounts_payable')
      .select('amount, category')
      .eq('tenant_id', profile.tenant_id)
      .eq('payment_status', 'PAID')
      .gte('paid_at', startDate)
      .lte('paid_at', endDate);

    const expensesByCategory: Record<string, number> = {};
    let totalExpenses = 0;

    expenses?.forEach((expense: any) => {
      const amount = Number(expense.amount || 0);
      totalExpenses += amount;
      expensesByCategory[expense.category] = (expensesByCategory[expense.category] || 0) + amount;
    });

    const operatingProfit = grossProfit - totalExpenses;
    const operatingMargin = totalRevenue > 0 ? (operatingProfit / totalRevenue) * 100 : 0;

    const netProfit = operatingProfit;
    const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      period: { start: startDate, end: endDate },
      revenue: {
        services: revenueServices,
        products: revenueProducts,
        total: totalRevenue,
      },
      costs: {
        services: costServices,
        products: costProducts,
        total: totalCosts,
      },
      grossProfit,
      grossMargin,
      operatingExpenses: {
        byCategory: expensesByCategory,
        total: totalExpenses,
      },
      operatingProfit,
      operatingMargin,
      netProfit,
      netMargin,
    };
  } catch (error) {
    console.error('Erro ao gerar DRE:', error);
    return {
      period: { start: startDate, end: endDate },
      revenue: { services: 0, products: 0, total: 0 },
      costs: { services: 0, products: 0, total: 0 },
      grossProfit: 0,
      grossMargin: 0,
      operatingExpenses: { byCategory: {}, total: 0 },
      operatingProfit: 0,
      operatingMargin: 0,
      netProfit: 0,
      netMargin: 0,
    };
  }
}

export async function getProfitabilityByService(startDate: string, endDate: string) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    if (!profile?.tenant_id) throw new Error('Tenant not found');

    // Buscar vendas pagas no período
    const { data: paidSales } = await supabase
      .from('sales')
      .select('id')
      .eq('tenant_id', profile.tenant_id)
      .eq('status', 'paid')
      .gte('created_at', startDate)
      .lte('created_at', `${endDate}T23:59:59`);

    if (!paidSales || paidSales.length === 0) return [];

    const saleIds = paidSales.map((s: any) => s.id);

    // Buscar itens de serviço com nome do serviço
    const { data: items } = await supabase
      .from('sale_items')
      .select(`
        item_name,
        service_id,
        qty,
        total_price,
        cost_snapshot
      `)
      .in('sale_id', saleIds)
      .eq('item_type', 'service');

    const serviceMap: Record<string, any> = {};

    items?.forEach((item: any) => {
      const key = item.service_id || item.item_name;
      if (!serviceMap[key]) {
        serviceMap[key] = {
          service_id: item.service_id,
          service_name: item.item_name,
          quantity: 0,
          revenue: 0,
          cost: 0,
        };
      }
      serviceMap[key].quantity += Number(item.qty || 0);
      serviceMap[key].revenue += Number(item.total_price || 0);
      serviceMap[key].cost += Number(item.cost_snapshot || 0) * Number(item.qty || 0);
    });

    return Object.values(serviceMap).map((s: any) => ({
      ...s,
      profit: s.revenue - s.cost,
      margin: s.revenue > 0 ? ((s.revenue - s.cost) / s.revenue) * 100 : 0,
      avg_ticket: s.quantity > 0 ? s.revenue / s.quantity : 0,
    })).sort((a: any, b: any) => b.revenue - a.revenue);
  } catch (error) {
    console.error('Erro ao buscar rentabilidade por serviço:', error);
    return [];
  }
}

export async function getProfitabilityByProfessional(startDate: string, endDate: string) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    if (!profile?.tenant_id) throw new Error('Tenant not found');

    // Buscar vendas pagas com profissional via agendamento
    const { data: sales } = await supabase
      .from('sales')
      .select(`
        total,
        appointment:appointments(
          professional:professionals(id, name)
        )
      `)
      .eq('tenant_id', profile.tenant_id)
      .eq('status', 'paid')
      .gte('created_at', startDate)
      .lte('created_at', `${endDate}T23:59:59`)
      .not('appointment_id', 'is', null);

    const profitabilityMap: Record<string, any> = {};

    sales?.forEach((sale: any) => {
      const prof = sale.appointment?.professional;
      if (!prof) return;

      if (!profitabilityMap[prof.id]) {
        profitabilityMap[prof.id] = {
          professionalId: prof.id,
          professionalName: prof.name,
          revenue: 0,
          servicesCount: 0,
        };
      }

      profitabilityMap[prof.id].revenue += Number(sale.total || 0);
      profitabilityMap[prof.id].servicesCount += 1;
    });

    return Object.values(profitabilityMap).map((prof: any) => ({
      ...prof,
      avgTicket: prof.servicesCount > 0 ? prof.revenue / prof.servicesCount : 0,
    })).sort((a: any, b: any) => b.revenue - a.revenue);
  } catch (error) {
    console.error('Erro ao buscar rentabilidade por profissional:', error);
    return [];
  }
}

export async function getExpensesByCategory(startDate: string, endDate: string) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    if (!profile?.tenant_id) throw new Error('Tenant not found');

    const { data: expenses } = await supabase
      .from('accounts_payable')
      .select('amount, category')
      .eq('tenant_id', profile.tenant_id)
      .eq('payment_status', 'PAID')
      .gte('paid_at', startDate)
      .lte('paid_at', endDate);

    const categoryMap: Record<string, number> = {};
    let total = 0;

    expenses?.forEach((expense: any) => {
      const amount = Number(expense.amount || 0);
      total += amount;
      categoryMap[expense.category] = (categoryMap[expense.category] || 0) + amount;
    });

    return Object.entries(categoryMap).map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
    })).sort((a, b) => b.amount - a.amount);
  } catch (error) {
    console.error('Erro ao buscar despesas por categoria:', error);
    return [];
  }
}
