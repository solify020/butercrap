import { type NextRequest, NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"
import { withAuthProtection } from "@/lib/server-auth"

// GET handler to fetch all users
async function getUsers(req: NextRequest) {
  try {
    // Check if admin auth is initialized
    if (!adminAuth) {
      return NextResponse.json({ error: "Admin auth not initialized" }, { status: 500 })
    }

    // Fetch users from Firebase Auth
    const { users } = await adminAuth.listUsers(1000)

    // Get additional user data from Firestore
    const userProfiles: Record<string, any> = {}

    if (adminDb) {
      const userProfilesSnapshot = await adminDb.collection("user-profiles").get()
      userProfilesSnapshot.forEach((doc) => {
        userProfiles[doc.id] = doc.data()
      })
    }

    // Combine auth data with profile data
    const enrichedUsers = users.map((user) => {
      const profile = userProfiles[user.uid] || {}
      return {
        uid: user.uid,
        email: user.email,
        name: user.displayName || profile.name || "",
        role: user.customClaims?.role || "staff",
        disabled: user.disabled,
        lastSignIn: user.metadata.lastSignInTime,
        createdAt: user.metadata.creationTime,
        ...profile,
      }
    })

    return NextResponse.json({ users: enrichedUsers })
  } catch (error: any) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users: " + error.message }, { status: 500 })
  }
}

// POST handler to create a new user
async function createUser(req: NextRequest) {
  try {
    // Parse request body
    const { email, role, name } = await req.json()

    // Validate input
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if admin auth is initialized
    if (!adminAuth) {
      return NextResponse.json({ error: "Admin auth not initialized" }, { status: 500 })
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)

    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password: tempPassword,
      displayName: name || undefined,
    })

    // Set custom claims for role
    await adminAuth.setCustomUserClaims(userRecord.uid, { role })

    // Store additional user data in Firestore
    if (adminDb) {
      await adminDb.collection("user-profiles").doc(userRecord.uid).set({
        name,
        role,
        createdAt: new Date(),
      })
    }

    return NextResponse.json({
      success: true,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName,
        role,
      },
      tempPassword,
    })
  } catch (error: any) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user: " + error.message }, { status: 500 })
  }
}

// Protect these routes, requiring owner role
export const GET = withAuthProtection(getUsers, "owner")
export const POST = withAuthProtection(createUser, "owner")

