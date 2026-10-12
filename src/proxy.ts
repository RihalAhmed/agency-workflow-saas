import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
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

  const url = request.nextUrl.clone()
  const isAuthPage = url.pathname === '/login' || url.pathname === '/signup' || url.pathname.startsWith('/auth/') || url.pathname === '/forgot-password'
  const isProtectedRoute = url.pathname.startsWith('/audit') || url.pathname.startsWith('/dashboard') || url.pathname === '/reset-password'

  try {
    // IMPORTANT: DO NOT USE getSession AS IT DOES NOT REFRESH THE TOKEN
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If user is authenticated and trying to access login/signup pages, redirect to /audit
    if (user && isAuthPage) {
      url.pathname = '/audit'
      url.searchParams.delete('next')
      return NextResponse.redirect(url)
    }

    // If user is not authenticated and trying to access a protected route
    if (!user && isProtectedRoute) {
      url.pathname = '/login'
      url.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search)
      return NextResponse.redirect(url)
    }
  } catch (err) {
    // Gracefully fallback on auth check errors without breaking route resolution
    console.error('[proxy] Auth error:', err)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - any file with an extension (e.g. .svg, .png, .jpg)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
