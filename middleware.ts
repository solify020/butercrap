import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyAuthToken } from "./lib/auth/server-auth"

// Define public paths that don't require authentication
const publicPaths = ["/login", "/signup", "/reset-password"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Special case for pending-approval page
  if (pathname.startsWith("/pending-approval")) {
    const { user } = await verifyAuthToken(request)

    // If user is approved, redirect to dashboard
    if (user?.approved) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    return NextResponse.next()
  }

  // Verify authentication for all other paths
  const { user, error } = await verifyAuthToken(request)

  // If not authenticated, redirect to login
  if (!user || error) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If user is not approved, redirect to pending approval
  if (!user.approved) {
    return NextResponse.redirect(new URL("/pending-approval", request.url))
  }

  // Check role-based access
  if (pathname.startsWith("/admin") && user.role !== "owner") {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /fonts (inside /public)
     * 4. /examples (inside /public)
     * 5. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api|_next|fonts|examples|[\\w-]+\\.\\w+).*)",
  ],
}

