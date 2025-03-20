import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { getCurrentUser, getUserRole } from "@/lib/server-auth"

export async function GET(request: NextRequest) {
  try {
    // Authenticate the user
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an owner
    const role = await getUserRole()
    if (role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const search = searchParams.get("search") || ""
    const dateFilter = searchParams.get("date") || ""

    // Fetch logs from Firestore
    const db = adminDb
    if (!db) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 })
    }

    // Create query
    let query = db.collection("sign-in-logs").orderBy("timestamp", "desc").limit(limit)

    // Apply date filter if provided
    if (dateFilter) {
      const startDate = new Date(dateFilter)
      startDate.setHours(0, 0, 0, 0)

      const endDate = new Date(dateFilter)
      endDate.setHours(23, 59, 59, 999)

      // Firebase doesn't support multiple range operators on different fields
      // So we'll filter by date range and then apply other filters
      query = query.where("timestamp", ">=", startDate).where("timestamp", "<=", endDate)
    }

    const logsSnapshot = await query.get()

    // Get logs and filter by search term if provided
    let logs = logsSnapshot.docs.map((doc) => {
      const data = doc.data()
      // Ensure timestamp is properly converted to a JavaScript Date
      const timestamp = data.timestamp?.toDate
        ? data.timestamp.toDate()
        : data.timestamp instanceof Date
          ? data.timestamp
          : new Date(data.timestamp)

      return {
        id: doc.id,
        ...data,
        timestamp,
      }
    })

    // Apply search filter client-side if provided
    if (search) {
      const searchLower = search.toLowerCase()
      logs = logs.filter(
        (log) =>
          (log.email && log.email.toLowerCase().includes(searchLower)) ||
          (log.ipAddress && log.ipAddress.includes(search)) ||
          (log.userAgent && log.userAgent.toLowerCase().includes(searchLower)),
      )
    }

    // Return the logs
    return NextResponse.json({ logs })
  } catch (error) {
    console.error("Error fetching sign-in logs:", error)
    return NextResponse.json({ error: "Failed to fetch sign-in logs" }, { status: 500 })
  }
}

