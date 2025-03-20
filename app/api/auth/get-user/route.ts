import { type NextRequest, NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"

// Specify Node.js runtime
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  console.log("GET USER API ROUTE CALLED")

  try {
    // Parse request body
    const body = await request.json()
    console.log("Request body received:", JSON.stringify(body, null, 2))

    const { idToken, uid } = body

    if (!idToken) {
      console.error("Missing ID token")
      return NextResponse.json({ error: "Missing ID token" }, { status: 400 })
    }

    // Verify the ID token
    console.log("Verifying ID token...")
    let decodedToken
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken)
      console.log("ID token verified successfully")
    } catch (verifyError) {
      console.error("Error verifying ID token:", verifyError)
      return NextResponse.json({ error: "Invalid ID token" }, { status: 401 })
    }

    const userId = decodedToken.uid
    console.log("User ID from token:", userId)

    // Get user data from Firestore
    console.log("Fetching user document from Firestore...")
    let userDoc
    try {
      userDoc = await adminDb.collection("users").doc(userId).get()
      console.log("User document fetched, exists:", userDoc.exists)
    } catch (firestoreError) {
      console.error("Error fetching user document:", firestoreError)
      return NextResponse.json({ error: "Failed to fetch user data from Firestore" }, { status: 500 })
    }

    // If user document doesn't exist, create it
    if (!userDoc.exists) {
      console.log("User document does not exist, creating new user document")
      try {
        // Get user info from Firebase Auth
        const userRecord = await adminAuth.getUser(userId)
        console.log("User record from Auth:", userRecord)

        // Create new user document
        const newUserData = {
          uid: userId,
          email: userRecord.email || "",
          displayName: userRecord.displayName || "",
          photoURL: userRecord.photoURL || "",
          role: null, // Will need approval
          disabled: false,
          createdAt: new Date(),
          lastLogin: new Date(),
        }

        console.log("Creating new user document with data:", newUserData)
        await adminDb.collection("users").doc(userId).set(newUserData)
        console.log("New user document created successfully")

        return NextResponse.json(newUserData)
      } catch (createError) {
        console.error("Error creating new user document:", createError)

        // Fallback to basic user data
        const fallbackData = {
          uid: userId,
          email: decodedToken.email || "",
          displayName: decodedToken.name || "",
          photoURL: decodedToken.picture || "",
          role: null,
          disabled: false,
        }

        console.log("Returning fallback user data:", fallbackData)
        return NextResponse.json(fallbackData)
      }
    }

    // Return user data
    const userData = userDoc.data()
    console.log("Returning user data:", userData)
    return NextResponse.json(userData)
  } catch (error: any) {
    console.error("Unexpected error in get-user API route:", error)
    return NextResponse.json({ error: error.message || "Failed to get user data" }, { status: 500 })
  }
}

