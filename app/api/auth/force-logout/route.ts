import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { logDetailedError } from "@/lib/debug-utils"

// Remove any export const runtime = 'edge' line if it exists

export async function POST(request: Request) {
  try {
    const { enabled } = await request.json()

    // Update the force logout setting in Firestore
    await adminDb.collection("settings").doc("security").set(
      {
        forceLogout: enabled,
        updatedAt: new Date(),
      },
      { merge: true },
    )

    return NextResponse.json({
      success: true,
      message: `Force logout ${enabled ? "enabled" : "disabled"}`,
    })
  } catch (error) {
    logDetailedError("force-logout", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update force logout setting",
      },
      { status: 500 },
    )
  }
}

