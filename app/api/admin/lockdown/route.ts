import { NextResponse } from "next/server"
import { getFirestore, doc, updateDoc } from "firebase/firestore"

export async function POST(request: Request) {
  try {
    const { enabled } = await request.json()
    const db = getFirestore()

    // Update the system settings
    const systemRef = doc(db, "system", "lockdown")
    await updateDoc(systemRef, {
      enabled,
      updatedAt: new Date(),
    })

    // If enabling lockdown, we would typically force sign out all users
    // This would be handled by the client-side code checking the lockdown status

    return NextResponse.json({ success: true, enabled })
  } catch (error) {
    console.error("Error updating lockdown status:", error)
    return NextResponse.json({ error: "Failed to update lockdown status" }, { status: 500 })
  }
}

