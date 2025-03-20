import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const uid = searchParams.get("uid")

    if (!uid) {
      return NextResponse.json({ error: "UID parameter is required" }, { status: 400 })
    }

    // Get user data from users collection
    const userRef = adminDb.collection("users").doc(uid)
    const userDoc = await userRef.get()

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userData = userDoc.data()

    return NextResponse.json(userData)
  } catch (error) {
    console.error("Error getting user data:", error)
    return NextResponse.json({ error: "Failed to get user data" }, { status: 500 })
  }
}

