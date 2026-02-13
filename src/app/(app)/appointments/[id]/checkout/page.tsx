
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { CheckoutForm } from "@/components/sales/CheckoutForm"
import { CheckoutProgress } from "@/components/sales/CheckoutProgress"
import { CreateSale } from "@/core/usecases/sales/CreateSale"
import { getSaleRepository, getAppointmentRepository, getServiceRepository } from "@/infrastructure/repositories/factory"
import { toast } from "sonner"
import { Sale } from "@/core/domain/sales/types"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronRight, Home } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

// Initialize repositories
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
    const [checkoutStep, setCheckoutStep] = useState<'items' | 'payment' | 'completed'>('items')
    const [showCelebration, setShowCelebration] = useState(false)
    const [initializing, setInitializing] = useState(true)

    useEffect(() => {
        const initSale = async () => {
            try {
                // First, check if the ID is actually a sale ID instead of appointment ID
                const supabase = createClient()
                
                // Try to find if this ID is a sale ID
                const { data: saleCheck } = await supabase
                    .from('sales')
                    .select('id, appointment_id')
                    .eq('id', appointmentId)
                    .single()
                
                let actualAppointmentId = appointmentId
                
                // If we found a sale with this ID, redirect to the correct appointment
                if (saleCheck && saleCheck.appointment_id) {
                    console.log('Detected sale ID instead of appointment ID, redirecting...')
                    actualAppointmentId = saleCheck.appointment_id
                    // Redirect to correct URL
                    router.replace(`/appointments/${actualAppointmentId}/checkout`)
                    return
                }
                
                // Creates or gets existing sale for this appointment
                const sale = await createSale.execute({
                    tenantId: 'default-tenant', // Using default
                    appointmentId: actualAppointmentId,
                    createdBy: 'system'
                })
                
                console.log('Sale loaded:', { id: sale.id, status: sale.status, payments: sale.payments })
                
                setSaleId(sale.id)
                
                // Se a venda já está paga, ir direto para o passo 3
                if (sale.status === 'paid') {
                    console.log('Sale is paid, going to completed step')
                    setCheckoutStep('completed')
                } else {
                    console.log('Sale is not paid, status:', sale.status)
                }
            } catch (error) {
                toast.error("Erro ao iniciar caixa")
                console.error(error)
            } finally {
                setLoading(false)
                setInitializing(false)
            }
        }

        if (appointmentId) {
            initSale()
        }
    }, [appointmentId])

    if (loading || initializing) return <div className="p-8 text-center text-muted-foreground">Iniciando checkout...</div>
    if (!saleId) return <div className="p-8 text-center text-destructive">Erro ao carregar venda.</div>

    return (
        <div className="container mx-auto py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/agenda" className="hover:text-foreground transition-colors flex items-center gap-1">
                    <Home className="h-4 w-4" />
                    Agenda
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-medium">Checkout</span>
            </nav>

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.push('/agenda')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Agenda
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Finalizar Atendimento</h1>
            </div>

            {/* Progress Indicator */}
            <CheckoutProgress currentStep={checkoutStep} />

            <CheckoutForm
                saleId={saleId}
                onPaymentStart={() => setCheckoutStep('payment')}
                onSuccess={() => {
                    setCheckoutStep('completed')
                    setShowCelebration(true)
                    toast.success("Atendimento finalizado com sucesso!", {
                        duration: 3000,
                    })
                    // Fechar animação após 3 segundos, mas permanecer no passo 3
                    setTimeout(() => setShowCelebration(false), 3000)
                }}
            />

            {/* Celebration Overlay */}
            {showCelebration && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center space-y-6 animate-in zoom-in-95 duration-500">
                        <div className="relative">
                            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-in zoom-in duration-700">
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-32 h-32 bg-green-400/20 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold text-gray-900">Pagamento Concluído!</h2>
                            <p className="text-gray-600">O atendimento foi finalizado com sucesso.</p>
                        </div>

                        <div className="pt-4">
                            <Button 
                                onClick={() => router.push('/agenda')}
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                            >
                                Voltar para Agenda
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
