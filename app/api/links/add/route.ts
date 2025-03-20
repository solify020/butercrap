import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { withAuthProtection } from "@/lib/server-auth"
import type { UserRole } from "@/lib/server-auth"

// Explicitly set Node.js runtime
export const runtime = "nodejs"

async function addLink(req: NextRequest, user: any, role: UserRole) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 })
    }

    // Parse the request body
    const { name, url, type, imageUrl, color } = await req.json()

    // Validate required fields
    if (!name || !url || !type) {
      return NextResponse.json({ error: "Name, URL, and type are required" }, { status: 400 })
    }

    // Determine which collection to use based on user role
    const collectionName = role === "owner" ? "owner-links" : "staff-links"

    console.log(`Adding link to collection: ${collectionName} for role: ${role}`)

    // Create the document data
    const linkData: Record<string, any> = {
      name,
      url,
      type,
      createdAt: new Date(),
    }

    // Add imageUrl if provided
    if (imageUrl) {
      linkData.imageUrl = imageUrl
    }

    // Add color if provided
    if (color) {
      linkData.color = color
    }

    // Add the document to Firestore
    const docRef = await adminDb.collection(collectionName).add(linkData)

    console.log(`Added link with ID: ${docRef.id}`)
    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: `${type} added successfully`,
    })
  } catch (error) {
    console.error("Error adding link:", error)
    return NextResponse.json(
      { error: "Failed to add link: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 },
    )
  }
}

// Protect this route, requiring at least staff role
export const POST = withAuthProtection(addLink)

