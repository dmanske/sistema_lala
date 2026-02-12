'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, FileText, Table, Loader2 } from 'lucide-react'
import { CashMovement } from '@/core/domain/CashMovement'
import { toast } from 'sonner'

interface ExportButtonProps {
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
    accountNames: Record<string, string>
    period: {
        start: Date
        end: Date
    }
}

export function ExportButton({ movements, summary, accountSummary, accountNames, period }: ExportButtonProps) {
    const [loading, setLoading] = useState(false)
    const [exportType, setExportType] = useState<'pdf' | 'csv' | null>(null)

    const handleExportPDF = async () => {
        try {
            setLoading(true)
            setExportType('pdf')

            // Dynamic import to reduce bundle size
            const { exportToPDF } = await import('@/lib/cash/exportToPDF')
            
            await exportToPDF({
                movements,
                summary,
                accountSummary,
                period
            })

            toast.success('PDF exportado com sucesso!')
        } catch (error) {
            console.error('Error exporting PDF:', error)
            toast.error('Erro ao exportar PDF')
        } finally {
            setLoading(false)
            setExportType(null)
        }
    }

    const handleExportCSV = async () => {
        try {
            setLoading(true)
            setExportType('csv')

            // Dynamic import to reduce bundle size
            const { exportToCSV } = await import('@/lib/cash/exportToCSV')
            
            exportToCSV({
                movements,
                accountNames
            })

            toast.success('CSV exportado com sucesso!')
        } catch (error) {
            console.error('Error exporting CSV:', error)
            toast.error('Erro ao exportar CSV')
        } finally {
            setLoading(false)
            setExportType(null)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={loading || movements.length === 0}>
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Exportando...
                        </>
                    ) : (
                        <>
                            <Download className="h-4 w-4 mr-2" />
                            Exportar
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportPDF} disabled={loading}>
                    <FileText className="h-4 w-4 mr-2" />
                    Exportar como PDF
                    {exportType === 'pdf' && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportCSV} disabled={loading}>
                    <Table className="h-4 w-4 mr-2" />
                    Exportar como CSV
                    {exportType === 'csv' && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
