import type { NextRequest } from "next/server"
import { getUserRole } from "./auth-utils"
import admin from "./firebase-admin"

// Validate a request with Firebase token
export async function validateRequest(req: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = req.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        success: false,
        status: 401,
        message: "Missing or invalid authorization header",
      }
    }

    // Extract the token
    const token = authHeader.split("Bearer ")[1]

    if (!token) {
      return {
        success: false,
        status: 401,
        message: "No token provided",
      }
    }

    // Verify the token
    const decodedToken = await verifyIdToken(token)

    if (!decodedToken) {
      return {
        success: false,
        status: 401,
        message: "Invalid token",
      }
    }

    // Get the user's role
    const role = await getUserRole(decodedToken.uid)

    return {
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role,
      },
    }
  } catch (error) {
    console.error("Error validating request:", error)
    return {
      success: false,
      status: 500,
      message: "Error validating request",
    }
  }
}

// Verify a Firebase ID token
export async function verifyIdToken(token: string) {
  try {
    const adminAuth = admin.auth()
    const decodedToken = await adminAuth.verifyIdToken(token)
    return decodedToken
  } catch (error) {
    console.error("Error verifying ID token:", error)
    return null
  }
}

// Verify a Firebase session cookie
export async function verifySessionCookie(sessionCookie: string) {
  try {
    const adminAuth = admin.auth()
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true)
    return decodedClaims
  } catch (error) {
    console.error("Error verifying session cookie:", error)
    return null
  }
}

