import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { updateLink, deleteLink, getLink } from "@/lib/firestore"
import { getUserRole } from "@/lib/auth-utils"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = await getUserRole(session.user.id)

    // Try to get the link from owner links first if user is an owner
    let link = null
    if (userRole === "owner") {
      link = await getLink(params.id, userRole, "owner")
    }

    // If not found or user is not an owner, try staff links
    if (!link) {
      link = await getLink(params.id, userRole, "staff")
    }

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 })
    }

    return NextResponse.json({ link })
  } catch (error) {
    console.error("Error fetching link:", error)
    return NextResponse.json({ error: "Failed to fetch link" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = await getUserRole(session.user.id)
    const data = await req.json()

    // Determine which collection the link is in
    let link = null
    let linkType: "owner" | "staff" | null = null

    if (userRole === "owner") {
      // Owners can check both collections
      link = await getLink(params.id, userRole, "owner")
      if (link) {
        linkType = "owner"
      } else {
        link = await getLink(params.id, userRole, "staff")
        if (link) {
          linkType = "staff"
        }
      }
    } else {
      // Staff can only check staff links
      link = await getLink(params.id, userRole, "staff")
      if (link) {
        linkType = "staff"
      }
    }

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 })
    }

    // Staff can only update their own links
    if (userRole === "staff" && link.createdBy !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await updateLink(params.id, data, linkType as "owner" | "staff")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating link:", error)
    return NextResponse.json({ error: "Failed to update link" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = await getUserRole(session.user.id)

    // Determine which collection the link is in
    let link = null
    let linkType: "owner" | "staff" | null = null

    if (userRole === "owner") {
      // Owners can check both collections
      link = await getLink(params.id, userRole, "owner")
      if (link) {
        linkType = "owner"
      } else {
        link = await getLink(params.id, userRole, "staff")
        if (link) {
          linkType = "staff"
        }
      }
    } else {
      // Staff can only check staff links
      link = await getLink(params.id, userRole, "staff")
      if (link) {
        linkType = "staff"
      }
    }

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 })
    }

    // Staff can only delete their own links
    if (userRole === "staff" && link.createdBy !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await deleteLink(params.id, linkType as "owner" | "staff")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting link:", error)
    return NextResponse.json({ error: "Failed to delete link" }, { status: 500 })
  }
}

