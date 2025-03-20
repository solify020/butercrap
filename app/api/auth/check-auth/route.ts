import { type NextRequest, NextResponse } from "next/server"
import { adminAuth } from "@/lib/firebase-admin"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid JSON in request body",
          authenticated: false,
        },
        { status: 200 },
      ) // Return 200 even for errors
    }

    const { uid } = body || {}

    if (!uid) {
      return NextResponse.json(
        {
          status: "error",
          message: "Missing UID",
          authenticated: false,
        },
        { status: 200 },
      ) // Return 200 even for errors
    }

    try {
      // Try to get user from Firebase Auth
      const userRecord = await adminAuth.getUser(uid)

      return NextResponse.json({
        status: "ok",
        authenticated: true,
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
        },
      })
    } catch (authError) {
      console.error("Error checking authentication:", authError)

      return NextResponse.json(
        {
          status: "error",
          message: authError instanceof Error ? authError.message : "Unknown error",
          authenticated: false,
        },
        { status: 200 },
      ) // Return 200 even for errors
    }
  } catch (error) {
    console.error("Unexpected error in check-auth route:", error)

    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        authenticated: false,
      },
      { status: 200 },
    ) // Return 200 even for errors
  }
}

