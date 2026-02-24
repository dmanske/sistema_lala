import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function createClient() {
    // Singleton: reutilizar mesma instância
    if (client) {
        return client
    }

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
                    // Timeout de 30 segundos (mais generoso que 8s)
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
    
    return client
}

