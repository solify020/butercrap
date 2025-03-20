import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getFirestore } from "firebase-admin/firestore"
import { initAdmin } from "@/lib/firebase-admin"

// Import the authOptions using dynamic import
const { authOptions } = require("../nextauth/options")

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    initAdmin()
    const db = getFirestore()
    const signinLogsRef = db.collection("signin_logs")
    const snapshot = await signinLogsRef.orderBy("timestamp", "desc").limit(100).get()

    const logs = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate?.() || data.timestamp,
      }
    })

    return NextResponse.json({ logs })
  } catch (error) {
    console.error("Error fetching signin logs:", error)
    return NextResponse.json({ error: "Failed to fetch signin logs" }, { status: 500 })
  }
}

