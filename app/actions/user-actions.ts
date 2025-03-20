"use server"

import { adminAuth, adminDb } from "@/lib/firebase-admin"
import { revalidatePath } from "next/cache"

// Get all users
export async function getAllUsers() {
  try {
    // Get all users from Firestore
    const usersSnapshot = await adminDb.collection("users").get()

    const users = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return { success: true, users }
  } catch (error) {
    console.error("Error getting users:", error)
    return { success: false, error: "Failed to get users" }
  }
}

// Add a new user
export async function addUser(formData: FormData) {
  try {
    const email = formData.get("email") as string
    const displayName = formData.get("displayName") as string
    const role = formData.get("role") as string

    // Check if user already exists
    try {
      const existingUser = await adminAuth.getUserByEmail(email)
      if (existingUser) {
        return { success: false, error: "User already exists" }
      }
    } catch (error) {
      // User doesn't exist, continue
    }

    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      displayName,
      // Generate a random password
      password: Math.random().toString(36).slice(-8),
    })

    // Set custom claims for role
    await adminAuth.setCustomUserClaims(userRecord.uid, { role })

    // Create user document in Firestore
    await adminDb.collection("users").doc(userRecord.uid).set({
      email,
      displayName,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    revalidatePath("/owner/admin")
    return { success: true }
  } catch (error) {
    console.error("Error adding user:", error)
    return { success: false, error: "Failed to add user" }
  }
}

// Update user role
export async function updateUserRole(formData: FormData) {
  try {
    const uid = formData.get("uid") as string
    const role = formData.get("role") as string

    // Update custom claims
    await adminAuth.setCustomUserClaims(uid, { role })

    // Update user document
    await adminDb.collection("users").doc(uid).update({
      role,
      updatedAt: new Date(),
    })

    revalidatePath("/owner/admin")
    return { success: true }
  } catch (error) {
    console.error("Error updating user role:", error)
    return { success: false, error: "Failed to update user role" }
  }
}

// Delete user
export async function deleteUser(formData: FormData) {
  try {
    const uid = formData.get("uid") as string

    // Delete from Firebase Auth
    await adminAuth.deleteUser(uid)

    // Delete from Firestore
    await adminDb.collection("users").doc(uid).delete()

    revalidatePath("/owner/admin")
    return { success: true }
  } catch (error) {
    console.error("Error deleting user:", error)
    return { success: false, error: "Failed to delete user" }
  }
}

