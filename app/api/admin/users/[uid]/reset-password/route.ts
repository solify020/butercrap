import { type NextRequest, NextResponse } from "next/server"
import { adminAuth } from "@/lib/firebase-admin"
import { withAuthProtection } from "@/lib/server-auth"

// POST handler to reset a user's password
async function resetPassword(req: NextRequest, user: any, role: string, { params }: { params: { uid: string } }) {
  try {
    const uid = params.uid

    // Check if admin auth is initialized
    if (!adminAuth) {
      return NextResponse.json({ error: "Admin auth not initialized" }, { status: 500 })
    }

    // Generate a new temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)

    // Update user password in Firebase Auth
    await adminAuth.updateUser(uid, {
      password: tempPassword,
    })

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
      tempPassword,
    })
  } catch (error: any) {
    console.error("Error resetting password:", error)
    return NextResponse.json({ error: "Failed to reset password: " + error.message }, { status: 500 })
  }
}

// Protect this route, requiring owner role
export const POST = withAuthProtection(resetPassword, "owner")

