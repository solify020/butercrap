import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { getCurrentUser, getUserRole } from "@/lib/server-auth"

// GET handler for fetching admin settings
export async function GET(request: NextRequest) {
  try {
    // Authenticate the user
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an owner
    const role = await getUserRole()
    if (role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Fetch settings from Firestore
    const db = adminDb
    if (!db) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 })
    }

    const settingsDoc = await db.collection("admin-settings").doc("global").get()

    if (!settingsDoc.exists) {
      // Return default settings if not found
      return NextResponse.json({
        settings: {
          notificationsEnabled: true,
          autoApproveUsers: false,
          maintenanceMode: false,
          sessionTimeout: 60,
          allowedDomains: "buterascp.com",
          twoFactorRequired: true,
        },
      })
    }

    // Return the settings
    return NextResponse.json({ settings: settingsDoc.data() })
  } catch (error) {
    console.error("Error fetching admin settings:", error)
    return NextResponse.json({ error: "Failed to fetch admin settings" }, { status: 500 })
  }
}

// POST handler for updating admin settings
export async function POST(request: NextRequest) {
  try {
    // Authenticate the user
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an owner
    const role = await getUserRole()
    if (role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get request body
    const settings = await request.json()

    // Validate settings
    if (!settings) {
      return NextResponse.json({ error: "No settings provided" }, { status: 400 })
    }

    // Add audit trail
    settings.updatedBy = user.email || "unknown"
    settings.updatedAt = new Date().toISOString()

    // Update settings in Firestore
    const db = adminDb
    if (!db) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 })
    }

    await db.collection("admin-settings").doc("global").set(settings, { merge: true })

    // Return success
    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
    })
  } catch (error) {
    console.error("Error updating admin settings:", error)
    return NextResponse.json({ error: "Failed to update admin settings" }, { status: 500 })
  }
}

