import { NextResponse } from "next/server"
import { auth as adminAuth } from "@/lib/firebase-admin"

export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json()
    const { idToken } = body

    if (!idToken) {
      return NextResponse.json({ error: "No ID token provided" }, { status: 400 })
    }

    // Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    const uid = decodedToken.uid
    const email = decodedToken.email

    if (!email) {
      return NextResponse.json({ role: null })
    }

    // Get the owner and staff emails from environment variables (not exposed to client)
    const ownerEmails = process.env.OWNER_EMAIL ? process.env.OWNER_EMAIL.split(",").map((e) => e.trim()) : []

    const staffEmails = process.env.STAFF_EMAIL ? process.env.STAFF_EMAIL.split(",").map((e) => e.trim()) : []

    // Determine role based on email
    let role = null
    if (ownerEmails.includes(email)) {
      role = "owner"
    } else if (staffEmails.includes(email)) {
      role = "staff"
    }

    return NextResponse.json({ role })
  } catch (error) {
    console.error("Error checking role:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

