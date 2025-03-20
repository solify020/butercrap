import { NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"

export async function POST(request: Request) {
  try {
    const { isFirstUser, autoApproveEnabled } = await request.json()

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

    // Determine if user should be auto-approved
    const shouldAutoApprove = isFirstUser || autoApproveEnabled

    if (isFirstUser || shouldAutoApprove) {
      // First user or auto-approved user gets added directly to users collection
      const userData = {
        uid: uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        role: isFirstUser ? "owner" : null,
        approved: true,
        createdAt: new Date(),
        lastLogin: new Date(),
        settings: {
          theme: "dark",
          notifications: true,
        },
      }

      const userRef = adminDb.collection("users").doc(uid)
      await userRef.set(userData)

      // Update custom claims
      await adminAuth.setCustomUserClaims(uid, {
        role: isFirstUser ? "owner" : null,
        approved: true,
      })

      return NextResponse.json({
        success: true,
        userData,
        collection: "users",
      })
    } else {
      // Not first user and not auto-approved, add to pending users collection
      const pendingUserData = {
        uid: uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        role: null,
        approved: false,
        createdAt: new Date(),
        lastLogin: new Date(),
      }

      const pendingUserRef = adminDb.collection("pendingUsers").doc(uid)
      await pendingUserRef.set(pendingUserData)

      // Update custom claims
      await adminAuth.setCustomUserClaims(uid, {
        role: null,
        approved: false,
      })

      return NextResponse.json({
        success: true,
        userData: pendingUserData,
        collection: "pendingUsers",
      })
    }
  } catch (error) {
    console.error("Error creating user document:", error)
    return NextResponse.json({ error: "Failed to create user document" }, { status: 500 })
  }
}

