import { type NextRequest, NextResponse } from "next/server"
import { db as adminDb } from "@/lib/firebase-admin"
import { validateRequest } from "@/lib/auth-server"

// GET system settings
export async function GET(request: NextRequest) {
  try {
    // Validate the request
    const { isAuthenticated, isOwner } = await validateRequest(request)

    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only owners can get system settings
    if (!isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get system settings
    const settingsDoc = await adminDb.collection("settings").doc("system").get()

    if (!settingsDoc.exists) {
      // Create default settings if they don't exist
      const defaultSettings = {
        autoApproveUsers: false,
        maintenanceMode: false,
        updatedAt: adminDb.FieldValue.serverTimestamp(),
      }

      await adminDb.collection("settings").doc("system").set(defaultSettings)

      return NextResponse.json(defaultSettings)
    }

    return NextResponse.json(settingsDoc.data())
  } catch (error) {
    console.error("Error getting system settings:", error)
    return NextResponse.json(
      { error: "Failed to get system settings", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

// UPDATE system settings
export async function POST(request: NextRequest) {
  try {
    // Validate the request
    const { isAuthenticated, isOwner } = await validateRequest(request)

    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only owners can update system settings
    if (!isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get the request body
    const body = await request.json()

    // Validate the settings
    const validSettings = ["autoApproveUsers", "maintenanceMode"]
    const updateData: Record<string, any> = {}

    // Only allow updating valid settings
    for (const key of validSettings) {
      if (body[key] !== undefined) {
        updateData[key] = body[key]
      }
    }

    // Add updated timestamp
    updateData.updatedAt = adminDb.FieldValue.serverTimestamp()

    // Update the settings
    await adminDb.collection("settings").doc("system").set(updateData, { merge: true })

    return NextResponse.json({ success: true, settings: updateData })
  } catch (error) {
    console.error("Error updating system settings:", error)
    return NextResponse.json(
      { error: "Failed to update system settings", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

