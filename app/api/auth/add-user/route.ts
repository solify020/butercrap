import { type NextRequest, NextResponse } from "next/server"
import { getFirebaseAdminApp } from "@/lib/firebase-admin"
import { cookies } from "next/headers"
import { verifyIdToken } from "@/lib/auth-server"

export async function POST(request: NextRequest) {
  try {
    // Get the session cookie
    const sessionCookie = cookies().get("session")?.value

    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Verify the session cookie
    const decodedClaims = await verifyIdToken(sessionCookie)

    // Check if user is an owner
    if (decodedClaims.role !== "owner") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    // Get request body
    const { email, role, approved = false } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Get Firebase Admin instances
    const { adminAuth, adminDb } = getFirebaseAdminApp()

    // Check if user already exists
    try {
      const userRecord = await adminAuth.getUserByEmail(email)
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    } catch (error) {
      // User doesn't exist, continue
    }

    // Create user in Firebase Auth
    // Note: This will send an email to the user with a link to set their password
    const userRecord = await adminAuth.createUser({
      email,
      emailVerified: false,
      disabled: false,
    })

    // Set custom claims
    await adminAuth.setCustomUserClaims(userRecord.uid, {
      role,
      approved,
    })

    // Create user in Firestore
    await adminDb.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      displayName: null,
      photoURL: null,
      role,
      approved,
      disabled: false,
      createdAt: adminDb.FieldValue.serverTimestamp(),
      createdBy: decodedClaims.uid,
    })

    // Log the addition
    await adminDb.collection("userCreationLogs").add({
      targetUid: userRecord.uid,
      adminUid: decodedClaims.uid,
      email,
      role,
      approved,
      timestamp: adminDb.FieldValue.serverTimestamp(),
    })

    // Generate password reset link
    const passwordResetLink = await adminAuth.generatePasswordResetLink(email)

    return NextResponse.json({
      success: true,
      uid: userRecord.uid,
      passwordResetLink,
    })
  } catch (error) {
    console.error("Error adding user:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}

