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

    // Fetch logs from Firestore
    const db = adminDb
    if (!db) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 })
    }

    // Get all logs
    const logsSnapshot = await db.collection("sign-in-logs").orderBy("timestamp", "desc").get()

    const logs = logsSnapshot.docs.map((doc) => {
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
        timestamp: timestamp.toISOString(),
      }
    })

    // Convert to CSV
    const headers = ["Email", "Timestamp", "Success", "IP Address", "User Agent", "Error Code"]
    const csvRows = [
      headers.join(","),
      ...logs.map((log) =>
        [
          log.email || "",
          log.timestamp || "",
          log.success ? "Success" : "Failed",
          log.ipAddress || "",
          `"${(log.userAgent || "").replace(/"/g, '""')}"`, // Escape quotes in user agent
          log.errorCode || "",
        ].join(","),
      ),
    ]

    const csv = csvRows.join("\n")

    // Return as CSV file
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="signin-logs-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("Error exporting sign-in logs:", error)
    return NextResponse.json({ error: "Failed to export sign-in logs" }, { status: 500 })
  }
}

