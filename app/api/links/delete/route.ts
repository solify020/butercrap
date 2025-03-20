import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { withAuthProtection } from "@/lib/server-auth"
import type { UserRole } from "@/lib/server-auth"

// Explicitly set Node.js runtime
export const runtime = "nodejs"

async function deleteLink(req: NextRequest, user: any, role: UserRole) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 })
    }

    // Get the ID from the query parameters
    const url = new URL(req.url)
    const id = url.searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Link ID is required" }, { status: 400 })
    }

    // Determine which collection to use based on user role
    const collectionName = role === "owner" ? "owner-links" : "staff-links"

    console.log(`Deleting link with ID: ${id} from collection: ${collectionName}`)

    // Delete the document from Firestore
    await adminDb.collection(collectionName).doc(id).delete()

    console.log(`Deleted link with ID: ${id}`)
    return NextResponse.json({
      success: true,
      message: "Link deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting link:", error)
    return NextResponse.json(
      { error: "Failed to delete link: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 },
    )
  }
}

// Protect this route, requiring at least staff role
export const DELETE = withAuthProtection(deleteLink)

