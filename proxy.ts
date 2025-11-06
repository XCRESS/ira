import { NextRequest, NextResponse } from "next/server"

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow auth routes (including callbacks) to pass through
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  // Get session from cookie
  const sessionToken = request.cookies.get("better-auth.session_token")?.value

  // Redirect root to dashboard (authenticated) or login (unauthenticated)
  if (pathname === "/") {
    const destination = sessionToken ? "/dashboard" : "/login"
    return NextResponse.redirect(new URL(destination, request.url))
  }

  // If user is authenticated and tries to access login, redirect to dashboard
  if (sessionToken && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/manifest.webmanifest"]
  const isPublicRoute = publicRoutes.includes(pathname)

  // If user is not authenticated and tries to access protected route, redirect to login
  if (!sessionToken && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
