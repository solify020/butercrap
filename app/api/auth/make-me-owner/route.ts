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

    // Check if this is the first user
    const usersRef = adminDb.collection("users")
    const ownerQuery = usersRef.where("role", "==", "owner").limit(1)
    const ownerSnapshot = await ownerQuery.get()

    // If owners already exist, don't allow this operation
    if (!ownerSnapshot.empty) {
      return NextResponse.json({ error: "Owner already exists" }, { status: 403 })
    }

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
        role: "owner",
        approved: true,
        approvedAt: new Date(),
        updatedAt: new Date(),
      }

      // Add to users collection
      await userRef.set(userData)

      // Delete from pending users collection
      await pendingUserRef.delete()
    } else {
      // User doesn't exist in pendingUsers, check if exists in users
      const userRef = adminDb.collection("users").doc(uid)
      const userDoc = await userRef.get()

      if (userDoc.exists) {
        // Update existing user
        await userRef.update({
          role: "owner",
          approved: true,
          updatedAt: new Date(),
        })
      } else {
        // Create new user
        const userData = {
          uid: uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          photoURL: userRecord.photoURL,
          role: "owner",
          approved: true,
          createdAt: new Date(),
          lastLogin: new Date(),
          settings: {
            theme: "dark",
            notifications: true,
          },
        }

        await userRef.set(userData)
      }
    }

    // Update custom claims
    await adminAuth.setCustomUserClaims(uid, {
      role: "owner",
      approved: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error making user owner:", error)
    return NextResponse.json({ error: "Failed to make user owner" }, { status: 500 })
  }
}

