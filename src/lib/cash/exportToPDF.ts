import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { CashMovement } from '@/core/domain/CashMovement'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ExportPDFOptions {
    movements: CashMovement[]
    summary: {
        totalIn: number
        totalOut: number
        balance: number
    }
    accountSummary?: Array<{
        accountName: string
        totalIn: number
        totalOut: number
        balance: number
    }>
    period: {
        start: Date
        end: Date
    }
}

const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
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

export async function exportToPDF(options: ExportPDFOptions): Promise<void> {
    const { movements, summary, accountSummary, period } = options

    const doc = new jsPDF()
    let yPosition = 20

    // Header
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Relatório de Movimentações', 105, yPosition, { align: 'center' })
    yPosition += 10

    // Period
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    const periodText = `Período: ${format(period.start, 'dd/MM/yyyy', { locale: ptBR })} - ${format(period.end, 'dd/MM/yyyy', { locale: ptBR })}`
    doc.text(periodText, 105, yPosition, { align: 'center' })
    yPosition += 15

    // Summary Section
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Resumo Geral', 14, yPosition)
    yPosition += 8

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    
    const summaryData = [
        ['Total de Entradas', formatCurrency(summary.totalIn)],
        ['Total de Saídas', formatCurrency(summary.totalOut)],
        ['Saldo', formatCurrency(summary.balance)]
    ]

    autoTable(doc, {
        startY: yPosition,
        head: [],
        body: summaryData,
        theme: 'grid',
        styles: { fontSize: 10 },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 100 },
            1: { halign: 'right', cellWidth: 80 }
        },
        margin: { left: 14 }
    })

    yPosition = (doc as any).lastAutoTable.finalY + 10

    // Account Summary (if provided)
    if (accountSummary && accountSummary.length > 0) {
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Resumo por Conta', 14, yPosition)
        yPosition += 8

        const accountData = accountSummary.map(acc => [
            acc.accountName,
            formatCurrency(acc.totalIn),
            formatCurrency(acc.totalOut),
            formatCurrency(acc.balance)
        ])

        autoTable(doc, {
            startY: yPosition,
            head: [['Conta', 'Entradas', 'Saídas', 'Saldo']],
            body: accountData,
            theme: 'striped',
            styles: { fontSize: 9 },
            headStyles: { fillColor: [147, 51, 234], fontStyle: 'bold' },
            columnStyles: {
                1: { halign: 'right' },
                2: { halign: 'right' },
                3: { halign: 'right' }
            }
        })

        yPosition = (doc as any).lastAutoTable.finalY + 10
    }

    // Check if we need a new page
    if (yPosition > 250) {
        doc.addPage()
        yPosition = 20
    }

    // Movements Table
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Movimentações', 14, yPosition)
    yPosition += 8

    const movementsData = movements.map(m => [
        format(m.occurredAt, 'dd/MM/yyyy', { locale: ptBR }),
        format(m.occurredAt, 'HH:mm', { locale: ptBR }),
        m.description || '-',
        getMethodLabel(m.method),
        getSourceLabel(m.sourceType),
        m.type === 'IN' ? 'Entrada' : 'Saída',
        formatCurrency(m.amount)
    ])

    autoTable(doc, {
        startY: yPosition,
        head: [['Data', 'Hora', 'Descrição', 'Método', 'Origem', 'Tipo', 'Valor']],
        body: movementsData,
        theme: 'striped',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [147, 51, 234], fontStyle: 'bold' },
        columnStyles: {
            0: { cellWidth: 22 },
            1: { cellWidth: 15 },
            2: { cellWidth: 50 },
            3: { cellWidth: 25 },
            4: { cellWidth: 20 },
            5: { cellWidth: 20 },
            6: { halign: 'right', cellWidth: 28 }
        }
    })

    // Footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text(
            `Página ${i} de ${pageCount}`,
            105,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
        )
        doc.text(
            `Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
            105,
            doc.internal.pageSize.height - 5,
            { align: 'center' }
        )
    }

    // Save
    const fileName = `movimentacoes_${format(period.start, 'ddMMyyyy')}_${format(period.end, 'ddMMyyyy')}.pdf`
    doc.save(fileName)
}
