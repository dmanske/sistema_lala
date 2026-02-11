'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const salonName = formData.get('salonName') as string
    const fullName = formData.get('fullName') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!salonName || !fullName || !email || !password) {
        return { error: 'Todos os campos são obrigatórios.' }
    }

    if (password.length < 6) {
        return { error: 'A senha deve ter no mínimo 6 caracteres.' }
    }

    // 1. Create Supabase Auth user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
        },
    })

    if (signUpError) {
        if (signUpError.message.includes('already registered')) {
            return { error: 'Este email já está cadastrado.' }
        }
        return { error: 'Erro ao criar conta. Tente novamente.' }
    }

    if (!authData.user) {
        return { error: 'Erro ao criar conta. Tente novamente.' }
    }

    // 2. Create tenant + profile via RPC (atomic operation)
    const { error: rpcError } = await supabase.rpc('signup_create_tenant', {
        p_tenant_name: salonName,
        p_user_name: fullName,
        p_user_id: authData.user.id,
    })

    if (rpcError) {
        console.error('Error creating tenant:', rpcError)
        return { error: 'Erro ao configurar salão. Tente novamente.' }
    }

    revalidatePath('/', 'layout')
    redirect('/agenda')
}
