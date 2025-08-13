import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',                    // Home page
    '/search',              // Search page
    '/category',            // Category pages
    '/product',             // Product detail pages
    '/deals',               // Deals page
    '/prime',               // Prime info page
    '/contact',             // Contact page
    '/help',                // Help page
    '/auth',                // Auth pages (login/register)
    '/api',                 // API routes
    '/setup',               // Setup routes
    '/admin',               // Admin panel (has its own authentication)
  ]
  
  // Define routes that require authentication
  const protectedRoutes = [
    '/profile',             // User profile
    '/orders',              // Order history
    '/wishlist',            // User wishlist
    '/checkout',            // Checkout process
    '/account',             // Account settings
    '/cart',                // Shopping cart (if you want to protect it)
  ]
  
  // Check if current path is public (allow access without authentication)
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith(route + '/')
  )
  
  // Check if the current path requires authentication
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname === route ||
    request.nextUrl.pathname.startsWith(route + '/')
  )
  
  // Only redirect to login if user is accessing protected routes without authentication
  if (!user && isProtectedRoute && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    // Store the original URL to redirect back after login
    url.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so: NextResponse.next({ request })
  // 2. Copy over the cookies, like so: response.cookies.setAll(supabaseResponse.cookies.getAll())

  return supabaseResponse
}