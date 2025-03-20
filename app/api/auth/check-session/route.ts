import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { adminAuth } from "@/lib/firebase-admin"

// Explicitly set Node.js runtime
export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get("session-token")?.value
    const userRole = cookieStore.get("user-role")?.value

    if (!sessionToken) {
      return NextResponse.json({ authenticated: false })
    }

    // Verify the token
    try {
      // In development, we can bypass token verification
      if (process.env.NODE_ENV === "development" && process.env.SKIP_AUTH === "true") {
        return NextResponse.json({
          authenticated: true,
          role: userRole || "staff",
        })
      }

      // Verify token with Firebase Admin
      if (!adminAuth) {
        console.warn("Admin auth not initialized, using mock authentication")
        return NextResponse.json({
          authenticated: true,
          role: userRole || "staff",
        })
      }

      const decodedToken = await adminAuth.verifyIdToken(sessionToken)

      return NextResponse.json({
        authenticated: true,
        role: decodedToken.email === process.env.OWNER_EMAIL ? "owner" : "staff",
      })
    } catch (error) {
      console.error("Token verification error:", error)
      return NextResponse.json({ authenticated: false })
    }
  } catch (error) {
    console.error("Session check error:", error)
    return NextResponse.json({ authenticated: false })
  }
}

