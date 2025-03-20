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
    const { targetUid, approved } = await request.json()

    if (!targetUid) {
      return NextResponse.json({ error: "Target user ID is required" }, { status: 400 })
    }

    // Get Firebase Admin instances
    const { adminAuth, adminDb } = getFirebaseAdminApp()

    // Update user in Firestore
    await adminDb
      .collection("users")
      .doc(targetUid)
      .update({
        approved: approved === true,
        updatedAt: adminDb.FieldValue.serverTimestamp(),
      })

    // Get current custom claims
    const userRecord = await adminAuth.getUser(targetUid)
    const currentClaims = userRecord.customClaims || {}

    // Update custom claims
    await adminAuth.setCustomUserClaims(targetUid, {
      ...currentClaims,
      approved: approved === true,
    })

    // Log the approval change
    await adminDb.collection("approvalLogs").add({
      targetUid,
      adminUid: decodedClaims.uid,
      approved: approved === true,
      timestamp: adminDb.FieldValue.serverTimestamp(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating user approval:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}

