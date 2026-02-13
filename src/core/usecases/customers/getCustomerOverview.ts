import { getSaleRepository, getServiceRepository, getAppointmentRepository } from "@/infrastructure/repositories/factory";
import { SaleItem } from "@/core/domain/sales/types";

export interface LastService {
    id: string;
    name: string;
    date: string; // ISO string
    value: number;
}

export interface ServiceStats {
    name: string;
    count: number;
    totalValue: number;
}

export interface ProductStats {
    name: string;
    quantity: number;
    totalValue: number;
}

export interface SpendingByMonth {
    month: string; // YYYY-MM
    total: number;
}

export interface CustomerMetrics {
    totalVisits: number;
    totalCancellations: number;
    averageTicket: number;
    totalSpent: number; // Lifetime value
    totalSpentOnProducts: number;
    averageFrequency: number; // Dias entre visitas
    customerSince: string; // Data do primeiro agendamento
    lastVisit?: string; // Data da última visita
    nextAppointment?: {
        date: string;
        time: string;
    };
}

export interface CustomerAlert {
    type: 'inactive' | 'birthday' | 'negative_credit';
    severity: 'warning' | 'info' | 'error';
    message: string;
    icon?: string;
}

export interface CustomerOverview {
    lastServices: LastService[];
    metrics: CustomerMetrics;
    alerts: CustomerAlert[];
    charts: {
        spendingByMonth: SpendingByMonth[];
        topServices: ServiceStats[];
        topProducts: ProductStats[];
    };
}

