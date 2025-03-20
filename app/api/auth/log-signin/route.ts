import { NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"

export async function POST(request: Request) {
  try {
    const { userAgent } = await request.json()

    // Get the current user from the session
    const authHeader = request.headers.get("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const idToken = authHeader.split("Bearer ")[1]
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    const uid = decodedToken.uid

    // Log sign in
    const logRef = adminDb.collection("signInLogs").doc(`${uid}_${Date.now()}`)
    await logRef.set({
      uid,
      timestamp: new Date(),
      userAgent: userAgent || "Unknown",
      ipAddress: request.headers.get("x-forwarded-for") || "Unknown",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error logging sign in:", error)
    return NextResponse.json({ error: "Failed to log sign in" }, { status: 500 })
  }
}

