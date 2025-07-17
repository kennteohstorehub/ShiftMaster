'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Bot, Mail, AlertCircle, CheckCircle, Settings } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [error, setError] = useState('')
  const { signIn, isAuthenticated, loading, isSupabaseConfigured } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      setError('Please enter a valid email address')
      setIsLoading(false)
      return
    }

    try {
      const result = await signIn(email)
      
      if (result.success) {
        setIsEmailSent(true)
        toast({
          title: "Check your email",
          description: `We've sent a magic link to ${email}`,
        })
      } else {
        setError(result.error || 'Failed to send magic link')
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTryAgain = () => {
    setIsEmailSent(false)
    setError('')
    setEmail('')
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Don't render login form if already authenticated
  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Bot className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to ShiftMaster</CardTitle>
          <CardDescription>
            Sign in to access the AI-powered shift management system
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Development Mode Alert */}
          {!isSupabaseConfigured && (
            <Alert className="mb-4">
              <Settings className="h-4 w-4" />
              <AlertDescription>
                <strong>Development Mode:</strong> Supabase authentication is not configured. 
                Please set up your environment variables to enable full authentication.
              </AlertDescription>
            </Alert>
          )}

          {!isEmailSent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !isSupabaseConfigured}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending Magic Link...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    {isSupabaseConfigured ? 'Send Magic Link' : 'Setup Required'}
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <p>Access is restricted to authorized staff only.</p>
                {isSupabaseConfigured ? (
                  <p className="mt-1">Check your email for the magic link to sign in.</p>
                ) : (
                  <p className="mt-1">Configure Supabase to enable authentication.</p>
                )}
              </div>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Check your email</h3>
                <p className="text-sm text-muted-foreground">
                  We&apos;ve sent a magic link to <strong>{email}</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  Click the link in your email to sign in securely.
                </p>
              </div>

              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  The magic link will expire in 60 minutes. If you don&apos;t see the email, check your spam folder.
                </AlertDescription>
              </Alert>

              <Button variant="outline" onClick={handleTryAgain} className="w-full">
                Try Different Email
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 