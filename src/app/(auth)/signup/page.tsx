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

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="salonName" className="text-sm font-medium text-gray-700">
                            Nome do Salão
                        </Label>
                        <div className="relative">
                            <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                id="salonName"
                                name="salonName"
                                type="text"
                                placeholder="Ex: Salão da Lala"
                                required
                                className="pl-10 h-11 bg-white/50 border-gray-200 focus:border-rose-400 focus:ring-rose-400 rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                            Seu Nome
                        </Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                id="fullName"
                                name="fullName"
                                type="text"
                                placeholder="Seu nome completo"
                                required
                                className="pl-10 h-11 bg-white/50 border-gray-200 focus:border-rose-400 focus:ring-rose-400 rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                            Email
                        </Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="seu@email.com"
                                required
                                className="pl-10 h-11 bg-white/50 border-gray-200 focus:border-rose-400 focus:ring-rose-400 rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                            Senha
                        </Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Mínimo 6 caracteres"
                                required
                                minLength={6}
                                className="pl-10 h-11 bg-white/50 border-gray-200 focus:border-rose-400 focus:ring-rose-400 rounded-xl"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-11 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-medium rounded-xl shadow-lg shadow-rose-500/25 transition-all duration-200"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Criando conta...
                            </>
                        ) : (
                            'Criar Conta'
                        )}
                    </Button>
                </form>

                {/* Login link */}
                <div className="text-center text-sm text-gray-500">
                    Já tem uma conta?{' '}
                    <Link
                        href="/login"
                        className="text-rose-600 hover:text-rose-700 font-medium transition-colors"
                    >
                        Entrar
                    </Link>
                </div>
            </div>
        </div>
    )
}
