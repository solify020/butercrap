import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createSessionCookie } from "@/lib/auth-utils"
import admin from "@/lib/firebase-admin-sdk"

// Create a session
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json()

    if (!idToken) {
      return NextResponse.json({ error: "No ID token provided" }, { status: 400 })
    }

    // Create a session cookie
    const expiresIn = 60 * 60 * 24 * 5 * 1000 // 5 days
    const sessionCookie = await createSessionCookie(idToken, expiresIn)

    // Set the cookie
    cookies().set("session", sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Session creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// End a session
export async function DELETE() {
  try {
    cookies().set({
      name: "session",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error ending session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Get the current session
export async function GET() {
  try {
    const sessionCookie = cookies().get("session")?.value

    if (!sessionCookie) {
      return NextResponse.json({ user: null })
    }

    // Verify the session cookie
    try {
      const adminAuth = admin.auth()
      const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true)

      // Get user data
      const user = await adminAuth.getUser(decodedClaims.uid)

      return NextResponse.json({
        user: {
          id: user.uid,
          email: user.email,
          name: user.displayName,
          image: user.photoURL,
        },
      })
    } catch (error) {
      console.error("Error verifying session cookie:", error)

      // Clear the invalid session cookie
      cookies().set({
        name: "session",
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 0,
        path: "/",
      })

      return NextResponse.json({ user: null })
    }
  } catch (error) {
    console.error("Error getting session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

