import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const uid = searchParams.get("uid")

    if (!uid) {
      return NextResponse.json({ error: "UID parameter is required" }, { status: 400 })
    }

    // Check if user exists in users collection
    const userRef = adminDb.collection("users").doc(uid)
    const userDoc = await userRef.get()

    return NextResponse.json({ exists: userDoc.exists })
  } catch (error) {
    console.error("Error checking if user exists:", error)
    return NextResponse.json({ error: "Failed to check if user exists" }, { status: 500 })
  }
}

