import { NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"

export async function POST(request: Request) {
  try {
    // Get the current user from the session
    const authHeader = request.headers.get("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const idToken = authHeader.split("Bearer ")[1]
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    const uid = decodedToken.uid

    // Update last login in users collection
    const userRef = adminDb.collection("users").doc(uid)
    await userRef.update({
      lastLogin: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating last login:", error)
    return NextResponse.json({ error: "Failed to update last login" }, { status: 500 })
  }
}

