import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export const runtime = "nodejs"

export async function GET() {
  try {
    // Try to access Firestore
    const testDoc = await adminDb.collection("_test").doc("test").get()

    return NextResponse.json({
      status: "ok",
      firestore: "connected",
      testDoc: testDoc.exists ? "exists" : "not found",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error checking Firebase Admin:", error)

    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    ) // Return 200 even for errors
  }
}

