import { type NextRequest, NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"
import { handleFirestoreError, createSafeDocumentData } from "@/lib/firestore-utils"

// Specify Node.js runtime
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  console.log("Process user by UID API route called")

  try {
    // Parse request body
    const body = await request.json()
    console.log("Request body received:", JSON.stringify(body, null, 2))

    const { uid, userAgent } = body

    if (!uid) {
      console.error("Missing UID")
      return NextResponse.json({ error: "Missing UID" }, { status: 400 })
    }

    // Get user data from Firestore
    console.log("Fetching user document from Firestore...")
    let userDoc
    try {
      userDoc = await adminDb.collection("users").doc(uid).get()
      console.log("User document fetched, exists:", userDoc.exists)
    } catch (firestoreError) {
      console.error("Error fetching user document:", firestoreError)
      const { message } = handleFirestoreError(firestoreError)

      // Return a fallback user object instead of an error
      return NextResponse.json({
        uid,
        role: null,
        disabled: false,
        error: message,
        fallback: true,
      })
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

      // Get user info from Firebase Auth
      let userRecord
      try {
        userRecord = await adminAuth.getUser(uid)
        console.log("User record from Auth:", userRecord)
      } catch (authError) {
        console.error("Error getting user from Auth:", authError)

        // Create a basic user document without Auth data
        userData = {
          uid,
          role: null,
          disabled: false,
          createdAt: new Date(),
          lastLogin: new Date(),
          fallback: true,
        }
      }

      if (userRecord) {
        userData = {
          uid,
          email: userRecord.email || "",
          displayName: userRecord.displayName || "",
          photoURL: userRecord.photoURL || "",
          role: null, // Will need approval
          disabled: false,
          createdAt: new Date(),
          lastLogin: new Date(),
        }
      }

      // Create safe document data
      const safeUserData = createSafeDocumentData(userData)

      try {
        await adminDb.collection("users").doc(uid).set(safeUserData)
        console.log("New user document created successfully")
      } catch (createError) {
        console.error("Error creating new user document:", createError)
        const { message } = handleFirestoreError(createError)

        // Return the user data anyway, but with an error flag
        return NextResponse.json({
          ...userData,
          error: message,
          fallback: true,
        })
      }
    }

    // Log sign-in
    console.log("Logging sign-in...")
    try {
      await adminDb.collection("signInLogs").add({
        userId: uid,
        email: userData.email || "",
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
    console.error("Unexpected error in process-user-by-uid API route:", error)

    // Return a fallback user object
    return NextResponse.json({
      uid: body?.uid || "unknown",
      role: null,
      disabled: false,
      error: error.message || "An unexpected error occurred",
      fallback: true,
    })
  }
}

