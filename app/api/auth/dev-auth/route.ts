import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET() {
  // Only allow this in development
  if (process.env.NODE_ENV !== "development" && !process.env.SKIP_AUTH) {
    return NextResponse.json(
      {
        status: "error",
        message: "This endpoint is only available in development mode",
      },
      { status: 403 },
    )
  }

  return NextResponse.json({
    status: "ok",
    user: {
      uid: "dev-user",
      email: process.env.OWNER_EMAIL || "dev@example.com",
      displayName: "Development User",
      photoURL: null,
      role: "owner",
      disabled: false,
    },
  })
}

