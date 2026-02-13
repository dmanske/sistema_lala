import { format as dateFnsFormat } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toZonedTime } from 'date-fns-tz'

/**
 * Converte uma data UTC para o horário do Brasil (America/Sao_Paulo)
 * e formata de acordo com o padrão especificado
 */
export function formatBrazilDate(date: Date | string, formatStr: string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const brazilDate = toZonedTime(dateObj, 'America/Sao_Paulo')
    return dateFnsFormat(brazilDate, formatStr, { locale: ptBR })
}

/**
 * Converte uma data UTC para o horário do Brasil (America/Sao_Paulo)
 */
export function toBrazilTime(date: Date | string): Date {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return toZonedTime(dateObj, 'America/Sao_Paulo')
}
