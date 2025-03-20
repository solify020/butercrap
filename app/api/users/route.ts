import { NextResponse } from "next/server"
import { adminAuth, adminDb, convertFirestoreData } from "@/lib/firebase-admin"

// Make sure there is NO export const runtime = 'edge' line anywhere in this file

export async function GET() {
  try {
    // Get all users from Firebase Auth
    const { users } = await adminAuth.listUsers()

    // Get pending users from Firestore
    const pendingSnapshot = await adminDb.collection("pendingUsers").get()
    const pendingUsers = pendingSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertFirestoreData(doc.data()),
    }))

    // Get approved users from Firestore
    const approvedSnapshot = await adminDb.collection("users").get()
    const approvedUsers = approvedSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertFirestoreData(doc.data()),
    }))

    // Combine data
    const combinedUsers = users.map((user) => {
      const pendingUser = pendingUsers.find((p) => p.email === user.email)
      const approvedUser = approvedUsers.find((a) => a.id === user.uid)

      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        disabled: user.disabled,
        metadata: {
          creationTime: user.metadata.creationTime,
          lastSignInTime: user.metadata.lastSignInTime,
        },
        customClaims: user.customClaims || {},
        status: approvedUser ? "approved" : pendingUser ? "pending" : "unknown",
        createdAt: approvedUser?.createdAt || pendingUser?.createdAt,
      }
    })

    return NextResponse.json({ users: combinedUsers })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

