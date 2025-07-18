import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false })
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      })
      router.push('/login')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      })
    }
  }

  return {
    user: session?.user || null,
    session,
    loading: status === 'loading',
    signOut: handleSignOut,
    isAuthenticated: status === 'authenticated',
    isSuperAdmin: session?.user?.role === 'SUPER_ADMIN',
  }
}