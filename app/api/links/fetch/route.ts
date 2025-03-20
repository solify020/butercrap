import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { withAuthProtection } from "@/lib/server-auth"
import type { UserRole } from "@/lib/server-auth"

// Explicitly set Node.js runtime
export const runtime = "nodejs"

async function fetchLinks(req: NextRequest, user: any, role: UserRole) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 })
    }

    // Determine which collection to query based on user role
    // Use the correct collection names that match your Firestore security rules
    const collectionName = role === "owner" ? "owner-links" : "staff-links"

    console.log(`Fetching links from collection: ${collectionName} for role: ${role}`)

    // Query the appropriate collection
    const linksSnapshot = await adminDb.collection(collectionName).get()

    const links = linksSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    console.log(`Fetched ${links.length} links successfully`)
    return NextResponse.json({ links })
  } catch (error) {
    console.error("Error fetching links:", error)
    return NextResponse.json(
      { error: "Failed to fetch links: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 },
    )
  }
}

// Protect this route, requiring at least staff role
export const GET = withAuthProtection(fetchLinks)

