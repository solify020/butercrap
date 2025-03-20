/**
 * Firebase Debug Utility
 * This file contains utilities to help debug Firebase issues
 */

import { auth, db } from "@/lib/firebase"
import { doc, setDoc, collection, getDocs, query, limit } from "firebase/firestore"

/**
 * Tests Firestore write permissions by attempting to write to a test document
 * @returns Promise<{success: boolean, message: string}>
 */
export async function testFirestorePermissions() {
  try {
    // Check if user is authenticated
    const currentUser = auth.currentUser
    if (!currentUser) {
      return {
        success: false,
        message: "No authenticated user found. Please sign in first.",
      }
    }

    // Try to write to a test document
    const testDocRef = doc(db, "permissionTests", currentUser.uid)
    await setDoc(testDocRef, {
      timestamp: new Date().toISOString(),
      test: "Permission test",
      uid: currentUser.uid,
    })

    return {
      success: true,
      message: "Successfully wrote to Firestore. Permissions are working correctly.",
    }
  } catch (error) {
    console.error("Firestore permission test failed:", error)
    return {
      success: false,
      message: `Failed to write to Firestore: ${error.message || "Unknown error"}`,
      error,
    }
  }
}

/**
 * Tests if collections exist and are accessible
 * @returns Promise<{success: boolean, collections: {name: string, exists: boolean, count: number}[], message: string}>
 */
export async function testCollectionsExist() {
  try {
    const collectionsToTest = ["users", "pendingUsers", "settings"]
    const results = []

    for (const collectionName of collectionsToTest) {
      try {
        const collectionRef = collection(db, collectionName)
        const q = query(collectionRef, limit(1))
        const snapshot = await getDocs(q)

        results.push({
          name: collectionName,
          exists: true,
          count: snapshot.size,
          accessible: true,
        })
      } catch (error) {
        results.push({
          name: collectionName,
          exists: false,
          count: 0,
          accessible: false,
          error: error.message,
        })
      }
    }

    return {
      success: results.every((r) => r.accessible),
      collections: results,
      message: results.every((r) => r.accessible)
        ? "All collections are accessible"
        : "Some collections are not accessible",
    }
  } catch (error) {
    console.error("Collection test failed:", error)
    return {
      success: false,
      collections: [],
      message: `Failed to test collections: ${error.message || "Unknown error"}`,
      error,
    }
  }
}

/**
 * Gets the current user's authentication state and token
 * @returns Promise<{user: object|null, token: string|null, claims: object|null}>
 */
export async function getCurrentAuthState() {
  try {
    const currentUser = auth.currentUser

    if (!currentUser) {
      return {
        user: null,
        token: null,
        claims: null,
        message: "No authenticated user found",
      }
    }

    // Get token and claims
    const token = await currentUser.getIdToken()
    const tokenResult = await currentUser.getIdTokenResult()

    return {
      user: {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
        emailVerified: currentUser.emailVerified,
        providerData: currentUser.providerData,
      },
      token,
      claims: tokenResult.claims,
      message: "Authentication state retrieved successfully",
    }
  } catch (error) {
    console.error("Failed to get auth state:", error)
    return {
      user: null,
      token: null,
      claims: null,
      message: `Failed to get auth state: ${error.message || "Unknown error"}`,
      error,
    }
  }
}

