import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export async function GET() {
  try {
    // Get the system settings document reference
    const settingsRef = adminDb.collection("settings").doc("system")

    // Initialize the settings with auto-approve disabled
    await settingsRef.set(
      {
        autoApproveUsers: false,
        maintenanceMode: false,
        updatedAt: adminDb.FieldValue.serverTimestamp(),
      },
      { merge: true },
    )

    return NextResponse.json({
      success: true,
      message: "System settings initialized with auto-approve disabled",
    })
  } catch (error) {
    console.error("Error initializing system settings:", error)
    return NextResponse.json(
      {
        error: "Failed to initialize system settings",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

