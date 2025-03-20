import { type NextRequest, NextResponse } from "next/server"
import { adminAuth } from "@/lib/firebase-admin"
import { withAuthProtection } from "@/lib/server-auth"

async function setUserRole(req: NextRequest) {
  try {
    const { uid, role } = await req.json()

    if (!uid || !role) {
      return NextResponse.json({ error: "User ID and role are required" }, { status: 400 })
    }

    if (!adminAuth) {
      return NextResponse.json({ error: "Admin auth not initialized" }, { status: 500 })
    }

    // Validate role
    if (role !== "staff" && role !== "owner") {
      return NextResponse.json({ error: 'Invalid role. Must be "staff" or "owner"' }, { status: 400 })
    }

    // Set custom claims
    await adminAuth.setCustomUserClaims(uid, { role })

    return NextResponse.json({ success: true, message: `User ${uid} role set to ${role}` })
  } catch (error) {
    console.error("Error setting user role:", error)
    return NextResponse.json({ error: "Failed to set user role" }, { status: 500 })
  }
}

// Protect this route, requiring owner role
export const POST = withAuthProtection(setUserRole, "owner")

