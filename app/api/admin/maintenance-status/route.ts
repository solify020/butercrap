import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

// Cache the settings to avoid excessive Firestore reads
let maintenanceMode = false
let lastFetchTime = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const now = Date.now()

    // Return cached value if it's still valid
    if (now - lastFetchTime < CACHE_TTL) {
      return NextResponse.json({ maintenanceMode })
    }

    // Fetch the latest maintenance mode status from Firestore
    if (!adminDb) {
      console.warn("Admin DB not initialized, returning default maintenance mode status")
      return NextResponse.json({ maintenanceMode: false })
    }

    const settingsDoc = await adminDb.collection("admin").doc("settings").get()

    if (settingsDoc.exists) {
      const settings = settingsDoc.data()
      maintenanceMode = settings?.maintenanceMode || false
    } else {
      maintenanceMode = false
    }

    // Update cache
    lastFetchTime = now

    return NextResponse.json({ maintenanceMode })
  } catch (error) {
    console.error("Error fetching maintenance mode status:", error)
    return NextResponse.json({ maintenanceMode: false })
  }
}

