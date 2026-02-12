"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface CheckoutProgressProps {
    currentStep: 'items' | 'payment' | 'completed'
}

export function CheckoutProgress({ currentStep }: CheckoutProgressProps) {
    const steps = [
        { id: 'items', label: 'Itens', number: 1 },
        { id: 'payment', label: 'Pagamento', number: 2 },
        { id: 'completed', label: 'Concluído', number: 3 }
    ]

    const getCurrentStepIndex = () => {
        return steps.findIndex(s => s.id === currentStep)
    }

    const currentIndex = getCurrentStepIndex()

    return (
        <div className="w-full py-4">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
                {steps.map((step, index) => {
                    const isCompleted = index < currentIndex
                    const isCurrent = index === currentIndex
                    const isLast = index === steps.length - 1

                    return (
                        <div key={step.id} className="flex items-center flex-1">
                            {/* Step Circle */}
                            <div className="flex flex-col items-center">
                                <div
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all",
                                        isCompleted && "bg-green-500 text-white",
                                        isCurrent && "bg-purple-600 text-white ring-4 ring-purple-100",
                                        !isCompleted && !isCurrent && "bg-gray-200 text-gray-500"
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className="h-5 w-5" />
                                    ) : (
                                        step.number
                                    )}
                                </div>
                                <span
                                    className={cn(
                                        "mt-2 text-xs font-medium",
                                        isCurrent && "text-purple-600",
                                        isCompleted && "text-green-600",
                                        !isCompleted && !isCurrent && "text-gray-500"
                                    )}
                                >
                                    {step.label}
                                </span>
                            </div>

                            {/* Connector Line */}
                            {!isLast && (
                                <div className="flex-1 h-1 mx-2 -mt-6">
                                    <div
                                        className={cn(
                                            "h-full rounded transition-all",
                                            isCompleted ? "bg-green-500" : "bg-gray-200"
                                        )}
                                    />
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
