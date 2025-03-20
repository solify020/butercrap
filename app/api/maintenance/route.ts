import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { getServerSession } from "@/lib/auth-utils"

// GET maintenance mode status
export async function GET() {
  try {
    // Get the maintenance mode status from Firestore
    const settingsDoc = await adminDb.collection("settings").doc("maintenance").get()

    if (!settingsDoc.exists) {
      return NextResponse.json({ enabled: false })
    }

    const { enabled, message } = settingsDoc.data() || { enabled: false, message: "" }

    return NextResponse.json({ enabled, message })
  } catch (error) {
    console.error("Error getting maintenance mode status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST to update maintenance mode (admin only)
export async function POST(request: NextRequest) {
  try {
    // Verify the user is authenticated and is an owner
    const session = await getServerSession()

    if (!session || session.role !== "owner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the maintenance mode data from the request
    const { enabled, message } = await request.json()

    // Update the maintenance mode status in Firestore
    await adminDb
      .collection("settings")
      .doc("maintenance")
      .set({
        enabled,
        message: message || "",
        updatedAt: new Date(),
        updatedBy: session.uid,
      })

    // Log the action
    await adminDb.collection("adminLogs").add({
      action: enabled ? "enable_maintenance_mode" : "disable_maintenance_mode",
      performedBy: session.uid,
      timestamp: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating maintenance mode:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

