import { getSaleRepository, getServiceRepository, getAppointmentRepository } from "@/infrastructure/repositories/factory";
import { SaleItem } from "@/core/domain/sales/types";

export interface LastService {
    id: string;
    name: string;
    date: string; // ISO string
    value: number;
}

export interface CustomerMetrics {
    totalVisits: number;
    totalCancellations: number;
    averageTicket: number;
    totalSpentOnProducts: number;
    nextAppointment?: {
        date: string;
        time: string;
    };
}

export interface CustomerOverview {
    lastServices: LastService[];
    metrics: CustomerMetrics;
}

export async function getCustomerOverview(customerId: string): Promise<CustomerOverview> {
    const saleRepo = getSaleRepository();
    const serviceRepo = getServiceRepository();
    const appointmentRepo = getAppointmentRepository();

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

    const totalVisits = allAppointments.filter(apt => apt.status === 'DONE').length;
    const totalCancellations = allAppointments.filter(apt =>
        apt.status === 'CANCELED' || apt.status === 'NO_SHOW'
    ).length;

    // Ticket médio: total de vendas pagas / número de vendas
    const totalRevenue = paidSales.reduce((sum, sale) => sum + sale.total, 0);
    const averageTicket = paidSales.length > 0 ? totalRevenue / paidSales.length : 0;

    // Total gasto em produtos
    const totalSpentOnProducts = paidSales.reduce((sum, sale) => {
        if (!sale.items) return sum;
        const productTotal = sale.items
            .filter((item: SaleItem) => item.itemType === 'product')
            .reduce((itemSum: number, item: SaleItem) => itemSum + item.totalPrice, 0);
        return sum + productTotal;
    }, 0);

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

    return {
        lastServices,
        metrics: {
            totalVisits,
            totalCancellations,
            averageTicket,
            totalSpentOnProducts,
            nextAppointment
        }
    };
}
