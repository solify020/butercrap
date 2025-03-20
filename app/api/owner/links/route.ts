import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase-admin"
import { withAuthProtection } from "@/lib/server-auth"

async function getLinks(req: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 })
    }

    const linksSnapshot = await db.collection("owner-links").get()
    const links = linksSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json({ links })
  } catch (error) {
    console.error("Error fetching links:", error)
    return NextResponse.json({ error: "Failed to fetch links" }, { status: 500 })
  }
}

// Protect this route, requiring owner role
export const GET = withAuthProtection(getLinks, "owner")

