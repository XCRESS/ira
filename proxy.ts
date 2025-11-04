import { NextRequest, NextResponse } from "next/server"

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/api/auth", "/manifest.webmanifest"]
  const isPublicRoute = publicRoutes.some((route) =>
    pathname === route || pathname.startsWith("/api/auth")
  )

  // Get session from cookie
  const sessionToken = request.cookies.get("better-auth.session_token")?.value

  // If user is authenticated and tries to access login, redirect to dashboard
  if (sessionToken && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

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
