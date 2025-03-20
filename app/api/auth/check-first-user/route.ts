import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export async function GET() {
  try {
    // Check if any users with owner role exist
    const usersRef = adminDb.collection("users")
    const ownerQuery = usersRef.where("role", "==", "owner").limit(1)
    const ownerSnapshot = await ownerQuery.get()

    // If no owners exist, this is the first user
    const isFirstUser = ownerSnapshot.empty

    return NextResponse.json({ isFirstUser })
  } catch (error) {
    console.error("Error checking if first user:", error)
    return NextResponse.json({ error: "Failed to check if first user" }, { status: 500 })
  }
}