export async function getCustomerOverview(customerId: string): Promise<CustomerOverview> {
    const saleRepo = getSaleRepository();
    const serviceRepo = getServiceRepository();
    const appointmentRepo = getAppointmentRepository();
    const clientRepo = await import('@/infrastructure/repositories/factory').then(m => m.getClientRepository());

    // Buscar dados do cliente
    const client = await clientRepo.getById(customerId);
    if (!client) {
        throw new Error('Cliente não encontrado');
    }

    // 1. Buscar todas as vendas pagas do cliente
    const allSales = await saleRepo.findByCustomerId(customerId);
    const paidSales = allSales.filter(sale => sale.status === 'paid');

    // 2. Filtrar vendas com appointmentId (origem: atendimento)
    const appointmentSales = paidSales.filter(sale => sale.appointmentId);

    // 3. Extrair serviços das vendas
    const serviceItems: Array<{ name: string; date: string; value: number; serviceId?: string }> = [];

    for (const sale of appointmentSales) {
        if (!sale.items) continue;

        const serviceItemsInSale = sale.items.filter((item: SaleItem) => item.itemType === 'service');

        for (const item of serviceItemsInSale) {
            serviceItems.push({
                name: item.name, // Snapshot name
                date: sale.createdAt,
                value: item.totalPrice,
                serviceId: item.serviceId
            });
        }
    }

    // 4. Ordenar por data (mais recente primeiro) e pegar últimos 5
    const sortedServices = serviceItems
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

    // 5. Resolver nomes dos serviços (tentar buscar do catálogo, fallback para snapshot)
    const lastServices: LastService[] = await Promise.all(
        sortedServices.map(async (item, index) => {
            let serviceName = item.name; // Default: usar snapshot

            if (item.serviceId) {
                try {
                    const service = await serviceRepo.getById(item.serviceId);
                    if (service) {
                        serviceName = service.name; // Usar nome atual do catálogo
                    }
                } catch (error) {
                    // Serviço não existe mais, usar snapshot
                }
            }

            return {
                id: `service-${index}`,
                name: serviceName,
                date: item.date,
                value: item.value
            };
        })
    );

    // 6. Calcular métricas
    const allAppointments = await appointmentRepo.getAll({ clientId: customerId });

    const completedAppointments = allAppointments.filter(apt => apt.status === 'DONE');
    const totalVisits = completedAppointments.length;
    const totalCancellations = allAppointments.filter(apt =>
        apt.status === 'CANCELED' || apt.status === 'NO_SHOW'
    ).length;

    // Total gasto (lifetime value)
    const totalSpent = paidSales.reduce((sum, sale) => sum + sale.total, 0);

    // Ticket médio: total de vendas pagas / número de vendas
    const averageTicket = paidSales.length > 0 ? totalSpent / paidSales.length : 0;

    // Total gasto em produtos
    const totalSpentOnProducts = paidSales.reduce((sum, sale) => {
        if (!sale.items) return sum;
        const productTotal = sale.items
            .filter((item: SaleItem) => item.itemType === 'product')
            .reduce((itemSum: number, item: SaleItem) => itemSum + item.totalPrice, 0);
        return sum + productTotal;
    }, 0);

    // Última visita
    const sortedCompletedAppointments = completedAppointments
        .sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.startTime}`);
            const dateB = new Date(`${b.date}T${b.startTime}`);
            return dateB.getTime() - dateA.getTime();
        });

    const lastVisit = sortedCompletedAppointments[0]?.date;

    // Frequência média (dias entre visitas)
    let averageFrequency = 0;
    if (completedAppointments.length >= 2) {
        const sortedDates = completedAppointments
            .map(apt => new Date(`${apt.date}T${apt.startTime}`).getTime())
            .sort((a, b) => a - b);

        const intervals: number[] = [];
        for (let i = 1; i < sortedDates.length; i++) {
            const daysDiff = (sortedDates[i] - sortedDates[i - 1]) / (1000 * 60 * 60 * 24);
            intervals.push(daysDiff);
        }

        averageFrequency = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    }

    // Cliente desde (data de cadastro)
    const customerSince = client.createdAt;

    // Próximo agendamento
    const now = new Date();
    const futureAppointments = allAppointments
        .filter(apt => {
            const aptDate = new Date(`${apt.date}T${apt.startTime}`);
            return aptDate > now && (apt.status === 'PENDING' || apt.status === 'CONFIRMED');
        })
        .sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.startTime}`);
            const dateB = new Date(`${b.date}T${b.startTime}`);
            return dateA.getTime() - dateB.getTime();
        });

    const nextAppointment = futureAppointments[0] ? {
        date: futureAppointments[0].date,
        time: futureAppointments[0].startTime
    } : undefined;

    // Calcular alertas
    const alerts: CustomerAlert[] = [];

    // Alerta: Cliente inativo (sem visita há 30+ dias)
    if (lastVisit) {
        const daysSinceLastVisit = Math.floor((new Date().getTime() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceLastVisit >= 30) {
            alerts.push({
                type: 'inactive',
                severity: 'warning',
                message: `Cliente inativo há ${daysSinceLastVisit} dias. Considere entrar em contato.`
            });
        }
    }

    // Alerta: Aniversário próximo (7 dias)
    if (client.birthDate) {
        const today = new Date();
        const birthDate = new Date(client.birthDate);
        const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        
        // Se já passou este ano, considerar ano que vem
        if (thisYearBirthday < today) {
            thisYearBirthday.setFullYear(today.getFullYear() + 1);
        }
        
        const daysUntilBirthday = Math.floor((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilBirthday === 0) {
            alerts.push({
                type: 'birthday',
                severity: 'info',
                message: '🎉 Aniversário hoje! Envie uma mensagem especial.'
            });
        } else if (daysUntilBirthday > 0 && daysUntilBirthday <= 7) {
            alerts.push({
                type: 'birthday',
                severity: 'info',
                message: `🎂 Aniversário em ${daysUntilBirthday} ${daysUntilBirthday === 1 ? 'dia' : 'dias'}. Prepare uma surpresa!`
            });
        }
    }

    // Alerta: Saldo de crédito negativo
    if (client.creditBalance < 0) {
        alerts.push({
            type: 'negative_credit',
            severity: 'error',
            message: `Saldo de crédito negativo: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(client.creditBalance)}`
        });
    }

    // Calcular dados para gráficos
    
    // 1. Gastos por mês (últimos 6 meses)
    const spendingByMonthMap = new Map<string, number>();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    paidSales.forEach(sale => {
        const saleDate = new Date(sale.createdAt);
        if (saleDate >= sixMonthsAgo) {
            const monthKey = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}`;
            spendingByMonthMap.set(monthKey, (spendingByMonthMap.get(monthKey) || 0) + sale.total);
        }
    });

    const spendingByMonth: SpendingByMonth[] = Array.from(spendingByMonthMap.entries())
        .map(([month, total]) => ({ month, total }))
        .sort((a, b) => a.month.localeCompare(b.month));

    // 2. Top 5 serviços mais consumidos
    const serviceStatsMap = new Map<string, { count: number; totalValue: number }>();

    for (const sale of paidSales) {
        if (!sale.items) continue;
        
        const serviceItemsInSale = sale.items.filter((item: SaleItem) => item.itemType === 'service');
        
        for (const item of serviceItemsInSale) {
            const serviceName = item.name;
            const current = serviceStatsMap.get(serviceName) || { count: 0, totalValue: 0 };
            serviceStatsMap.set(serviceName, {
                count: current.count + 1,
                totalValue: current.totalValue + item.totalPrice
            });
        }
    }

    const topServices: ServiceStats[] = Array.from(serviceStatsMap.entries())
        .map(([name, stats]) => ({ name, count: stats.count, totalValue: stats.totalValue }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    // 3. Top 5 produtos mais comprados
    const productStatsMap = new Map<string, { quantity: number; totalValue: number }>();

    for (const sale of paidSales) {
        if (!sale.items) continue;
        
        const productItemsInSale = sale.items.filter((item: SaleItem) => item.itemType === 'product');
        
        for (const item of productItemsInSale) {
            const productName = item.name;
            const current = productStatsMap.get(productName) || { quantity: 0, totalValue: 0 };
            productStatsMap.set(productName, {
                quantity: current.quantity + item.qty,
                totalValue: current.totalValue + item.totalPrice
            });
        }
    }

    const topProducts: ProductStats[] = Array.from(productStatsMap.entries())
        .map(([name, stats]) => ({ name, quantity: stats.quantity, totalValue: stats.totalValue }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

    return {
        lastServices,
        metrics: {
            totalVisits,
            totalCancellations,
            averageTicket,
            totalSpent,
            totalSpentOnProducts,
            averageFrequency,
            customerSince,
            lastVisit,
            nextAppointment
        },
        alerts,
        charts: {
            spendingByMonth,
            topServices,
            topProducts
        }
    };
}
