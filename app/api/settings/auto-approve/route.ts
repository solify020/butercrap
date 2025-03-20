import { type NextRequest, NextResponse } from "next/server"
import { isUserAuthorized } from "@/lib/auth-utils"

export async function POST(request: NextRequest) {
  try {
    // Check if the user is authorized (owner)
    const authorized = await isUserAuthorized(request, ["owner"])
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get request body
    const { enabled } = await request.json()

    if (typeof enabled !== "boolean") {
      return NextResponse.json({ error: "Invalid value for enabled" }, { status: 400 })
    }

    // Update the setting in Firestore
    const { getFirestore } = await import("firebase-admin/firestore")
    const firestore = getFirestore()

    await firestore.collection("settings").doc("autoApprove").set(
      {
        enabled,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    )

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Auto approve setting updated successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error updating auto approve setting:", error)
    return NextResponse.json(
      {
        error: "Failed to update auto approve setting",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

