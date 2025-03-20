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
    const { targetUid, disabled } = await request.json()

    if (!targetUid) {
      return NextResponse.json({ error: "Target user ID is required" }, { status: 400 })
    }

    // Prevent disabling own account
    if (targetUid === decodedClaims.uid) {
      return NextResponse.json({ error: "Cannot disable your own account" }, { status: 400 })
    }

    // Get Firebase Admin instances
    const { adminAuth, adminDb } = getFirebaseAdminApp()

    // Update user in Firebase Auth
    await adminAuth.updateUser(targetUid, {
      disabled: disabled === true,
    })

    // Update user in Firestore
    await adminDb
      .collection("users")
      .doc(targetUid)
      .update({
        disabled: disabled === true,
        updatedAt: adminDb.FieldValue.serverTimestamp(),
      })

    // Log the status change
    await adminDb.collection("statusLogs").add({
      targetUid,
      adminUid: decodedClaims.uid,
      disabled: disabled === true,
      timestamp: adminDb.FieldValue.serverTimestamp(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating user status:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}

