import { type NextRequest, NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json()

    if (!idToken) {
      return NextResponse.json({ error: "ID token is required" }, { status: 400 })
    }

    // Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    const uid = decodedToken.uid

    // Check if this is actually the first user
    const ownersSnapshot = await adminDb.collection("users").where("role", "==", "owner").get()

    // If there are multiple owners or this user is not an owner in Firestore, reject
    const userDoc = await adminDb.collection("users").doc(uid).get()
    const userData = userDoc.data()

    if (!userData || userData.role !== "owner") {
      return NextResponse.json({ error: "User is not marked as owner in Firestore" }, { status: 403 })
    }

    // Set custom claims for the first user
    await adminAuth.setCustomUserClaims(uid, {
      role: "owner",
      approved: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error setting first user claims:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

