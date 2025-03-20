import { adminDb, adminAuth, adminStorage } from "./firebase-admin"
import { FieldValue } from "firebase-admin/firestore"

// User management functions
export async function getUserByEmail(email: string) {
  try {
    const userRecord = await adminAuth.getUserByEmail(email)
    return userRecord
  } catch (error) {
    console.error("Error fetching user by email:", error)
    return null
  }
}

export async function createUser(userData: {
  email: string
  displayName?: string
  password?: string
  photoURL?: string
  role?: string
}) {
  try {
    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email: userData.email,
      displayName: userData.displayName,
      password: userData.password || Math.random().toString(36).slice(-8),
      photoURL: userData.photoURL,
    })

    // Set custom claims for role
    if (userData.role) {
      await adminAuth.setCustomUserClaims(userRecord.uid, { role: userData.role })
    }

    // Create user document in Firestore
    await adminDb.collection("users").doc(userRecord.uid).set({
      email: userData.email,
      displayName: userData.displayName,
      photoURL: userData.photoURL,
      role: userData.role,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })

    return userRecord
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

export async function updateUserRole(uid: string, role: string) {
  try {
    // Update custom claims
    await adminAuth.setCustomUserClaims(uid, { role })

    // Update user document
    await adminDb.collection("users").doc(uid).update({
      role,
      updatedAt: FieldValue.serverTimestamp(),
    })

    return true
  } catch (error) {
    console.error("Error updating user role:", error)
    return false
  }
}

export async function deleteUserAccount(uid: string) {
  try {
    // Delete from Firebase Auth
    await adminAuth.deleteUser(uid)

    // Delete from Firestore
    await adminDb.collection("users").doc(uid).delete()

    return true
  } catch (error) {
    console.error("Error deleting user:", error)
    return false
  }
}

// Firestore admin utilities
export async function getCollection(collectionName: string, limit = 100) {
  try {
    const snapshot = await adminDb.collection(collectionName).limit(limit).get()
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error(`Error getting ${collectionName} collection:`, error)
    return []
  }
}

export async function getDocumentById(collectionName: string, docId: string) {
  try {
    const docRef = adminDb.collection(collectionName).doc(docId)
    const doc = await docRef.get()

    if (!doc.exists) {
      return null
    }

    return {
      id: doc.id,
      ...doc.data(),
    }
  } catch (error) {
    console.error(`Error getting ${collectionName} document:`, error)
    return null
  }
}

export async function createDocument(collectionName: string, data: any) {
  try {
    const docRef = adminDb.collection(collectionName).doc()
    await docRef.set({
      ...data,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })

    return {
      id: docRef.id,
      ...data,
    }
  } catch (error) {
    console.error(`Error creating ${collectionName} document:`, error)
    throw error
  }
}

export async function updateDocument(collectionName: string, docId: string, data: any) {
  try {
    const docRef = adminDb.collection(collectionName).doc(docId)
    await docRef.update({
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    })

    return true
  } catch (error) {
    console.error(`Error updating ${collectionName} document:`, error)
    return false
  }
}

export async function deleteDocument(collectionName: string, docId: string) {
  try {
    await adminDb.collection(collectionName).doc(docId).delete()
    return true
  } catch (error) {
    console.error(`Error deleting ${collectionName} document:`, error)
    return false
  }
}

// Storage admin utilities
export async function getStorageFileUrl(filePath: string, expirationMinutes = 5) {
  try {
    const file = adminStorage.file(filePath)
    const [url] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + expirationMinutes * 60 * 1000,
    })

    return url
  } catch (error) {
    console.error("Error getting storage file URL:", error)
    return null
  }
}

export async function deleteStorageFile(filePath: string) {
  try {
    const file = adminStorage.file(filePath)
    await file.delete()
    return true
  } catch (error) {
    console.error("Error deleting storage file:", error)
    return false
  }
}

