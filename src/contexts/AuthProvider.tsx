'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

export interface Profile {
    id: string
    tenant_id: string
    full_name: string | null
    role: 'owner' | 'admin' | 'staff' | 'developer'
    created_at: string
    updated_at: string
}

interface AuthContextType {
    user: User | null
    session: Session | null
    profile: Profile | null
    tenantId: string | null
    role: string | null
    loading: boolean
    signOut: () => Promise<void>
    refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    profile: null,
    tenantId: null,
    role: null,
    loading: true,
    signOut: async () => { },
    refreshProfile: async () => { },
})

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)

    const supabase = useMemo(() => createClient(), [])

    const fetchProfile = useCallback(async (userId: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (error) {
            console.error('Error fetching profile:', error)
            return null
        }
        return data as Profile
    }, [supabase])

    const refreshProfile = useCallback(async () => {
        if (user?.id) {
            const profileData = await fetchProfile(user.id)
            setProfile(profileData)
        }
    }, [user?.id, fetchProfile])

    const signOut = useCallback(async () => {
        await supabase.auth.signOut()
        setUser(null)
        setSession(null)
        setProfile(null)
        window.location.href = '/login'
    }, [supabase])

    useEffect(() => {
        // Get initial session
        const initAuth = async () => {
            try {
                const { data: { session: currentSession } } = await supabase.auth.getSession()

                if (currentSession?.user) {
                    setSession(currentSession)
                    setUser(currentSession.user)
                    const profileData = await fetchProfile(currentSession.user.id)
                    setProfile(profileData)
                }
            } catch (error) {
                console.error('Error initializing auth:', error)
            } finally {
                setLoading(false)
            }
        }

        initAuth()

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, newSession) => {
                setSession(newSession)
                setUser(newSession?.user ?? null)

                if (newSession?.user) {
                    const profileData = await fetchProfile(newSession.user.id)
                    setProfile(profileData)
                } else {
                    setProfile(null)
                }

                if (event === 'SIGNED_OUT') {
                    setProfile(null)
                }
            }
        )

        return () => {
            subscription.unsubscribe()
        }
    }, [supabase, fetchProfile])

    const value = useMemo(() => ({
        user,
        session,
        profile,
        tenantId: profile?.tenant_id ?? null,
        role: profile?.role ?? null,
        loading,
        signOut,
        refreshProfile,
    }), [user, session, profile, loading, signOut, refreshProfile])

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
