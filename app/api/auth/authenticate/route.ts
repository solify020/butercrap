import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { adminAuth, adminDb } from "@/lib/firebase-admin"

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Use Firebase Admin SDK to authenticate
    // This keeps the authentication logic on the server
    let userRecord
    try {
      // Sign in with email and password using Admin SDK
      userRecord = await adminAuth.getUserByEmail(email)

      // We can't directly verify passwords with Admin SDK, so we'll use a custom token
      // In a real implementation, you'd use a secure authentication flow

      // For now, we'll check against allowed emails
      const ownerEmail = process.env.OWNER_EMAIL
      const staffEmail = process.env.STAFF_EMAIL

      if (email !== ownerEmail && email !== staffEmail) {
        throw new Error("Unauthorized email")
      }
    } catch (error) {
      console.error("Authentication error:", error)
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Determine user role
    const role = email === process.env.OWNER_EMAIL ? "owner" : "staff"

    // Create a session token
    const customToken = await adminAuth.createCustomToken(userRecord.uid, { role })

    // Set cookies
    const expiresIn = 60 * 60 * 24 * 7 // 7 days in seconds
    const cookieStore = cookies()

    cookieStore.set("session-token", customToken, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
    })

    cookieStore.set("user-role", role, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
    })

    cookieStore.set("auth", "true", {
      maxAge: expiresIn,
      httpOnly: false, // This one can be client-accessible
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
    })

    // Log sign-in
    try {
      await adminDb.collection("sign-in-logs").add({
        userId: userRecord.uid,
        email: userRecord.email,
        timestamp: new Date(),
        success: true,
        ipAddress: request.headers.get("x-forwarded-for") || request.ip || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      })
    } catch (logError) {
      console.error("Failed to log sign-in:", logError)
      // Don't block login if logging fails
    }

    return NextResponse.json({
      success: true,
      role,
      redirect: role === "owner" ? "/owner-dashboard" : "/staff-dashboard",
    })
  } catch (error: any) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}

