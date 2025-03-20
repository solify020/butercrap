import { type NextRequest, NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"

// Specify Node.js runtime
export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  console.log("TEST ADMIN API ROUTE CALLED")

  try {
    // Test Firebase Admin Auth
    console.log("Testing Firebase Admin Auth...")
    const tenantManager = adminAuth.tenantManager()
    console.log("Tenant Manager initialized successfully")

    // Test Firebase Admin Firestore
    console.log("Testing Firebase Admin Firestore...")
    const snapshot = await adminDb.collection("_test_").limit(1).get()
    console.log("Firestore query executed successfully")

    return NextResponse.json({
      success: true,
      message: "Firebase Admin is working correctly",
      auth: "OK",
      firestore: "OK",
    })
  } catch (error: any) {
    console.error("Error testing Firebase Admin:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to test Firebase Admin",
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}

