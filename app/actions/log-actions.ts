"use server"

import { adminDb } from "@/lib/firebase-admin"

// Get sign-in logs
export async function getSignInLogs(limit = 100) {
  try {
    const logsSnapshot = await adminDb.collection("signInLogs").orderBy("timestamp", "desc").limit(limit).get()

    const logs = logsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate().toISOString(),
    }))

    return { success: true, logs }
  } catch (error) {
    console.error("Error getting sign-in logs:", error)
    return { success: false, error: "Failed to get sign-in logs" }
  }
}

// Export sign-in logs as CSV
export async function exportSignInLogsAsCsv() {
  try {
    const logsSnapshot = await adminDb
      .collection("signInLogs")
      .orderBy("timestamp", "desc")
      .limit(1000) // Limit to 1000 logs
      .get()

    const logs = logsSnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        userId: data.userId,
        email: data.email,
        timestamp: data.timestamp?.toDate().toISOString(),
        userAgent: data.userAgent,
        ip: data.ip,
      }
    })

    // Convert to CSV
    const headers = ["ID", "User ID", "Email", "Timestamp", "User Agent", "IP"]
    const csvRows = [
      headers.join(","),
      ...logs.map((log) =>
        [log.id, log.userId, log.email, log.timestamp, `"${log.userAgent?.replace(/"/g, '""') || ""}"`, log.ip].join(
          ",",
        ),
      ),
    ]

    const csv = csvRows.join("\n")

    return { success: true, csv }
  } catch (error) {
    console.error("Error exporting sign-in logs:", error)
    return { success: false, error: "Failed to export sign-in logs" }
  }
}

