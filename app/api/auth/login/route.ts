import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { adminAuth, adminDb } from "@/lib/firebase-admin"

// Explicitly set Node.js runtime
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    console.log("Login API called with body:", body)
    const { idToken, email } = body

    // Validate input
    if (!idToken) {
      return NextResponse.json({ error: "ID token is required" }, { status: 400 })
    }

    // Development mode check
    const isDevelopment = process.env.NODE_ENV === "development"
    let decodedToken: any = null

    // Skip token verification in development mode if SKIP_AUTH is true
    if (isDevelopment && process.env.SKIP_AUTH === "true") {
      console.warn("Running in development mode with mock authentication")

      const isOwner = email === "buterascphq@gmail.com"

      decodedToken = {
        uid: "dev-user-id",
        email: email || "dev@example.com",
        role: isOwner ? "owner" : "staff",
      }
    } else {
      // Verify the ID token in production or if SKIP_AUTH is not true
      if (!adminAuth) {
        console.warn("Admin auth not initialized, using mock authentication")

        const isOwner = email === "buterascphq@gmail.com"

        decodedToken = {
          uid: "dev-user-id",
          email: email || "dev@example.com",
          role: isOwner ? "owner" : "staff",
        }
      } else {
        try {
          decodedToken = await adminAuth.verifyIdToken(idToken)
        } catch (verifyError: any) {
          console.error("Token verification error:", verifyError)
          return NextResponse.json(
            {
              error: `Invalid token: ${verifyError.message || "Unknown error"}`,
            },
            { status: 401 },
          )
        }
      }
    }

    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid ID token" }, { status: 401 })
    }

    console.log("Token verified successfully, user:", decodedToken.email)

    // Set cookies
    const expiresIn = 60 * 60 * 24 * 7 * 1000 // 7 days
    const cookieStore = cookies()

    // Determine user role
    let role = "staff"
    if (decodedToken.email === "buterascphq@gmail.com") {
      role = "owner"
    }

    // Set session token
    cookieStore.set("session-token", idToken, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
    })

    // Set role cookie
    cookieStore.set("user-role", role, {
      maxAge: expiresIn / 1000,
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
    })

    // Set auth cookie
    cookieStore.set("auth", "true", {
      maxAge: expiresIn / 1000,
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
    })

    // Set login timestamp for force logout checking
    cookies().set("login-timestamp", new Date().toISOString(), {
      secure: true,
      sameSite: "strict",
      path: "/",
      httpOnly: true,
    })

    // Always log the sign-in, even in development mode
    try {
      if (!adminDb) {
        console.error("Admin DB not initialized, cannot log sign-in")
      } else {
        await adminDb.collection("sign-in-logs").add({
          userId: decodedToken.uid,
          email: decodedToken.email,
          timestamp: new Date(),
          success: true,
          ipAddress: request.headers.get("x-forwarded-for") || request.ip || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
          // Add additional security information
          method: "api",
          authType: "firebase",
        })
      }
    } catch (logError) {
      console.error("Failed to log sign-in:", logError)
      // Don't block login if logging fails
    }

    console.log("Login successful, setting cookies and returning role:", role)
    return NextResponse.json({ success: true, role })
  } catch (error: any) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Authentication failed: " + (error.message || "Unknown error") }, { status: 401 })
  }
}

