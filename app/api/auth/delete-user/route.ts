import { type NextRequest, NextResponse } from "next/server"
import { getFirebaseAdminApp } from "@/lib/firebase-admin"
import { cookies } from "next/headers"
import { verifyIdToken } from "@/lib/auth-server"

export async function POST(request: NextRequest) {
  try {
    // Get the session cookie
    const sessionCookie = cookies().get("session")?.value

    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Verify the session cookie
    const decodedClaims = await verifyIdToken(sessionCookie)

    // Check if user is an owner
    if (decodedClaims.role !== "owner") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    // Get request body
    const { targetUid } = await request.json()

    if (!targetUid) {
      return NextResponse.json({ error: "Target user ID is required" }, { status: 400 })
    }

    // Prevent deleting own account
    if (targetUid === decodedClaims.uid) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    // Get Firebase Admin instances
    const { adminAuth, adminDb } = getFirebaseAdminApp()

    // Get user data before deletion for logging
    const userDoc = await adminDb.collection("users").doc(targetUid).get()
    const userData = userDoc.data()

    // Delete user from Firebase Auth
    await adminAuth.deleteUser(targetUid)

    // Delete user from Firestore
    await adminDb.collection("users").doc(targetUid).delete()

    // Log the deletion
    await adminDb.collection("deletionLogs").add({
      targetUid,
      adminUid: decodedClaims.uid,
      deletedUserEmail: userData?.email,
      deletedUserRole: userData?.role,
      timestamp: adminDb.FieldValue.serverTimestamp(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}

