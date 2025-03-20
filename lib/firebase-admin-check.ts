import { adminAuth } from "./firebase-admin"

export async function checkFirebaseAdmin() {
  try {
    // Try to list users (limit to 1) to check if Firebase Admin is working
    await adminAuth.listUsers(1)
    return { initialized: true, error: null }
  } catch (error) {
    console.error("Firebase Admin check failed:", error)
    return {
      initialized: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

