import { type NextRequest, NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"
import { withAuthProtection } from "@/lib/server-auth"

// PUT handler to update a user
async function updateUser(req: NextRequest, user: any, role: string, { params }: { params: { uid: string } }) {
  try {
    const uid = params.uid

    // Parse request body
    const { role: newRole, name } = await req.json()

    // Check if admin auth is initialized
    if (!adminAuth) {
      return NextResponse.json({ error: "Admin auth not initialized" }, { status: 500 })
    }

    // Update user in Firebase Auth
    const updateData: any = {}
    if (name) {
      updateData.displayName = name
    }

    await adminAuth.updateUser(uid, updateData)

    // Update custom claims for role
    await adminAuth.setCustomUserClaims(uid, { role: newRole })

    // Update user profile in Firestore
    if (adminDb) {
      await adminDb.collection("user-profiles").doc(uid).set(
        {
          name,
          role: newRole,
          updatedAt: new Date(),
        },
        { merge: true },
      )
    }

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
    })
  } catch (error: any) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user: " + error.message }, { status: 500 })
  }
}

// DELETE handler to delete a user
async function deleteUser(req: NextRequest, user: any, role: string, { params }: { params: { uid: string } }) {
  try {
    const uid = params.uid

    // Check if admin auth is initialized
    if (!adminAuth) {
      return NextResponse.json({ error: "Admin auth not initialized" }, { status: 500 })
    }

    // Delete user from Firebase Auth
    await adminAuth.deleteUser(uid)

    // Delete user profile from Firestore
    if (adminDb) {
      await adminDb.collection("user-profiles").doc(uid).delete()
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error: any) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user: " + error.message }, { status: 500 })
  }
}

// Protect these routes, requiring owner role
export const PUT = withAuthProtection(updateUser, "owner")
export const DELETE = withAuthProtection(deleteUser, "owner")

