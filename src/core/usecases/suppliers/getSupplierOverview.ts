import { getSupplierRepository, getPurchaseRepository } from "@/infrastructure/repositories/factory";

export interface ProductStats {
    productId: string;
    productName: string;
    totalQuantity: number;
    totalSpent: number;
    lastPurchaseDate: string;
    lastPurchasePrice: number;
    averagePrice: number;
    minPrice: number;
    maxPrice: number;
    purchaseCount: number;
}

export interface PurchaseByMonth {
    month: string; // YYYY-MM
    total: number;
    count: number;
}

export interface SupplierMetrics {
    totalSpent: number;
    totalPurchases: number;
    averageTicket: number;
    lastPurchaseDate?: string;
    averageFrequency: number; // Dias entre compras
    supplierSince: string;
    totalProducts: number;
}

export interface SupplierAlert {
    type: 'inactive' | 'no_cnpj' | 'no_contact';
    severity: 'warning' | 'info' | 'error';
    message: string;
}

export interface SupplierOverview {
    metrics: SupplierMetrics;
    alerts: SupplierAlert[];
    charts: {
        purchasesByMonth: PurchaseByMonth[];
        topProducts: ProductStats[];
    };
    products: ProductStats[];
}

export async function getSupplierOverview(supplierId: string): Promise<SupplierOverview> {
    const supplierRepo = getSupplierRepository();
    const purchaseRepo = getPurchaseRepository();
    const productRepo = await import('@/infrastructure/repositories/factory').then(m => m.getProductRepository());

    // Buscar dados do fornecedor
    const supplier = await supplierRepo.getById(supplierId);
    if (!supplier) {
        throw new Error('Fornecedor não encontrado');
    }

    // Buscar todas as compras do fornecedor
    const purchases = await purchaseRepo.getAll({ supplierId });

    // Calcular métricas
    const totalSpent = purchases.reduce((sum, p) => sum + p.total, 0);
    const totalPurchases = purchases.length;
    const averageTicket = totalPurchases > 0 ? totalSpent / totalPurchases : 0;

    // Última compra
    const sortedPurchases = purchases
        .filter(p => p.date)
        .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime());
    const lastPurchaseDate = sortedPurchases[0]?.date;

    // Frequência média (dias entre compras)
    let averageFrequency = 0;
    if (purchases.length >= 2) {
        const sortedDates = purchases
            .filter(p => p.date)
            .map(p => new Date(p.date!).getTime())
            .sort((a, b) => a - b);

        const intervals: number[] = [];
        for (let i = 1; i < sortedDates.length; i++) {
            const daysDiff = (sortedDates[i] - sortedDates[i - 1]) / (1000 * 60 * 60 * 24);
            intervals.push(daysDiff);
        }

        averageFrequency = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    }

    // Fornecedor desde
    const supplierSince = supplier.createdAt;

    // Agregar produtos
    const productStatsMap = new Map<string, {
        productName: string;
        totalQuantity: number;
        totalSpent: number;
        prices: number[];
        dates: string[];
        purchaseCount: number;
    }>();

    for (const purchase of purchases) {
        if (!purchase.items || !Array.isArray(purchase.items)) continue;

        for (const item of purchase.items) {
            // Validar dados do item
            if (!item.productId) continue;
            
            const quantity = Number(item.quantity) || 0;
            const lineTotal = Number(item.lineTotal) || 0;
            const unitCost = Number(item.unitCost) || 0;
            
            if (quantity <= 0 || lineTotal < 0) continue;

            // Buscar nome do produto
            let productName = 'Produto Desconhecido';
            try {
                const product = await productRepo.getById(item.productId);
                if (product) {
                    productName = product.name;
                }
            } catch (error) {
                console.error(`Erro ao buscar produto ${item.productId}:`, error);
            }

            const current = productStatsMap.get(item.productId) || {
                productName: productName,
                totalQuantity: 0,
                totalSpent: 0,
                prices: [],
                dates: [],
                purchaseCount: 0
            };

            productStatsMap.set(item.productId, {
                productName: productName,
                totalQuantity: current.totalQuantity + quantity,
                totalSpent: current.totalSpent + lineTotal,
                prices: [...current.prices, unitCost],
                dates: [...current.dates, purchase.date || ''],
                purchaseCount: current.purchaseCount + 1
            });
        }
    }

    // Converter para array de ProductStats
    const products: ProductStats[] = Array.from(productStatsMap.entries()).map(([productId, stats]) => {
        const sortedPrices = [...stats.prices].sort((a, b) => a - b);
        const sortedDates = [...stats.dates].sort((a, b) => b.localeCompare(a));

        // Calcular preço médio corretamente
        const averagePrice = stats.totalQuantity > 0 ? stats.totalSpent / stats.totalQuantity : 0;

        return {
            productId,
            productName: stats.productName,
            totalQuantity: stats.totalQuantity,
            totalSpent: stats.totalSpent,
            lastPurchaseDate: sortedDates[0] || '',
            lastPurchasePrice: stats.prices.length > 0 ? stats.prices[stats.prices.length - 1] : 0,
            averagePrice: averagePrice,
            minPrice: sortedPrices.length > 0 ? sortedPrices[0] : 0,
            maxPrice: sortedPrices.length > 0 ? sortedPrices[sortedPrices.length - 1] : 0,
            purchaseCount: stats.purchaseCount
        };
    });

    const totalProducts = products.length;

    // Top 5 produtos
    const topProducts = [...products]
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5);

    // Compras por mês (últimos 6 meses)
    const purchasesByMonthMap = new Map<string, { total: number; count: number }>();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    purchases.forEach(purchase => {
        if (!purchase.date) return;
        const purchaseDate = new Date(purchase.date);
        if (purchaseDate >= sixMonthsAgo) {
            const monthKey = `${purchaseDate.getFullYear()}-${String(purchaseDate.getMonth() + 1).padStart(2, '0')}`;
            const current = purchasesByMonthMap.get(monthKey) || { total: 0, count: 0 };
            purchasesByMonthMap.set(monthKey, {
                total: current.total + purchase.total,
                count: current.count + 1
            });
        }
    });

    const purchasesByMonth: PurchaseByMonth[] = Array.from(purchasesByMonthMap.entries())
        .map(([month, data]) => ({ month, total: data.total, count: data.count }))
        .sort((a, b) => a.month.localeCompare(b.month));

    // Calcular alertas
    const alerts: SupplierAlert[] = [];

    // Alerta: Fornecedor inativo (sem compra há 90+ dias)
    if (lastPurchaseDate) {
        const daysSinceLastPurchase = Math.floor((new Date().getTime() - new Date(lastPurchaseDate).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceLastPurchase >= 90) {
            alerts.push({
                type: 'inactive',
                severity: 'warning',
                message: `Fornecedor inativo há ${daysSinceLastPurchase} dias. Considere verificar o relacionamento.`
            });
        }
    }

    // Alerta: Sem CNPJ
    if (!supplier.cnpj) {
        alerts.push({
            type: 'no_cnpj',
            severity: 'info',
            message: 'CNPJ não cadastrado. Recomendamos adicionar para fins fiscais.'
        });
    }

    // Alerta: Sem contato
    if (!supplier.phone && !supplier.whatsapp && !supplier.email) {
        alerts.push({
            type: 'no_contact',
            severity: 'error',
            message: 'Nenhum contato cadastrado. Adicione telefone, WhatsApp ou email.'
        });
    }

    return {
        metrics: {
            totalSpent,
            totalPurchases,
            averageTicket,
            lastPurchaseDate,
            averageFrequency,
            supplierSince,
            totalProducts
        },
        alerts,
        charts: {
            purchasesByMonth,
            topProducts
        },
        products: products.sort((a, b) => b.totalSpent - a.totalSpent)
    };
}
