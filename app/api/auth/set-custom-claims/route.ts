import { NextResponse } from "next/server"
import { auth as adminAuth, db as adminDb } from "@/lib/firebase-admin"

export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json()
    const { idToken } = body

    if (!idToken) {
      return NextResponse.json({ error: "No ID token provided" }, { status: 400 })
    }

    // Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    const uid = decodedToken.uid

    // Get the user's role from Firestore
    const userDoc = await adminDb.collection("users").doc(uid).get()

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found in Firestore" }, { status: 404 })
    }

    const userData = userDoc.data()
    const role = userData?.role || null

    // Set custom claims based on Firestore role
    await adminAuth.setCustomUserClaims(uid, { role })

    // Get a new ID token with the updated claims
    const userRecord = await adminAuth.getUser(uid)

    return NextResponse.json({
      success: true,
      role,
      message: `Custom claims set successfully for user ${uid}`,
    })
  } catch (error) {
    console.error("Error setting custom claims:", error)
    return NextResponse.json(
      {
        error: "Failed to set custom claims",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

