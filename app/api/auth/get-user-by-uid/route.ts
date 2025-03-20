import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

// Specify Node.js runtime
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  console.log("GET USER BY UID API ROUTE CALLED")

  // Create a fallback user object
  const createFallbackUser = (uid: string) => ({
    uid,
    role: null,
    disabled: false,
    fallback: true,
  })

  try {
    // Parse request body
    let body
    try {
      body = await request.json()
      console.log("Request body received:", body)
    } catch (parseError) {
      console.error("Error parsing request body:", parseError)
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    // Validate UID
    const { uid } = body || {}
    if (!uid) {
      console.error("Missing UID in request")
      return NextResponse.json({ error: "Missing UID" }, { status: 400 })
    }

    console.log("Processing request for UID:", uid)

    // Simple approach: Try to get the user document
    try {
      // Get user document
      const userDocRef = adminDb.collection("users").doc(uid)
      const userDoc = await userDocRef.get()

      // If user exists, return their data
      if (userDoc.exists) {
        const userData = userDoc.data()
        console.log("User found, returning data")
        return NextResponse.json(userData)
      }

      // If user doesn't exist, create a basic record
      console.log("User not found, creating basic record")
      const newUserData = {
        uid,
        role: null,
        disabled: false,
        createdAt: new Date(),
        lastLogin: new Date(),
      }

      // Try to create the user document
      try {
        await userDocRef.set(newUserData)
        console.log("Basic user record created")
        return NextResponse.json(newUserData)
      } catch (createError) {
        console.error("Error creating user record:", createError)
        // Return fallback data instead of failing
        return NextResponse.json(createFallbackUser(uid))
      }
    } catch (firestoreError) {
      console.error("Firestore operation failed:", firestoreError)
      // Return fallback data instead of failing
      return NextResponse.json(createFallbackUser(uid))
    }
  } catch (error) {
    console.error("Unexpected error in get-user-by-uid route:", error)
    // Return a generic response instead of an error
    return NextResponse.json(
      createFallbackUser("unknown"),
      { status: 200 }, // Return 200 even for errors to prevent client-side failures
    )
  }
}

