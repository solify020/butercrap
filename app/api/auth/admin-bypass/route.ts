import { NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"
import { logDetailedError } from "@/lib/debug-utils"

export async function POST(request: Request) {
  try {
    const { uid, email } = await request.json()

    // Check if admin bypass is enabled
    const enableAdminBypass = process.env.ENABLE_ADMIN_BYPASS === "true"
    const adminBypassEmail = process.env.ADMIN_BYPASS_EMAIL

    // If admin bypass is not enabled or the email doesn't match, return error
    if (!enableAdminBypass || !adminBypassEmail || email !== adminBypassEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "Admin bypass not enabled or email doesn't match",
        },
        { status: 403 },
      )
    }

    // Update user document in Firestore
    await adminDb.collection("users").doc(uid).set(
      {
        role: "owner",
        approved: true,
        adminBypass: true,
        updatedAt: new Date(),
      },
      { merge: true },
    )

    // Set custom user claims
    await adminAuth.setCustomUserClaims(uid, {
      role: "owner",
      approved: true,
      adminBypass: true,
    })

    // Log the admin bypass
    await adminDb.collection("roleLogs").add({
      uid,
      email,
      action: "admin_bypass",
      timestamp: new Date(),
      details: "Admin bypass applied",
    })

    // Return success
    return NextResponse.json({
      success: true,
      message: "Admin bypass applied successfully",
    })
  } catch (error) {
    logDetailedError("admin-bypass", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to apply admin bypass",
      },
      { status: 500 },
    )
  }
}

