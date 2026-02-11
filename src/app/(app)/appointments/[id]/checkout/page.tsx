
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { CheckoutForm } from "@/components/sales/CheckoutForm"
import { CreateSale } from "@/core/usecases/sales/CreateSale"
import { getSaleRepository, getAppointmentRepository, getServiceRepository } from "@/infrastructure/repositories/factory"
import { toast } from "sonner"
import { Sale } from "@/core/domain/sales/types"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

// Initialize
const saleRepo = getSaleRepository()
const apptRepo = getAppointmentRepository()
const serviceRepo = getServiceRepository()
const createSale = new CreateSale(saleRepo, apptRepo, serviceRepo)

export default function AppointmentCheckoutPage() {
    const params = useParams()
    const router = useRouter()
    const appointmentId = params.id as string
    const [saleId, setSaleId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const initSale = async () => {
            try {
                // Creates or gets existing sale for this appointment
                const sale = await createSale.execute({
                    tenantId: 'default-tenant', // Using default
                    appointmentId: appointmentId,
                    createdBy: 'system'
                })
                setSaleId(sale.id)
            } catch (error) {
                toast.error("Erro ao iniciar caixa")
                console.error(error)
            } finally {
                setLoading(false)
            }
        }

        if (appointmentId) {
            initSale()
        }
    }, [appointmentId])

    if (loading) return <div className="p-8 text-center text-muted-foreground">Iniciando checkout...</div>
    if (!saleId) return <div className="p-8 text-center text-destructive">Erro ao carregar venda.</div>

    return (
        <div className="container mx-auto py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Finalizar Atendimento</h1>
            </div>

            <CheckoutForm
                saleId={saleId}
                onSuccess={() => {
                    toast.success("Atendimento finalizado com sucesso!")
                    setTimeout(() => router.push('/agenda'), 2000)
                }}
            />
        </div>
    )
}
