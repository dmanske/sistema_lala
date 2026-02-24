import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null
let lastActivity: number = Date.now()
const CONNECTION_TIMEOUT = 2 * 60 * 1000 // 2 minutos de inatividade

export function createClient() {
    const now = Date.now()
    const timeSinceLastActivity = now - lastActivity
    
    // Se passou mais de 2 minutos desde última atividade, recriar conexão
    if (client && timeSinceLastActivity > CONNECTION_TIMEOUT) {
        console.log('[SUPABASE] 🔄 Conexão expirada após', (timeSinceLastActivity / 1000).toFixed(0), 'segundos. Recriando...')
        client = null
    }
    
    // Singleton: reutilizar mesma instância se ainda válida
    if (client) {
        lastActivity = now
        return client
    }

    console.log('[SUPABASE] 🆕 Criando nova conexão...')
    client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true
            },
            global: {
                fetch: (url, options = {}) => {
                    // Atualizar timestamp de última atividade
                    lastActivity = Date.now()
                    
                    // Timeout de 30 segundos
                    const controller = new AbortController()
                    const timeoutId = setTimeout(() => controller.abort(), 30000)
                    
                    return fetch(url, {
                        ...options,
                        signal: controller.signal
                    }).finally(() => clearTimeout(timeoutId))
                }
            }
        }
    )
    
    lastActivity = now
    return client
}

// Função helper para forçar reset da conexão (útil para debugging)
export function resetConnection() {
    console.log('[SUPABASE] 🔄 Forçando reset da conexão...')
    client = null
    lastActivity = 0
}

