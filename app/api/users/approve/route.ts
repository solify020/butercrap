import { NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"

// Make sure there is NO export const runtime = 'edge' line anywhere in this file

export async function POST(request: Request) {
  try {
    const { uid, email, role } = await request.json()

    if (!uid || !email) {
      return NextResponse.json({ error: "User ID and email are required" }, { status: 400 })
    }

    // Set custom claims based on role
    const claims = {
      admin: role === "admin",
      staff: role === "admin" || role === "staff",
    }

    await adminAuth.setCustomUserClaims(uid, claims)

    // Move user from pendingUsers to users collection
    const pendingUserRef = adminDb.collection("pendingUsers").doc(email)
    const pendingUserDoc = await pendingUserRef.get()

    if (pendingUserDoc.exists) {
      const pendingUserData = pendingUserDoc.data()

      // Add to users collection
      await adminDb
        .collection("users")
        .doc(uid)
        .set({
          email,
          role,
          createdAt: pendingUserData?.createdAt || new Date(),
          approvedAt: new Date(),
        })

      // Delete from pending users
      await pendingUserRef.delete()
    } else {
      // If not in pending, just add to users
      await adminDb.collection("users").doc(uid).set({
        email,
        role,
        createdAt: new Date(),
        approvedAt: new Date(),
      })
    }

    // Log the action
    await adminDb.collection("auditLogs").add({
      action: "approve_user",
      uid,
      email,
      role,
      timestamp: new Date(),
      success: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error approving user:", error)

    // Log the error
    await adminDb
      .collection("auditLogs")
      .add({
        action: "approve_user",
        error: error.message,
        timestamp: new Date(),
        success: false,
      })
      .catch((e) => console.error("Failed to log error:", e))

    return NextResponse.json({ error: "Failed to approve user" }, { status: 500 })
  }
}

