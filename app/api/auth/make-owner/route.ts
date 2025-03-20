import { NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"
import { getCurrentUser } from "@/lib/auth-utils"
import { logDetailedError } from "@/lib/debug-utils"

export async function POST(request: Request) {
  try {
    // Get the current user
    const { user, error } = await getCurrentUser(request)

    if (error || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 },
      )
    }

    // Check if there are any existing users with owner role
    const ownersQuery = await adminDb.collection("users").where("role", "==", "owner").limit(1).get()

    // If there are existing owners, don't allow this operation
    if (!ownersQuery.empty) {
      return NextResponse.json(
        {
          success: false,
          error: "Owner already exists",
        },
        { status: 403 },
      )
    }

    // Update user document in Firestore
    await adminDb.collection("users").doc(user.uid).set(
      {
        role: "owner",
        approved: true,
        updatedAt: new Date(),
      },
      { merge: true },
    )

    // Set custom user claims
    await adminAuth.setCustomUserClaims(user.uid, {
      role: "owner",
      approved: true,
    })

    // Log the role change
    await adminDb.collection("roleLogs").add({
      uid: user.uid,
      email: user.email,
      action: "make_owner",
      timestamp: new Date(),
      details: "First user made owner",
    })

    // Return success
    return NextResponse.json({
      success: true,
      message: "User made owner successfully",
    })
  } catch (error) {
    logDetailedError("make-owner", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to make user owner",
      },
      { status: 500 },
    )
  }
}

