import { createClient } from "@/lib/supabase/server";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

export async function GetFinancialInsights(period: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile?.tenant_id) throw new Error('Tenant not found');

  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  // Definir período
  switch (period) {
    case "last_month":
      startDate = startOfMonth(subMonths(now, 1));
      endDate = endOfMonth(subMonths(now, 1));
      break;
    case "last_3_months":
      startDate = startOfMonth(subMonths(now, 2));
      endDate = now;
      break;
    case "current_year":
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = now;
      break;
    default: // current_month
      startDate = startOfMonth(now);
      endDate = now;
  }

  // === 1. INADIMPLÊNCIA ===
  
  // 1.1 Buscar parcelas de vendas vencidas (contas a receber)
  const { data: overdueInstallments } = await supabase
    .from('sale_installments')
    .select('amount, due_date')
    .eq('tenant_id', profile.tenant_id)
    .eq('status', 'PENDING')
    .lt('due_date', now.toISOString().split('T')[0]); // Comparar apenas a data

  console.log('Overdue installments:', overdueInstallments);

  const totalOverdueReceivables = overdueInstallments?.reduce((sum, inst) => sum + Number(inst.amount || 0), 0) || 0;
  const overdueReceivablesCount = overdueInstallments?.length || 0;

  // 1.2 Buscar contas a pagar vencidas
  const { data: overduePayables } = await supabase
    .from('accounts_payable')
    .select('amount, due_date')
    .eq('tenant_id', profile.tenant_id)
    .in('payment_status', ['PENDING', 'OVERDUE'])
    .lt('due_date', now.toISOString().split('T')[0]);

  console.log('Overdue payables:', overduePayables);

  const totalOverduePayables = overduePayables?.reduce((sum, ap) => sum + Number(ap.amount || 0), 0) || 0;
  const overduePayablesCount = overduePayables?.length || 0;

  // Total de inadimplência (recebíveis + pagáveis vencidos)
  const totalOverdue = totalOverdueReceivables + totalOverduePayables;
  const overdueCount = overdueReceivablesCount + overduePayablesCount;

  // Buscar total de recebíveis (todas as parcelas pendentes)
  const { data: allReceivables } = await supabase
    .from('sale_installments')
    .select('amount')
    .eq('tenant_id', profile.tenant_id)
    .eq('status', 'PENDING');

  console.log('All receivables:', allReceivables);

  const totalReceivables = allReceivables?.reduce((sum, inst) => sum + Number(inst.amount || 0), 0) || 0;
  
  // Taxa de inadimplência baseada apenas em recebíveis (se houver)
  const defaultRate = totalReceivables > 0 ? (totalOverdueReceivables / totalReceivables) * 100 : 0;

  // === 2. DESPESAS FIXAS VS VARIÁVEIS ===
  
  // Categorias consideradas fixas
  const fixedCategories = ['ALUGUEL', 'ENERGIA', 'AGUA', 'INTERNET', 'TELEFONE', 'SALARIOS'];
  
  // Buscar contas a pagar pagas do período
  const { data: accountsPayable } = await supabase
    .from('accounts_payable')
    .select('amount, category, payment_status')
    .eq('tenant_id', profile.tenant_id)
    .eq('payment_status', 'PAID')
    .gte('due_date', startDate.toISOString())
    .lte('due_date', endDate.toISOString());

  let fixedExpenses = 0;
  let variableExpenses = 0;

  accountsPayable?.forEach((expense: any) => {
    const amount = Number(expense.amount || 0);
    if (fixedCategories.includes(expense.category)) {
      fixedExpenses += amount;
    } else {
      variableExpenses += amount;
    }
  });

  console.log('Accounts payable:', accountsPayable);
  console.log('Fixed expenses:', fixedExpenses, 'Variable expenses:', variableExpenses);

  const totalExpenses = fixedExpenses + variableExpenses;

  // === 3. DRE SIMPLIFICADO ===
  
  // Buscar vendas do período
  const { data: sales } = await supabase
    .from('sales')
    .select(`
      total_amount,
      sale_items (
        item_type,
        total_price,
        cost_snapshot,
        qty
      )
    `)
    .eq('tenant_id', profile.tenant_id)
    .eq('status', 'paid')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  let totalRevenue = 0;
  let totalCosts = 0;

  sales?.forEach((sale: any) => {
    totalRevenue += Number(sale.total_amount || 0);
    
    sale.sale_items?.forEach((item: any) => {
      const costPerUnit = Number(item.cost_snapshot || 0);
      const qty = Number(item.qty || 0);
      totalCosts += costPerUnit * qty;
    });
  });

  const grossProfit = totalRevenue - totalCosts;
  const netProfit = grossProfit - totalExpenses;
  const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  console.log('Sales:', sales);
  console.log('Revenue:', totalRevenue, 'Costs:', totalCosts, 'Expenses:', totalExpenses);
  console.log('Gross profit:', grossProfit, 'Net profit:', netProfit);

  return {
    defaultRate: {
      totalOverdue,
      totalReceivables,
      overdueCount,
      defaultRate,
    },
    expenseType: {
      fixed: fixedExpenses,
      variable: variableExpenses,
      total: totalExpenses,
    },
    simplifiedDRE: {
      revenue: totalRevenue,
      costs: totalCosts,
      expenses: totalExpenses,
      grossProfit,
      netProfit,
      grossMargin,
      netMargin,
    },
  };
}
