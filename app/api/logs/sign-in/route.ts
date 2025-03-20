import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { getServerSession } from "@/lib/auth-utils"

// GET sign-in logs (admin only)
export async function GET(request: NextRequest) {
  try {
    // Verify the user is authenticated and is an owner
    const session = await getServerSession()

    if (!session || session.role !== "owner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the limit from the URL
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    // Get sign-in logs from Firestore
    const logsSnapshot = await adminDb.collection("signInLogs").orderBy("timestamp", "desc").limit(limit).get()

    const logs = logsSnapshot.docs.map((doc) => {
      const data = doc.data()

      // Format timestamp for JSON
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp.toDate().toISOString(),
      }
    })

    return NextResponse.json({ logs })
  } catch (error) {
    console.error("Error getting sign-in logs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST to export sign-in logs as CSV (admin only)
export async function POST(request: NextRequest) {
  try {
    // Verify the user is authenticated and is an owner
    const session = await getServerSession()

    if (!session || session.role !== "owner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all sign-in logs from Firestore
    const logsSnapshot = await adminDb.collection("signInLogs").orderBy("timestamp", "desc").get()

    const logs = logsSnapshot.docs.map((doc) => {
      const data = doc.data()

      return {
        id: doc.id,
        userId: data.userId,
        email: data.email,
        timestamp: data.timestamp.toDate().toISOString(),
        success: data.success,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      }
    })

    // Generate CSV
    const headers = ["ID", "User ID", "Email", "Timestamp", "Success", "IP Address", "User Agent"]
    const csv = [
      headers.join(","),
      ...logs.map((log) =>
        [
          log.id,
          log.userId,
          log.email,
          log.timestamp,
          log.success,
          log.ipAddress,
          `"${log.userAgent.replace(/"/g, '""')}"`,
        ].join(","),
      ),
    ].join("\n")

    // Log the export action
    await adminDb.collection("adminLogs").add({
      action: "export_sign_in_logs",
      performedBy: session.uid,
      timestamp: new Date(),
    })

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="sign-in-logs-${new Date().toISOString()}.csv"`,
      },
    })
  } catch (error) {
    console.error("Error exporting sign-in logs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

