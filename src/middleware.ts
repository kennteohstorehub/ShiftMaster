import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // Skip middleware for public paths and API routes
  if (pathname.startsWith('/login') || 
      pathname.startsWith('/api') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/favicon.ico') ||
      pathname.includes('.')) {
    return NextResponse.next()
  }

  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && 
    supabaseUrl !== 'https://your-project-id.supabase.co' && 
    supabaseAnonKey !== 'your_supabase_anon_key_here')

  // In development mode without Supabase, allow access but redirect to login page
  if (!isSupabaseConfigured) {
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    // Allow access to dashboard in development mode
    return NextResponse.next()
  }

  // Get session token from cookies (only when Supabase is configured)
  const sessionToken = req.cookies.get('sb-access-token')?.value ||
                      req.cookies.get('sb-refresh-token')?.value

  // If no session and trying to access protected route, redirect to login
  if (!sessionToken && (pathname.startsWith('/dashboard') || pathname === '/')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // If session exists and user is on login page, redirect to dashboard
  if (sessionToken && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
} 