import { NextResponse } from "next/server"
import { db as adminDb } from "@/lib/firebase-admin"

export async function GET() {
  try {
    // Check if any users with owner role exist
    const ownersSnapshot = await adminDb.collection("users").where("role", "==", "owner").limit(1).get()

    const isFirstUser = ownersSnapshot.empty

    return NextResponse.json({
      success: true,
      isFirstUser,
    })
  } catch (error) {
    console.error("Error checking if first user:", error)
    return NextResponse.json(
      {
        error: "Failed to check if first user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

