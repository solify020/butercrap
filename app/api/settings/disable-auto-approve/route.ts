import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export async function POST() {
  try {
    // Get the system settings document reference
    const settingsRef = adminDb.collection("settings").doc("system")

    // Update the settings to disable auto-approve
    await settingsRef.set(
      {
        autoApproveUsers: false,
        updatedAt: adminDb.FieldValue.serverTimestamp(),
      },
      { merge: true },
    )

    return NextResponse.json({
      success: true,
      message: "Auto-approve users feature has been disabled",
    })
  } catch (error) {
    console.error("Error disabling auto-approve users:", error)
    return NextResponse.json(
      {
        error: "Failed to disable auto-approve users",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

