
import { Sale, SaleItem } from "@/core/domain/sales/types";
import { SaleRepository } from "@/core/repositories/SaleRepository";
import { AppointmentRepository } from "@/core/repositories/AppointmentRepository";
import { ServiceRepository } from "@/core/repositories/ServiceRepository";

export class CreateSale {
    constructor(
        private saleRepo: SaleRepository,
        private appointmentRepo: AppointmentRepository,
        private serviceRepo: ServiceRepository
    ) { }

    async execute(input: {
        tenantId: string;
        appointmentId?: string;
        customerId?: string;
        createdBy: string;
    }): Promise<Sale> {
        let items: SaleItem[] = [];
        let subtotal = 0;
        let customerId = input.customerId;

        // If from appointment, check existence first
        // If create request comes for an appointment that already has a sale, return it
        if (input.appointmentId) {
            const existing = await this.saleRepo.findByAppointmentId(input.appointmentId);
            if (existing) {
                console.log('🔍 Found existing sale:', { 
                    saleId: existing.id, 
                    itemsCount: existing.items?.length || 0,
                    items: existing.items,
                    itemsDetails: existing.items?.map(i => ({
                        id: i.id,
                        name: i.name,
                        type: i.itemType,
                        serviceId: i.serviceId,
                        productId: i.productId
                    }))
                });

                // Check if sale has service items
                const hasServices = existing.items?.some(item => item.itemType === 'service');
                
                if (!hasServices) {
                    console.log('⚠️ Existing sale has NO services! Will add them now...');
                    
                    // Load appointment to get services
                    const appointment = await this.appointmentRepo.getById(input.appointmentId);
                    if (appointment && appointment.services && appointment.services.length > 0) {
                        console.log('📅 Loading services from appointment:', appointment.services);
                        
                        // Add services to existing items
                        const serviceItems: SaleItem[] = [];
                        for (const sId of appointment.services) {
                            // Check if service already exists in items (avoid duplicates)
                            const alreadyExists = existing.items?.some(item => 
                                item.itemType === 'service' && item.serviceId === sId
                            );
                            
                            if (alreadyExists) {
                                console.log('⏭️ Service already in sale, skipping:', sId);
                                continue;
                            }
                            
                            const service = await this.serviceRepo.getById(sId);
                            console.log('🔍 Service lookup:', { serviceId: sId, found: !!service, service });
                            if (service) {
                                const price = service.price || 0;
                                serviceItems.push({
                                    id: crypto.randomUUID(),
                                    saleId: existing.id,
                                    itemType: 'service',
                                    name: service.name,
                                    serviceId: service.id,
                                    qty: 1,
                                    unitPrice: price,
                                    totalPrice: price
                                });
                            }
                        }
                        
                        if (serviceItems.length > 0) {
                            console.log('✅ Adding services to existing sale:', serviceItems);
                            // Merge with existing items (products)
                            const allItems = [...(existing.items || []), ...serviceItems];
                            const newSubtotal = allItems.reduce((acc, item) => acc + (item.unitPrice * item.qty), 0);
                            
                            // Update the sale with services
                            await this.saleRepo.update(existing.id, {
                                items: allItems,
                                subtotal: newSubtotal,
                                total: newSubtotal - (existing.discount || 0)
                            });
                            
                            // Fetch updated sale
                            const updated = await this.saleRepo.findById(existing.id);
                            if (updated) {
                                console.log('✅ Sale updated with services!', { itemsCount: updated.items?.length });
                                return updated;
                            }
                        } else {
                            console.log('ℹ️ No new services to add (all already exist)');
                        }
                    }
                }
                
                // Sanitize items from localStorage (may have undefined numeric fields from older schema)
                if (existing.items) {
                    existing.items = existing.items.map((item: SaleItem) => ({
                        ...item,
                        unitPrice: item.unitPrice ?? 0,
                        qty: item.qty ?? 1,
                        totalPrice: item.totalPrice ?? ((item.unitPrice ?? 0) * (item.qty ?? 1)),
                    }));
                }
                // Recalculate totals
                const subtotal = (existing.items ?? []).reduce((acc: number, item: SaleItem) => acc + (item.unitPrice * item.qty), 0);
                existing.subtotal = subtotal;
                existing.total = subtotal - (existing.discount || 0);
                return existing;
            }

            const appointment = await this.appointmentRepo.getById(input.appointmentId);
            if (!appointment) {
                // If not found, throw error
                throw new Error("Appointment not found");
            }

            console.log('📅 Appointment loaded:', { 
                id: appointment.id, 
                clientId: appointment.clientId,
                professionalId: appointment.professionalId,
                services: appointment.services,
                servicesCount: appointment.services?.length || 0,
                serviceLines: appointment.serviceLines
            });

            customerId = appointment.clientId;

            // Map services to sale items
            if (appointment.services && appointment.services.length > 0) {
                for (const sId of appointment.services) {
                    const service = await this.serviceRepo.getById(sId);
                    console.log('🔍 Service lookup:', { serviceId: sId, found: !!service, service });
                    if (service) {
                        const price = service.price || 0;
                        items.push({
                            id: crypto.randomUUID(),
                            saleId: '', // Filled below
                            itemType: 'service',
                            name: service.name,
                            serviceId: service.id,
                            qty: 1,
                            unitPrice: price,
                            totalPrice: price
                        });
                        subtotal += price;
                    }
                }
                console.log('✅ Services mapped to items:', { itemsCount: items.length, items });
            } else {
                console.log('⚠️ No services found in appointment');
            }
        }

        const saleId = crypto.randomUUID();
        const sale: Sale = {
            id: saleId,
            tenantId: input.tenantId,
            customerId: customerId,
            appointmentId: input.appointmentId,
            status: 'draft',
            subtotal,
            discount: 0,
            total: subtotal,
            createdAt: new Date().toISOString(),
            createdBy: input.createdBy,
            items: items.map(i => ({ ...i, saleId })),
            payments: []
        };

        console.log('💾 Creating sale:', { saleId, itemsCount: sale.items?.length || 0 });
        const created = await this.saleRepo.create(sale);
        console.log('✅ Sale created:', { saleId: created.id, itemsCount: created.items?.length || 0 });
        
        return created;
    }
}
