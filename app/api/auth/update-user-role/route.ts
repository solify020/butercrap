import { NextResponse } from "next/server"
import { auth as adminAuth, db as adminDb } from "@/lib/firebase-admin"

export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json()
    const { idToken, targetUid, newRole } = body

    if (!idToken || !targetUid || !newRole) {
      return NextResponse.json(
        {
          error: "Missing required parameters",
        },
        { status: 400 },
      )
    }

    // Verify the ID token of the admin user
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    const adminUid = decodedToken.uid

    // Check if the admin user has owner role
    const adminDoc = await adminDb.collection("users").doc(adminUid).get()

    if (!adminDoc.exists) {
      return NextResponse.json(
        {
          error: "Admin user not found",
        },
        { status: 404 },
      )
    }

    const adminData = adminDoc.data()

    if (adminData?.role !== "owner") {
      return NextResponse.json(
        {
          error: "Unauthorized. Only owners can update roles.",
        },
        { status: 403 },
      )
    }

    // Update the target user's role in Firestore
    await adminDb.collection("users").doc(targetUid).update({
      role: newRole,
      updatedAt: adminDb.FieldValue.serverTimestamp(),
      updatedBy: adminUid,
    })

    // Update the target user's custom claims
    await adminAuth.setCustomUserClaims(targetUid, { role: newRole })

    // Log the role change
    await adminDb.collection("roleLogs").add({
      targetUid,
      adminUid,
      oldRole: null, // We don't know the old role here
      newRole,
      timestamp: adminDb.FieldValue.serverTimestamp(),
    })

    return NextResponse.json({
      success: true,
      message: `User ${targetUid} role updated to ${newRole}`,
    })
  } catch (error) {
    console.error("Error updating user role:", error)
    return NextResponse.json(
      {
        error: "Failed to update user role",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

