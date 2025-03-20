import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { adminAuth } from "./firebase-admin"

export type UserRole = "staff" | "owner" | "unknown"

// Development mode flag
const isDevelopment = process.env.NODE_ENV === "development"

// Server-side function to get the current user from the session token
export async function getCurrentUser() {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get("session-token")?.value

    if (!sessionToken) {
      console.log("No session token found")
      return null
    }

    // In development, we can bypass token verification
    if (isDevelopment && process.env.SKIP_AUTH === "true") {
      console.warn("Running in development mode with mock authentication")
      // Return mock user based on role cookie
      const roleCookie = cookieStore.get("user-role")?.value
      return {
        uid: "dev-user-id",
        email: roleCookie === "owner" ? process.env.OWNER_EMAIL : process.env.STAFF_EMAIL,
        role: roleCookie || "staff",
      }
    }

    // Verify the token with Firebase Admin
    try {
      if (!adminAuth) {
        console.warn("Admin auth not initialized, using mock authentication")
        const roleCookie = cookieStore.get("user-role")?.value
        return {
          uid: "dev-user-id",
          email: roleCookie === "owner" ? process.env.OWNER_EMAIL : process.env.STAFF_EMAIL,
          role: roleCookie || "staff",
        }
      }

      const decodedToken = await adminAuth.verifyIdToken(sessionToken)
      console.log("Token verified successfully for user:", decodedToken.email)

      return {
        ...decodedToken,
        role: decodedToken.email === process.env.OWNER_EMAIL ? "owner" : "staff",
      }
    } catch (error) {
      console.error("Token verification error:", error)
      return null
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Server-side function to get the user role
export async function getUserRole(): Promise<UserRole> {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return "unknown"
    }

    // Check custom claims first (more secure)
    if (user.role === "owner") {
      return "owner"
    } else if (user.role === "staff") {
      return "staff"
    }

    // Fallback to email check
    if (user.email === process.env.OWNER_EMAIL) {
      return "owner"
    } else if (user.email === process.env.STAFF_EMAIL) {
      return "staff"
    }

    return "staff" // Default role
  } catch (error) {
    console.error("Error getting user role:", error)
    return "unknown"
  }
}

// Helper function to create a protected API route handler
export function withAuthProtection(handler: Function, requiredRole: UserRole = "staff") {
  return async (req: NextRequest, context?: any) => {
    try {
      console.log(`Processing ${req.method} request to ${req.url}`)

      const user = await getCurrentUser()

      if (!user) {
        console.log("Authentication failed: No user found")
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const role = await getUserRole()
      console.log(`User authenticated with role: ${role}`)

      if (requiredRole === "owner" && role !== "owner") {
        console.log("Authorization failed: Owner role required")
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      if (requiredRole === "staff" && role !== "staff" && role !== "owner") {
        console.log("Authorization failed: Staff role required")
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      // User is authenticated and authorized, proceed with the handler
      console.log("User authorized, proceeding with handler")
      return handler(req, user, role, context)
    } catch (error) {
      console.error("Auth protection error:", error)
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
  }
}

