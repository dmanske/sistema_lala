import { Appointment } from "@/core/domain/Appointment";
import { AppointmentRepository, AppointmentFilter } from "@/core/repositories/AppointmentRepository";

const STORAGE_KEY = 'salon_appointments';

export class LocalStorageAppointmentRepository implements AppointmentRepository {
    private getStorage(): Appointment[] {
        if (typeof window === 'undefined') return [];
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    private saveStorage(appointments: Appointment[]): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
    }

    async getAll(filter?: AppointmentFilter): Promise<Appointment[]> {
        let appointments = this.getStorage();

        if (filter) {
            if (filter.date) {
                appointments = appointments.filter(a => a.date === filter.date);
            }
            if (filter.startDate && filter.endDate) {
                appointments = appointments.filter(a => a.date >= filter.startDate! && a.date <= filter.endDate!);
            }
            if (filter.clientId) {
                appointments = appointments.filter(a => a.clientId === filter.clientId);
            }
            if (filter.professionalId) {
                appointments = appointments.filter(a => a.professionalId === filter.professionalId);
            }
            if (filter.status && filter.status !== 'ALL') {
                appointments = appointments.filter(a => a.status === filter.status);
            }
        }

        // Sort by date and startTime
        return appointments.sort((a, b) => {
            const dateCompare = a.date.localeCompare(b.date);
            if (dateCompare !== 0) return dateCompare;
            return a.startTime.localeCompare(b.startTime);
        });
    }

    async getById(id: string): Promise<Appointment | null> {
        const appointments = this.getStorage();
        return appointments.find(a => a.id === id) || null;
    }

    async create(appointment: Appointment): Promise<Appointment> {
        const appointments = this.getStorage();
        appointments.push(appointment);
        this.saveStorage(appointments);
        return appointment;
    }

    async update(id: string, data: Partial<Appointment>): Promise<Appointment> {
        const appointments = this.getStorage();
        const index = appointments.findIndex(a => a.id === id);
        if (index === -1) throw new Error("Appointment not found");

        const updated = { ...appointments[index], ...data };
        appointments[index] = updated;
        this.saveStorage(appointments);
        return updated;
    }

    async delete(id: string): Promise<void> {
        const appointments = this.getStorage();
        const filtered = appointments.filter(a => a.id !== id);
        this.saveStorage(filtered);
    }
}
