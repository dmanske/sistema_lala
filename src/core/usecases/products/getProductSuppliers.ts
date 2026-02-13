import { createClient } from '@/lib/supabase/client';

export interface ProductSupplierInfo {
  supplierId: string;
  supplierName: string;
  totalQuantity: number;
  lastPurchaseDate: string;
  lastPurchasePrice: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  purchaseCount: number;
}

export async function getProductSuppliers(productId: string): Promise<ProductSupplierInfo[]> {
  const supabase = createClient();

  // Buscar movimentações de compra deste produto
  const { data: movements, error } = await supabase
    .from('product_movements')
    .select('supplier_id, unit_cost, quantity, created_at')
    .eq('product_id', productId)
    .eq('type', 'IN')
    .eq('reference_type', 'PURCHASE')
    .not('supplier_id', 'is', null)
    .order('created_at', { ascending: false });

  if (error || !movements) {
    console.error('Error fetching product suppliers:', error);
    return [];
  }

  // Agrupar por fornecedor
  const supplierMap = new Map<string, {
    totalQuantity: number;
    lastPurchaseDate: string;
    lastPurchasePrice: number;
    prices: number[];
    purchaseCount: number;
  }>();

  movements.forEach((movement) => {
    const supplierId = movement.supplier_id;
    if (!supplierId) return;

    const existing = supplierMap.get(supplierId);
    const price = Number(movement.unit_cost) || 0;
    const quantity = Number(movement.quantity) || 0;

    if (existing) {
      existing.totalQuantity += quantity;
      existing.prices.push(price);
      existing.purchaseCount += 1;
      
      // Atualizar última compra se for mais recente
      if (new Date(movement.created_at) > new Date(existing.lastPurchaseDate)) {
        existing.lastPurchaseDate = movement.created_at;
        existing.lastPurchasePrice = price;
      }
    } else {
      supplierMap.set(supplierId, {
        totalQuantity: quantity,
        lastPurchaseDate: movement.created_at,
        lastPurchasePrice: price,
        prices: [price],
        purchaseCount: 1,
      });
    }
  });

  // Buscar nomes dos fornecedores
  const supplierIds = Array.from(supplierMap.keys());
  const { data: suppliers } = await supabase
    .from('suppliers')
    .select('id, name')
    .in('id', supplierIds);

  const supplierNameMap = new Map(
    suppliers?.map((s) => [s.id, s.name]) || []
  );

  // Montar resultado
  const result: ProductSupplierInfo[] = [];

  supplierMap.forEach((data, supplierId) => {
    const prices = data.prices.filter((p) => p > 0);
    const averagePrice = prices.length > 0
      ? prices.reduce((sum, p) => sum + p, 0) / prices.length
      : 0;
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    result.push({
      supplierId,
      supplierName: supplierNameMap.get(supplierId) || 'Fornecedor Desconhecido',
      totalQuantity: data.totalQuantity,
      lastPurchaseDate: data.lastPurchaseDate,
      lastPurchasePrice: data.lastPurchasePrice,
      averagePrice,
      minPrice,
      maxPrice,
      purchaseCount: data.purchaseCount,
    });
  });

  // Ordenar por quantidade total (mais comprado primeiro)
  result.sort((a, b) => b.totalQuantity - a.totalQuantity);

  return result;
}
