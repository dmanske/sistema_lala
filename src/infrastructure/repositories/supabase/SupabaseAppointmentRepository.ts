import { createClient } from '@/lib/supabase/client';
import { Appointment } from '@/core/domain/Appointment';
import { AppointmentRepository, AppointmentFilter } from '@/core/repositories/AppointmentRepository';

export class SupabaseAppointmentRepository implements AppointmentRepository {
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

    async getAll(filter?: AppointmentFilter): Promise<Appointment[]> {
        // RLS will automatically filter by tenant_id
        let query = this.supabase
            .from('appointments')
            .select(`
                *,
                appointment_services (
                    id, appointment_id, service_id, price_snapshot, duration_snapshot, price_override, qty
                )
            `)
            .order('date', { ascending: true })
            .order('start_time', { ascending: true });

        if (filter?.date) {
            query = query.eq('date', filter.date);
        }
        if (filter?.startDate) {
            query = query.gte('date', filter.startDate);
        }
        if (filter?.endDate) {
            query = query.lte('date', filter.endDate);
        }
        if (filter?.clientId) {
            query = query.eq('client_id', filter.clientId);
        }
        if (filter?.professionalId) {
            query = query.eq('professional_id', filter.professionalId);
        }
        if (filter?.status) {
            query = query.eq('status', filter.status);
        }

        const { data, error } = await query;
        if (error) throw new Error(`Failed to fetch appointments: ${error.message}`);
        return (data || []).map(this.mapFromDb);
    }

    async getById(id: string): Promise<Appointment | null> {
        const { data, error } = await this.supabase
            .from('appointments')
            .select(`
                *,
                appointment_services (
                    id, appointment_id, service_id, price_snapshot, duration_snapshot, price_override, qty
                )
            `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(`Failed to fetch appointment: ${error.message}`);
        }
        return data ? this.mapFromDb(data) : null;
    }

    async create(data: Appointment): Promise<Appointment> {
        const tenantId = await this.getTenantId();

        // Insert appointment
        const { data: inserted, error } = await this.supabase
            .from('appointments')
            .insert({
                id: data.id || undefined,
                tenant_id: tenantId,
                client_id: data.clientId || null,
                professional_id: data.professionalId,
                date: data.date,
                start_time: data.startTime,
                duration_minutes: data.durationMinutes,
                status: data.status,
                notes: data.notes || null,
                finalized_at: data.finalizedAt || null,
                finalized_services: data.finalizedServices || null,
                used_products: data.usedProducts || null,
                total_service_value: data.totalServiceValue || null,
                total_product_value: data.totalProductValue || null,
                total_value: data.totalValue || null,
            })
            .select()
            .single();

        if (error) throw new Error(`Failed to create appointment: ${error.message}`);

        // Insert appointment_services if we have service IDs
        if (data.services && data.services.length > 0) {
            const serviceEntries = data.serviceLines
                ? data.serviceLines.map(sl => ({
                    appointment_id: inserted.id,
                    service_id: sl.serviceId,
                    price_snapshot: sl.priceSnapshot,
                    duration_snapshot: sl.durationSnapshot,
                    price_override: sl.priceOverride || null,
                    qty: sl.qty,
                }))
                : data.services.map(serviceId => ({
                    appointment_id: inserted.id,
                    service_id: serviceId,
                    price_snapshot: 0,
                    duration_snapshot: null,
                    price_override: null,
                    qty: 1,
                }));

            const { error: servicesError } = await this.supabase
                .from('appointment_services')
                .insert(serviceEntries);

            if (servicesError) {
                // Non-fatal: appointment was created
            }
        }

        return this.mapFromDb({ ...inserted, appointment_services: [] });
    }

    async update(id: string, data: Partial<Appointment>): Promise<Appointment> {
        const updateData: Record<string, unknown> = {};
        if (data.clientId !== undefined) updateData.client_id = data.clientId || null;
        if (data.professionalId !== undefined) updateData.professional_id = data.professionalId;
        if (data.date !== undefined) updateData.date = data.date;
        if (data.startTime !== undefined) updateData.start_time = data.startTime;
        if (data.durationMinutes !== undefined) updateData.duration_minutes = data.durationMinutes;
        if (data.status !== undefined) updateData.status = data.status;
        if (data.notes !== undefined) updateData.notes = data.notes || null;
        if (data.finalizedAt !== undefined) updateData.finalized_at = data.finalizedAt;
        if (data.finalizedServices !== undefined) updateData.finalized_services = data.finalizedServices;
        if (data.usedProducts !== undefined) updateData.used_products = data.usedProducts;
        if (data.totalServiceValue !== undefined) updateData.total_service_value = data.totalServiceValue;
        if (data.totalProductValue !== undefined) updateData.total_product_value = data.totalProductValue;
        if (data.totalValue !== undefined) updateData.total_value = data.totalValue;

        const { data: updated, error } = await this.supabase
            .from('appointments')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(`Failed to update appointment: ${error.message}`);

        // Update services if provided
        if (data.services || data.serviceLines) {
            // Delete existing services
            await this.supabase
                .from('appointment_services')
                .delete()
                .eq('appointment_id', id);

            // Re-insert
            if (data.serviceLines && data.serviceLines.length > 0) {
                await this.supabase
                    .from('appointment_services')
                    .insert(data.serviceLines.map(sl => ({
                        appointment_id: id,
                        service_id: sl.serviceId,
                        price_snapshot: sl.priceSnapshot,
                        duration_snapshot: sl.durationSnapshot,
                        price_override: sl.priceOverride || null,
                        qty: sl.qty,
                    })));
            } else if (data.services && data.services.length > 0) {
                await this.supabase
                    .from('appointment_services')
                    .insert(data.services.map(serviceId => ({
                        appointment_id: id,
                        service_id: serviceId,
                        price_snapshot: 0,
                        qty: 1,
                    })));
            }
        }

        return this.mapFromDb({ ...updated, appointment_services: [] });
    }

    async delete(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('appointments')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Failed to delete appointment: ${error.message}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private mapFromDb(row: any): Appointment {
        const appointmentServices = row.appointment_services || [];
        const services = appointmentServices.map((as: Record<string, unknown>) => as.service_id as string);
        const serviceLines = appointmentServices.map((as: Record<string, unknown>) => ({
            id: as.id as string,
            serviceId: as.service_id as string,
            qty: Number(as.qty) || 1,
            priceSnapshot: Number(as.price_snapshot) || 0,
            durationSnapshot: Number(as.duration_snapshot) || 0,
            priceOverride: as.price_override ? Number(as.price_override) : undefined,
        }));

        return {
            id: row.id,
            clientId: row.client_id || undefined,
            professionalId: row.professional_id,
            services,
            date: row.date,
            startTime: row.start_time ? row.start_time.substring(0, 5) : '', // HH:mm from TIME
            durationMinutes: Number(row.duration_minutes),
            status: row.status,
            notes: row.notes || undefined,
            serviceLines: serviceLines.length > 0 ? serviceLines : undefined,
            finalizedAt: row.finalized_at || undefined,
            finalizedServices: row.finalized_services || undefined,
            usedProducts: row.used_products || undefined,
            totalServiceValue: row.total_service_value ? Number(row.total_service_value) : undefined,
            totalProductValue: row.total_product_value ? Number(row.total_product_value) : undefined,
            totalValue: row.total_value ? Number(row.total_value) : undefined,
        };
    }
}
