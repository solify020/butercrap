import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { logDetailedError } from "@/lib/debug-utils"
import { convertFirestoreData } from "@/lib/firebase-admin"

// Remove any export const runtime = 'edge' line if it exists

export async function GET(request: Request) {
  try {
    // Get the role logs from Firestore
    const logsSnapshot = await adminDb.collection("roleLogs").orderBy("timestamp", "desc").limit(100).get()

    // Convert the logs to an array
    const logs = logsSnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...convertFirestoreData(data),
      }
    })

    return NextResponse.json({
      success: true,
      logs,
    })
  } catch (error) {
    logDetailedError("get-role-logs", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get role logs",
      },
      { status: 500 },
    )
  }
}

