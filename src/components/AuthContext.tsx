'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase, type User, isUserAllowed, getUserRole } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  isAuthenticated: boolean
  isSuperAdmin: boolean
  isSupabaseConfigured: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if Supabase is properly configured
    const checkSupabaseConfig = () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      return !!(url && key && 
        url !== 'https://your-project-id.supabase.co' && 
        key !== 'your_supabase_anon_key_here')
    }

    const configured = checkSupabaseConfig()
    setIsSupabaseConfigured(configured)

    // Development bypass for localhost
    if (!configured || (process.env.NODE_ENV === 'development' && window.location.hostname === 'localhost')) {
      console.warn('🔧 Development Mode: Using local authentication')
      // Auto-login as super admin for development
      const devUser: User = {
        id: 'dev-user-id',
        email: 'kenn.teoh@storehub.com',
        role: 'super_admin',
        created_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString()
      }
      setUser(devUser)
      setLoading(false)
      router.push('/dashboard')
      return
    }

    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          setLoading(false)
          return
        }

        if (session?.user?.email) {
          // Check if user is allowed
          if (!isUserAllowed(session.user.email)) {
            await supabase.auth.signOut()
            toast({
              title: "Access Denied",
              description: "You are not authorized to access this application.",
              variant: "destructive"
            })
            setLoading(false)
            return
          }

          const role = getUserRole(session.user.email)
          setUser({
            id: session.user.id,
            email: session.user.email,
            role: role!,
            created_at: session.user.created_at,
            last_sign_in_at: session.user.last_sign_in_at
          })
          setSession(session)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error in getSession:', error)
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        if (event === 'SIGNED_IN' && session?.user?.email) {
          // Check if user is allowed
          if (!isUserAllowed(session.user.email)) {
            await supabase.auth.signOut()
            toast({
              title: "Access Denied",
              description: "You are not authorized to access this application.",
              variant: "destructive"
            })
            return
          }

          const role = getUserRole(session.user.email)
          setUser({
            id: session.user.id,
            email: session.user.email,
            role: role!,
            created_at: session.user.created_at,
            last_sign_in_at: session.user.last_sign_in_at
          })
          setSession(session)
          
          toast({
            title: "Welcome!",
            description: `Signed in as ${session.user.email}`,
          })
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setSession(null)
          router.push('/login')
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [router, toast])

  const signIn = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Check if user is allowed before attempting sign in
      if (!isUserAllowed(email)) {
        return {
          success: false,
          error: "You are not authorized to access this application."
        }
      }

      if (!isSupabaseConfigured) {
        return {
          success: false,
          error: "Authentication is not configured. Please set up your Supabase environment variables."
        }
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false, // Don't create new users
        }
      })

      if (error) {
        return {
          success: false,
          error: error.message
        }
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    }
  }

  const signOut = async (): Promise<void> => {
    if (!isSupabaseConfigured) {
      toast({
        title: "Development Mode",
        description: "Authentication is not configured.",
        variant: "destructive"
      })
      return
    }

    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      })
    } else {
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      })
    }
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user,
    isSuperAdmin: user?.role === 'super_admin',
    isSupabaseConfigured
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 