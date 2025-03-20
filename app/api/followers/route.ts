import { NextResponse } from "next/server"
import { adminDb, convertFirestoreData } from "@/lib/firebase-admin"

// Make sure there is NO export const runtime = 'edge' line anywhere in this file

export async function GET() {
  try {
    const followersSnapshot = await adminDb.collection("followers").get()

    const followers = followersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertFirestoreData(doc.data()),
    }))

    return NextResponse.json({ followers })
  } catch (error) {
    console.error("Error fetching followers:", error)
    return NextResponse.json({ error: "Failed to fetch followers" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const followerData = await request.json()

    if (!followerData.name) {
      return NextResponse.json({ error: "Follower name is required" }, { status: 400 })
    }

    const newFollower = {
      ...followerData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const docRef = await adminDb.collection("followers").add(newFollower)

    return NextResponse.json({
      id: docRef.id,
      ...convertFirestoreData(newFollower),
    })
  } catch (error) {
    console.error("Error adding follower:", error)
    return NextResponse.json({ error: "Failed to add follower" }, { status: 500 })
  }
}

