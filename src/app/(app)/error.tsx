'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Erro na aplicação:', error)
    }, [error])

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-8">
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="rounded-full bg-red-100 p-4">
                    <AlertTriangle className="h-10 w-10 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                    Ops! Algo deu errado
                </h2>
                <p className="max-w-md text-gray-600">
                    Ocorreu um erro inesperado. Isso pode ser um problema temporário
                    de conexão. Tente novamente.
                </p>
                {error?.message && (
                    <p className="max-w-md rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
                        {error.message}
                    </p>
                )}
            </div>
            <div className="flex gap-3">
                <Button
                    onClick={reset}
                    variant="default"
                    className="gap-2"
                >
                    <RefreshCw className="h-4 w-4" />
                    Tentar novamente
                </Button>
                <Button
                    onClick={() => window.location.href = '/dashboard'}
                    variant="outline"
                >
                    Ir para o Dashboard
                </Button>
            </div>
        </div>
    )
}
