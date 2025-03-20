import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export async function GET() {
  try {
    // Get system settings
    const settingsDoc = await adminDb.collection("settings").doc("system").get()

    if (!settingsDoc.exists) {
      return NextResponse.json({ autoApproveEnabled: false })
    }

    const settings = settingsDoc.data()
    const autoApproveEnabled = settings?.autoApproveEnabled === true

    return NextResponse.json({ autoApproveEnabled })
  } catch (error) {
    console.error("Error checking auto-approve setting:", error)
    return NextResponse.json({ error: "Failed to check auto-approve setting" }, { status: 500 })
  }
}

