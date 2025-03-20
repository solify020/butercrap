import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import admin from "./firebase-admin"

// User roles
const UserRole = {
  USER: "user",
  STAFF: "staff",
  ADMIN: "admin",
  OWNER: "owner",
}

// Get the server session from cookies
async function getServerSession() {
  try {
    const sessionCookie = cookies().get("session")?.value

    if (!sessionCookie) {
      return null
    }

    // Verify the session cookie
    try {
      const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true)

      // Get user data
      const user = await admin.auth().getUser(decodedClaims.uid)

      return {
        user: {
          id: user.uid,
          email: user.email,
          name: user.displayName,
          image: user.photoURL,
        },
      }
    } catch (error) {
      console.error("Error verifying session cookie:", error)
      return null
    }
  } catch (error) {
    console.error("Error getting server session:", error)
    return null
  }
}

// Get the user's role from Firebase
async function getUserRole(userId) {
  try {
    // Try to get from admin SDK
    try {
      const user = await admin.auth().getUser(userId)

      // Check custom claims for role
      const customClaims = user.customClaims || {}

      if (customClaims.role === UserRole.OWNER) return UserRole.OWNER
      if (customClaims.role === UserRole.ADMIN) return UserRole.ADMIN
      if (customClaims.role === UserRole.STAFF) return UserRole.STAFF
    } catch (error) {
      console.error("Error getting user from admin SDK:", error)
    }

    return UserRole.USER
  } catch (error) {
    console.error("Error getting user role:", error)
    return UserRole.USER // Default to user role on error
  }
}

// Middleware to require authentication
async function requireAuth(req) {
  const session = await getServerSession()

  if (!session || !session.user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  return session
}

// Middleware to require admin role
async function requireAdmin(req) {
  const session = await getServerSession()

  if (!session || !session.user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  const userId = session.user.id
  if (!userId) {
    return NextResponse.json({ error: "User ID not found" }, { status: 401 })
  }

  const role = await getUserRole(userId)

  if (role !== UserRole.ADMIN && role !== UserRole.OWNER) {
    return NextResponse.json({ error: "Admin privileges required" }, { status: 403 })
  }

  return { session, role }
}

// Middleware to require owner role
async function requireOwner(req) {
  const session = await getServerSession()

  if (!session || !session.user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  const userId = session.user.id
  if (!userId) {
    return NextResponse.json({ error: "User ID not found" }, { status: 401 })
  }

  const role = await getUserRole(userId)

  if (role !== UserRole.OWNER) {
    return NextResponse.json({ error: "Owner privileges required" }, { status: 403 })
  }

  return { session, role }
}

// Check if a user is authorized for a specific role
async function isUserAuthorized(userId, requiredRole) {
  if (!userId) return false

  const userRole = await getUserRole(userId)

  switch (requiredRole) {
    case UserRole.OWNER:
      return userRole === UserRole.OWNER
    case UserRole.ADMIN:
      return userRole === UserRole.OWNER || userRole === UserRole.ADMIN
    case UserRole.STAFF:
      return userRole === UserRole.OWNER || userRole === UserRole.ADMIN || userRole === UserRole.STAFF
    default:
      return true
  }
}

// Verify an auth token
async function verifyAuthToken(token) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token)
    return decodedToken
  } catch (error) {
    console.error("Error verifying auth token:", error)
    return null
  }
}

// Create a session cookie
async function createSessionCookie(idToken, expiresIn = 60 * 60 * 24 * 5 * 1000) {
  try {
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn })
    return sessionCookie
  } catch (error) {
    console.error("Error creating session cookie:", error)
    return null
  }
}

// Get the current user from the session
async function getCurrentUser() {
  const session = await getServerSession()

  if (!session || !session.user) {
    return null
  }

  return session.user
}

export {
  UserRole,
  getServerSession,
  getUserRole,
  requireAuth,
  requireAdmin,
  requireOwner,
  isUserAuthorized,
  verifyAuthToken,
  createSessionCookie,
  getCurrentUser,
}

