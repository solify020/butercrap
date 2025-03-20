import { type NextRequest, NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"

// Specify Node.js runtime
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  console.log("Process user API route called")

  try {
    // Parse request body
    const body = await request.json()
    console.log("Request body received:", JSON.stringify(body, null, 2))

    const { idToken, userAgent } = body

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

    const uid = decodedToken.uid
    console.log("User ID from token:", uid)

    // Get user data from Firestore
    console.log("Fetching user document from Firestore...")
    let userDoc
    try {
      userDoc = await adminDb.collection("users").doc(uid).get()
      console.log("User document fetched, exists:", userDoc.exists)
    } catch (firestoreError) {
      console.error("Error fetching user document:", firestoreError)
      return NextResponse.json({ error: "Failed to fetch user data from Firestore" }, { status: 500 })
    }

    let userData: any = {}

    if (userDoc.exists) {
      userData = userDoc.data()
      console.log("User document exists, updating last login")

      // Update last login
      try {
        await adminDb.collection("users").doc(uid).update({
          lastLogin: new Date(),
        })
        console.log("Last login updated successfully")
      } catch (updateError) {
        console.error("Error updating last login:", updateError)
        // Non-critical, continue without throwing
      }
    } else {
      // New user, create document
      console.log("User document does not exist, creating new user document")

      userData = {
        uid: uid,
        email: decodedToken.email || "",
        displayName: decodedToken.name || "",
        photoURL: decodedToken.picture || "",
        role: null, // Will need approval
        disabled: false,
        createdAt: new Date(),
        lastLogin: new Date(),
      }

      try {
        await adminDb.collection("users").doc(uid).set(userData)
        console.log("New user document created successfully")
      } catch (createError) {
        console.error("Error creating new user document:", createError)
        return NextResponse.json({ error: "Failed to create new user document" }, { status: 500 })
      }
    }

    // Log sign-in
    console.log("Logging sign-in...")
    try {
      await adminDb.collection("signInLogs").add({
        userId: uid,
        email: decodedToken.email || "",
        timestamp: new Date(),
        success: true,
        userAgent: userAgent || "Unknown",
        ipAddress: request.headers.get("x-forwarded-for") || "Unknown",
      })
      console.log("Sign-in logged successfully")
    } catch (logError) {
      console.error("Error logging sign-in:", logError)
      // Non-critical, continue without throwing
    }

    console.log("Returning user data:", userData)
    return NextResponse.json(userData)
  } catch (error: any) {
    console.error("Unexpected error in process-user API route:", error)
    return NextResponse.json({ error: error.message || "Failed to process user" }, { status: 500 })
  }
}

