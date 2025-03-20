import { NextResponse } from "next/server"
import { checkFirebaseAdmin } from "@/lib/firebase-admin-check"

export async function GET() {
  try {
    const result = await checkFirebaseAdmin()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Admin check API error:", error)
    return NextResponse.json(
      {
        initialized: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

