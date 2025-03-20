import { cookies } from "next/headers"
import { adminAuth } from "./firebase-admin"

export async function checkUserSession() {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get("session-token")?.value

    if (!sessionToken) {
      return null
    }

    // Verify the token with Firebase Admin
    try {
      if (!adminAuth) {
        console.warn("Admin auth not initialized, cannot get user")
        return null
      }
      const decodedToken = await adminAuth.verifyIdToken(sessionToken)

      return {
        ...decodedToken,
        role: decodedToken.email === process.env.OWNER_EMAIL ? "owner" : "staff",
      }
    } catch (error) {
      console.error("Token verification error:", error)
      return null
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

