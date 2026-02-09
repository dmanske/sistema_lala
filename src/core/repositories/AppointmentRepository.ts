import { Appointment, CreateAppointmentInput } from "../domain/Appointment";

export interface AppointmentFilter {
    date?: string; // YYYY-MM-DD
    startDate?: string;
    endDate?: string;
    clientId?: string;
    professionalId?: string;
    status?: string;
}

export interface AppointmentRepository {
    getAll(filter?: AppointmentFilter): Promise<Appointment[]>;
    getById(id: string): Promise<Appointment | null>;
    create(data: Appointment): Promise<Appointment>;
    update(id: string, data: Partial<Appointment>): Promise<Appointment>;
    delete(id: string): Promise<void>;
}
