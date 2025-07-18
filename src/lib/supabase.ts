import { createClient } from '@supabase/supabase-js'

// Environment variable validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if environment variables are properly configured
if (!supabaseUrl || !supabaseAnonKey || 
    supabaseUrl === 'https://your-project-id.supabase.co' || 
    supabaseAnonKey === 'your_supabase_anon_key_here') {
  console.warn('⚠️  Supabase environment variables are not configured properly.')
  console.warn('Please create a .env.local file with your Supabase credentials.')
  console.warn('See the setup instructions for more details.')
}

// Create a mock client for development when Supabase is not configured
const createMockSupabaseClient = () => ({
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithOtp: () => Promise.resolve({ 
      error: { message: 'Supabase not configured. Please set up your environment variables.' } 
    }),
    signInWithPassword: () => Promise.resolve({ 
      error: { message: 'Supabase not configured. Please set up your environment variables.' } 
    }),
    signOut: () => Promise.resolve({ error: null })
  }
})

// Export the Supabase client (real or mock)
export const supabase = (supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-id.supabase.co' && 
  supabaseAnonKey !== 'your_supabase_anon_key_here') 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : createMockSupabaseClient()

// User types
export interface User {
  id: string
  email: string
  role: 'super_admin' | 'admin' | 'user'
  created_at: string
  last_sign_in_at?: string
}

// Allowed users configuration
export const ALLOWED_USERS: Record<string, { role: 'super_admin' | 'admin' | 'user' }> = {
  'kenn.teoh@storehub.com': { role: 'super_admin' },
  // Add more users here as needed
  // 'user@example.com': { role: 'user' },
}

export const isUserAllowed = (email: string): boolean => {
  return email in ALLOWED_USERS
}

export const getUserRole = (email: string): 'super_admin' | 'admin' | 'user' | null => {
  return ALLOWED_USERS[email]?.role || null
} 