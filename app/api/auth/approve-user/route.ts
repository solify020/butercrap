import { NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"

export async function POST(request: Request) {
  try {
    const { uid, role } = await request.json()

    // Get the pending user document
    const pendingUserRef = adminDb.collection("pendingUsers").doc(uid)
    const pendingUserDoc = await pendingUserRef.get()

    if (!pendingUserDoc.exists) {
      return NextResponse.json({ error: "Pending user not found" }, { status: 404 })
    }

    // Get the pending user data
    const pendingUserData = pendingUserDoc.data()

    // Create the approved user document
    const userRef = adminDb.collection("users").doc(uid)

    // Add additional fields for approved user
    const userData = {
      ...pendingUserData,
      role: role || null,
      approved: true,
      approvedAt: new Date(),
      updatedAt: new Date(),
    }

    // Add to users collection
    await userRef.set(userData)

    // Delete from pending users collection
    await pendingUserRef.delete()

    // Update custom claims
    await adminAuth.setCustomUserClaims(uid, {
      role: role || null,
      approved: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error approving user:", error)
    return NextResponse.json({ error: "Failed to approve user" }, { status: 500 })
  }
}

