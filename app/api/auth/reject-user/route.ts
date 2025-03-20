import { NextResponse } from "next/server"
import { auth as adminAuth, db as adminDb } from "@/lib/firebase-admin"
import { cookies } from "next/headers"
import { verifySessionCookie } from "@/lib/auth-server"

export async function POST(request: Request) {
  try {
    // Get the session cookie
    const sessionCookie = cookies().get("session")?.value

    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Verify the session cookie
    const decodedClaims = await verifySessionCookie(sessionCookie)
    const adminUid = decodedClaims.uid

    if (!adminUid) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    // Check if admin is an owner
    const adminDoc = await adminDb.collection("users").doc(adminUid).get()
    if (!adminDoc.exists || adminDoc.data()?.role !== "owner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get request body
    const { uid } = await request.json()

    if (!uid) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get the pending user
    const pendingUserDoc = await adminDb.collection("pendingUsers").doc(uid).get()

    if (!pendingUserDoc.exists) {
      return NextResponse.json({ error: "Pending user not found" }, { status: 404 })
    }

    // Delete from pending users collection
    await adminDb.collection("pendingUsers").doc(uid).delete()

    // Add to rejected users collection for record keeping
    await adminDb
      .collection("rejectedUsers")
      .doc(uid)
      .set({
        ...pendingUserDoc.data(),
        rejectedAt: adminDb.FieldValue.serverTimestamp(),
        rejectedBy: adminUid,
      })

    // Disable the user in Firebase Auth
    await adminAuth.updateUser(uid, { disabled: true })

    return NextResponse.json({
      success: true,
      message: "User rejected successfully",
    })
  } catch (error) {
    console.error("Error rejecting user:", error)
    return NextResponse.json(
      {
        error: "Failed to reject user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

