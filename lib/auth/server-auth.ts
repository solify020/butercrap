import { cookies } from "next/headers"
import { auth as adminAuth, db as adminDb } from "../firebase/admin"
import type { NextRequest } from "next/server"

// Verify session cookie
export async function verifySessionCookie(sessionCookie: string) {
  if (!sessionCookie) return null

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true)
    return decodedClaims
  } catch (error) {
    console.error("Error verifying session cookie:", error)
    return null
  }
}

// Get current user from session cookie
export async function getCurrentUser() {
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get("session")?.value

  if (!sessionCookie) return null

  try {
    const decodedClaims = await verifySessionCookie(sessionCookie)
    if (!decodedClaims) return null

    // Get user data from Firestore
    const userDoc = await adminDb.collection("users").doc(decodedClaims.uid).get()
    if (!userDoc.exists) return null

    return {
      ...userDoc.data(),
      uid: decodedClaims.uid,
      email: decodedClaims.email,
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Create session cookie
export async function createSessionCookie(idToken: string, expiresIn = 60 * 60 * 24 * 5 * 1000) {
  try {
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn })
    return sessionCookie
  } catch (error) {
    console.error("Error creating session cookie:", error)
    throw error
  }
}

// Verify auth token from request
export async function verifyAuthToken(request: NextRequest) {
  const sessionCookie = request.cookies.get("session")?.value

  if (!sessionCookie) {
    return { user: null, error: "No session cookie" }
  }

  try {
    const decodedClaims = await verifySessionCookie(sessionCookie)
    if (!decodedClaims) {
      return { user: null, error: "Invalid session" }
    }

    // Get user data from Firestore
    const userDoc = await adminDb.collection("users").doc(decodedClaims.uid).get()
    if (!userDoc.exists) {
      return { user: null, error: "User not found" }
    }

    return {
      user: {
        ...userDoc.data(),
        uid: decodedClaims.uid,
        email: decodedClaims.email,
      },
      error: null,
    }
  } catch (error) {
    console.error("Error verifying auth token:", error)
    return { user: null, error: "Authentication error" }
  }
}

