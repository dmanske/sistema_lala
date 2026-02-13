'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signup } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Scissors, Loader2, Mail, Lock, User, Store } from 'lucide-react'

export default function SignupPage() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const result = await signup(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        }
        // If no error, server action will redirect
    }

    return (
        <div className="w-full max-w-md mx-auto px-4">
            {/* Card */}
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 p-8 space-y-6">
                {/* Logo/Brand */}
                <div className="text-center space-y-2">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/25">
                        <Scissors className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Criar Conta</h1>
                    <p className="text-sm text-gray-500">Configure seu salão em poucos minutos</p>
                </div>

                {/* Error message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                        {error}
                    </div>
                )}

                {/* Deactivated Message */}
                <div className="text-center space-y-4 py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Cadastros Suspensos</h2>
                    <p className="text-sm text-gray-500">
                        O sistema Lala não está aceitando novos registros no momento.
                        Se você deseja testar a plataforma, use as credenciais de demonstração na página de login.
                    </p>

                    <div className="pt-6">
                        <Link href="/login">
                            <Button variant="outline" className="rounded-full px-8">
                                Voltar para Login
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
