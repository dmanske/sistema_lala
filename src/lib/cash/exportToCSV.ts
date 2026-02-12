import Papa from 'papaparse'
import { CashMovement } from '@/core/domain/CashMovement'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ExportCSVOptions {
    movements: CashMovement[]
    accountNames: Record<string, string>
}

const formatCurrency = (value: number): string => {
    // Format for CSV: use comma as decimal separator
    return value.toFixed(2).replace('.', ',')
}

const getMethodLabel = (method: string): string => {
    const labels: Record<string, string> = {
        CASH: 'Dinheiro',
        PIX: 'Pix',
        CARD: 'Cartão',
        TRANSFER: 'Transferência',
        WALLET: 'Carteira'
    }
    return labels[method] || method
}

const getSourceLabel = (source: string): string => {
    const labels: Record<string, string> = {
        SALE: 'Venda',
        REFUND: 'Estorno',
        PURCHASE: 'Compra',
        MANUAL: 'Manual'
    }
    return labels[source] || source
}

export function exportToCSV(options: ExportCSVOptions): void {
    const { movements, accountNames } = options

    // Prepare data
    const data = movements.map(m => ({
        'Data': format(m.occurredAt, 'dd/MM/yyyy', { locale: ptBR }),
        'Hora': format(m.occurredAt, 'HH:mm', { locale: ptBR }),
        'Descrição': m.description || '-',
        'Método': getMethodLabel(m.method),
        'Origem': getSourceLabel(m.sourceType),
        'Tipo': m.type === 'IN' ? 'Entrada' : 'Saída',
        'Valor': formatCurrency(m.amount),
        'Conta': accountNames[m.bankAccountId] || 'Desconhecida'
    }))

    // Convert to CSV with semicolon delimiter (Brazilian standard)
    const csv = Papa.unparse(data, {
        delimiter: ';',
        header: true,
        quotes: true
    })

    // Create blob and download
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }) // BOM for Excel
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    const fileName = `movimentacoes_${format(new Date(), 'ddMMyyyy_HHmmss')}.csv`
    
    link.setAttribute('href', url)
    link.setAttribute('download', fileName)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}
