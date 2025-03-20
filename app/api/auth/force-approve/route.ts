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

    // Get user details
    const userRecord = await adminAuth.getUser(uid)

    // Check if user exists in pendingUsers collection
    const pendingUserRef = adminDb.collection("pendingUsers").doc(uid)
    const pendingUserDoc = await pendingUserRef.get()

    if (pendingUserDoc.exists) {
      // Get the pending user data
      const pendingUserData = pendingUserDoc.data()

      // Create the approved user document
      const userRef = adminDb.collection("users").doc(uid)

      // Add additional fields for approved user
      const userData = {
        ...pendingUserData,
        role: "owner", // Force as owner
        approved: true,
        approvedAt: new Date(),
        updatedAt: new Date(),
        forceApproved: true,
      }

      // Add to users collection
      await userRef.set(userData)

      // Delete from pending users collection
      await pendingUserRef.delete()
    } else {
      // User doesn't exist in pendingUsers, create in users collection
      const userData = {
        uid: uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        role: "owner", // Force as owner
        approved: true,
        createdAt: new Date(),
        lastLogin: new Date(),
        approvedAt: new Date(),
        updatedAt: new Date(),
        forceApproved: true,
        settings: {
          theme: "dark",
          notifications: true,
        },
      }

      const userRef = adminDb.collection("users").doc(uid)
      await userRef.set(userData)
    }

    // Update custom claims
    await adminAuth.setCustomUserClaims(uid, {
      role: "owner",
      approved: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error force approving user:", error)
    return NextResponse.json({ error: "Failed to force approve user" }, { status: 500 })
  }
}

