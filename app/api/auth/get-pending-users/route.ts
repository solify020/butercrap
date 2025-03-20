import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export async function GET() {
  try {
    // Get all pending users
    const pendingUsersRef = adminDb.collection("pendingUsers")
    const pendingUsersSnapshot = await pendingUsersRef.get()

    // Convert to array of user data
    const pendingUsers = []
    pendingUsersSnapshot.forEach((doc) => {
      pendingUsers.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return NextResponse.json({ pendingUsers })
  } catch (error) {
    console.error("Error getting pending users:", error)
    return NextResponse.json({ error: "Failed to get pending users" }, { status: 500 })
  }
}

