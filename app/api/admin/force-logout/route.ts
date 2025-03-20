import { NextResponse } from "next/server"
import { withAuthProtection } from "@/lib/server-auth"
import { doc, setDoc, serverTimestamp, collection } from "firebase/firestore"
import { db } from "@/lib/firebase"

export const runtime = "nodejs"

async function forceLogout() {
  try {
    // Create or update the force-logout document with the current timestamp
    const forceLogoutRef = doc(db, "admin", "force-logout")
    await setDoc(forceLogoutRef, {
      timestamp: serverTimestamp(),
      reason: "Admin initiated force logout",
    })

    // Log the action
    const logRef = doc(collection(db, "admin-logs"))
    await setDoc(logRef, {
      action: "force-logout",
      timestamp: serverTimestamp(),
      details: "Admin initiated force logout of all users",
    })

    return NextResponse.json({ success: true, message: "All users will be signed out on their next request" })
  } catch (error: any) {
    console.error("Error forcing logout:", error)
    return NextResponse.json({ error: "Failed to force logout", details: error.message }, { status: 500 })
  }
}

// Only owners can force logout all users
export const POST = withAuthProtection(forceLogout, "owner")

