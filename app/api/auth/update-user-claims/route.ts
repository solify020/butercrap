import { type NextRequest, NextResponse } from "next/server"
import { getFirebaseAdminApp } from "@/lib/firebase-admin"
import { isUserAuthorized } from "@/lib/auth-utils"

export async function POST(request: NextRequest) {
  try {
    // Check if the user is authorized (owner)
    const authorized = await isUserAuthorized(request, ["owner"])
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get request body
    const { uid, claims } = await request.json()

    if (!uid || !claims) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get Firebase Admin auth
    const { auth } = getFirebaseAdminApp()

    // Set custom user claims
    await auth.setCustomUserClaims(uid, claims)

    // Return success response
    return NextResponse.json({ success: true, message: "User claims updated successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error updating user claims:", error)
    return NextResponse.json({ error: "Failed to update user claims", details: error.message }, { status: 500 })
  }
}

