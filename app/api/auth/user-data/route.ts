import { type NextRequest, NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json()

    if (!idToken) {
      return NextResponse.json({ error: "Missing ID token" }, { status: 400 })
    }

    // Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    const uid = decodedToken.uid

    // Get user data from Firestore
    const userDoc = await adminDb.collection("users").doc(uid).get()

    if (!userDoc.exists) {
      // New user, create document
      const newUser = {
        email: decodedToken.email,
        displayName: decodedToken.name,
        photoURL: decodedToken.picture,
        role: null, // Role will be assigned by an owner
        disabled: false,
        createdAt: new Date(),
        lastLogin: new Date(),
      }

      await adminDb.collection("users").doc(uid).set(newUser)

      return NextResponse.json({
        userData: newUser,
      })
    }

    // Update last login
    await adminDb.collection("users").doc(uid).update({
      lastLogin: new Date(),
    })

    // Return user data
    return NextResponse.json({
      userData: userDoc.data(),
    })
  } catch (error) {
    console.error("Error getting user data:", error)
    return NextResponse.json({ error: "Failed to get user data" }, { status: 500 })
  }
}

