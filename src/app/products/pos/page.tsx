
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckoutForm } from "@/components/sales/CheckoutForm"
import { CreateSale } from "@/core/usecases/sales/CreateSale"
import { LocalStorageSaleRepository } from "@/infrastructure/repositories/sales/LocalStorageSaleRepository"
import { LocalStorageAppointmentRepository } from "@/infrastructure/repositories/LocalStorageAppointmentRepository"
import { LocalStorageServiceRepository } from "@/infrastructure/repositories/LocalStorageServiceRepository"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

// Initialize
const saleRepo = new LocalStorageSaleRepository()
const apptRepo = new LocalStorageAppointmentRepository()
const serviceRepo = new LocalStorageServiceRepository()
const createSale = new CreateSale(saleRepo, apptRepo, serviceRepo)

export default function POSPage() {
    const router = useRouter()
    const [saleId, setSaleId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const initSale = async () => {
            try {
                const sale = await createSale.execute({
                    tenantId: 'default-tenant',
                    createdBy: 'system',
                    // No appointmentId, creates new draft
                })
                setSaleId(sale.id)
            } catch (error) {
                toast.error("Erro ao iniciar ponto de venda")
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        initSale()
    }, [])

    if (loading) return <div className="p-8 text-center text-muted-foreground">Iniciando venda...</div>
    if (!saleId) return <div className="p-8 text-center text-destructive">Erro ao iniciar venda.</div>

    return (
        <div className="container mx-auto py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.push('/products')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Produtos
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Ponto de Venda</h1>
            </div>

            <CheckoutForm
                saleId={saleId}
                onSuccess={() => {
                    toast.success("Venda realizada com sucesso!")
                    setTimeout(() => window.location.reload(), 1500)
                }}
            />
        </div>
    )
}
