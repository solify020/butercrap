import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { addLink, getLinks, getLinksCollection } from "@/lib/firestore"
import { getUserRole } from "@/lib/auth-utils"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = await getUserRole(session.user.id)
    const links = await getLinks(userRole, session.user.id)

    return NextResponse.json({ links })
  } catch (error) {
    console.error("Error fetching links:", error)
    return NextResponse.json({ error: "Failed to fetch links" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = await getUserRole(session.user.id)
    const data = await req.json()

    // Add validation here

    const result = await addLink(data, userRole, session.user.id)

    return NextResponse.json({
      success: true,
      linkId: result.id,
      collection: getLinksCollection(userRole),
    })
  } catch (error) {
    console.error("Error creating link:", error)
    return NextResponse.json({ error: "Failed to create link" }, { status: 500 })
  }
}

