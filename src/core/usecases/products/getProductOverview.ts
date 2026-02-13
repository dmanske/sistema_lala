import { createClient } from '@/lib/supabase/client';

export interface ProductSalesStats {
  totalSold: number;
  totalRevenue: number;
  totalProfit: number;
  lastSaleDate?: string;
  averageTicket: number;
  stockValue: number;
  turnoverDays: number;
}

export interface ProductAlert {
  type: 'inactive' | 'critical_stock' | 'excess_stock' | 'negative_margin';
  message: string;
  severity: 'warning' | 'error' | 'info';
}

export interface MonthlySales {
  month: string;
  quantity: number;
  revenue: number;
}

export interface ProductOverview {
  stats: ProductSalesStats;
  alerts: ProductAlert[];
  monthlySales: MonthlySales[];
}

export async function getProductOverview(productId: string, productCost: number, productPrice: number, currentStock: number): Promise<ProductOverview> {
  const supabase = createClient();

  // Buscar vendas do produto (appointments finalizados com used_products)
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select('finalized_at, used_products')
    .eq('status', 'DONE')
    .not('used_products', 'is', null);

  if (error) {
    console.error('Error fetching product sales:', error);
    return {
      stats: {
        totalSold: 0,
        totalRevenue: 0,
        totalProfit: 0,
        averageTicket: 0,
        stockValue: currentStock * productCost,
        turnoverDays: 0,
      },
      alerts: [],
      monthlySales: [],
    };
  }

  // Filtrar e processar vendas deste produto
  let totalSold = 0;
  let totalRevenue = 0;
  let totalProfit = 0;
  let lastSaleDate: string | undefined;
  const salesByMonth: Record<string, { quantity: number; revenue: number }> = {};

  appointments?.forEach((apt) => {
    const usedProducts = apt.used_products as Array<{
      productId: string;
      quantity: number;
      price: number;
      cost: number;
    }>;

    usedProducts?.forEach((product) => {
      if (product.productId === productId) {
        const quantity = product.quantity || 0;
        const price = product.price || 0;
        const cost = product.cost || 0;

        totalSold += quantity;
        totalRevenue += price * quantity;
        totalProfit += (price - cost) * quantity;

        // Última venda
        if (apt.finalized_at) {
          if (!lastSaleDate || new Date(apt.finalized_at) > new Date(lastSaleDate)) {
            lastSaleDate = apt.finalized_at;
          }

          // Agrupar por mês
          const monthKey = new Date(apt.finalized_at).toISOString().slice(0, 7); // YYYY-MM
          if (!salesByMonth[monthKey]) {
            salesByMonth[monthKey] = { quantity: 0, revenue: 0 };
          }
          salesByMonth[monthKey].quantity += quantity;
          salesByMonth[monthKey].revenue += price * quantity;
        }
      }
    });
  });

  // Calcular métricas
  const averageTicket = totalSold > 0 ? totalRevenue / totalSold : 0;
  const stockValue = currentStock * productCost;

  // Calcular giro de estoque (dias)
  let turnoverDays = 0;
  if (totalSold > 0 && lastSaleDate) {
    const daysSinceFirstSale = Math.max(
      1,
      Math.floor((Date.now() - new Date(lastSaleDate).getTime()) / (1000 * 60 * 60 * 24))
    );
    const dailySales = totalSold / Math.max(daysSinceFirstSale, 1);
    turnoverDays = dailySales > 0 ? Math.round(currentStock / dailySales) : 0;
  }

  // Gerar alertas
  const alerts: ProductAlert[] = [];

  // Alerta: Produto parado (sem venda há 60+ dias)
  if (lastSaleDate) {
    const daysSinceLastSale = Math.floor((Date.now() - new Date(lastSaleDate).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceLastSale >= 60) {
      alerts.push({
        type: 'inactive',
        message: `Produto sem vendas há ${daysSinceLastSale} dias`,
        severity: 'warning',
      });
    }
  } else if (totalSold === 0) {
    alerts.push({
      type: 'inactive',
      message: 'Produto nunca foi vendido',
      severity: 'info',
    });
  }

  // Alerta: Estoque excessivo (mais de 90 dias de giro)
  if (turnoverDays > 90 && currentStock > 0) {
    alerts.push({
      type: 'excess_stock',
      message: `Estoque excessivo: ${turnoverDays} dias de giro`,
      severity: 'warning',
    });
  }

  // Alerta: Margem negativa
  if (productPrice < productCost) {
    alerts.push({
      type: 'negative_margin',
      message: 'Preço de venda menor que o custo',
      severity: 'error',
    });
  }

  // Preparar vendas mensais (últimos 6 meses)
  const monthlySales: MonthlySales[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = date.toISOString().slice(0, 7);
    const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    
    monthlySales.push({
      month: monthName,
      quantity: salesByMonth[monthKey]?.quantity || 0,
      revenue: salesByMonth[monthKey]?.revenue || 0,
    });
  }

  return {
    stats: {
      totalSold,
      totalRevenue,
      totalProfit,
      lastSaleDate,
      averageTicket,
      stockValue,
      turnoverDays,
    },
    alerts,
    monthlySales,
  };
}
