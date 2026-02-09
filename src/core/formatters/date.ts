
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { ptBR } from "date-fns/locale";

const DEFAULT_TIMEZONE = "America/Sao_Paulo";

export const formatDate = (date: string | Date | null | undefined, timeZone: string = DEFAULT_TIMEZONE): string => {
    if (!date) return "--/--/----";

    // Check if it's a birthDate YYYY-MM-DD string (no time)
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        // Parse manually to avoid timezone shifts
        const [year, month, day] = date.split('-');
        return `${day}/${month}/${year}`;
    }

    try {
        const d = typeof date === "string" ? new Date(date) : date;
        const zonedDate = toZonedTime(d, timeZone);
        return format(zonedDate, "dd/MM/yyyy", { locale: ptBR });
    } catch {
        return "--/--/----";
    }
};

export const formatDateTime = (date: string | Date | null | undefined, timeZone: string = DEFAULT_TIMEZONE): string => {
    if (!date) return "--/--/---- --:--";
    try {
        const d = typeof date === "string" ? new Date(date) : date;
        const zonedDate = toZonedTime(d, timeZone);
        return format(zonedDate, "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch {
        return "--/--/---- --:--";
    }
};

export const formatTime = (date: string | Date | null | undefined, timeZone: string = DEFAULT_TIMEZONE): string => {
    if (!date) return "--:--";
    try {
        const d = typeof date === "string" ? new Date(date) : date;
        const zonedDate = toZonedTime(d, timeZone);
        return format(zonedDate, "HH:mm", { locale: ptBR });
    } catch {
        return "--:--";
    }
};
