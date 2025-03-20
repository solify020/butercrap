"use server"

import { adminDb, adminAuth } from "@/lib/firebase-admin"
import { requireAdmin, requireOwner } from "@/lib/auth-utils"
import { revalidatePath } from "next/cache"

export async function getSignInLogs(limit = 100) {
  // Ensure user is admin
  const user = await requireAdmin()

  try {
    const logsSnapshot = await adminDb.collection("signInLogs").orderBy("timestamp", "desc").limit(limit).get()

    const logs = logsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate().toISOString(),
    }))

    return { success: true, logs }
  } catch (error) {
    console.error("Error getting sign-in logs:", error)
    return { success: false, error: "Failed to get sign-in logs", logs: [] }
  }
}

export async function getUsers() {
  // Ensure user is admin
  const user = await requireAdmin()

  try {
    const usersSnapshot = await adminDb.collection("users").get()

    const users = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString() || null,
      lastLogin: doc.data().lastLogin?.toDate().toISOString() || null,
    }))

    return { success: true, users }
  } catch (error) {
    console.error("Error getting users:", error)
    return { success: false, error: "Failed to get users", users: [] }
  }
}

export async function updateUserRole(userId: string, role: string) {
  // Ensure user is admin
  const user = await requireAdmin()

  // Prevent changing own role
  if (userId === user.id) {
    return { success: false, error: "Cannot change your own role" }
  }

  try {
    await adminDb.collection("users").doc(userId).update({
      role,
      updatedAt: new Date(),
      updatedBy: user.id,
    })

    revalidatePath("/dashboard/admin-settings")
    return { success: true }
  } catch (error) {
    console.error("Error updating user role:", error)
    return { success: false, error: "Failed to update user role" }
  }
}

export async function updateUserStatus(userId: string, status: string) {
  // Ensure user is admin
  const user = await requireAdmin()

  try {
    await adminDb.collection("users").doc(userId).update({
      status,
      updatedAt: new Date(),
      updatedBy: user.id,
    })

    revalidatePath("/dashboard/admin-settings")
    return { success: true }
  } catch (error) {
    console.error("Error updating user status:", error)
    return { success: false, error: "Failed to update user status" }
  }
}

export async function deleteUser(userId: string) {
  // Ensure user is owner
  const user = await requireOwner()

  // Prevent deleting self
  if (userId === user.id) {
    return { success: false, error: "Cannot delete your own account" }
  }

  try {
    // Delete from Firebase Auth
    await adminAuth.deleteUser(userId)

    // Delete from Firestore
    await adminDb.collection("users").doc(userId).delete()

    revalidatePath("/dashboard/admin-settings")
    return { success: true }
  } catch (error) {
    console.error("Error deleting user:", error)
    return { success: false, error: "Failed to delete user" }
  }
}

export async function updateSettings(formData: FormData) {
  // Ensure user is owner
  const user = await requireOwner()

  const maintenanceMode = formData.get("maintenanceMode") === "on"
  const autoApproveUsers = formData.get("autoApproveUsers") === "on"

  try {
    await adminDb.collection("settings").doc("general").set(
      {
        maintenanceMode,
        autoApproveUsers,
        updatedAt: new Date(),
        updatedBy: user.id,
      },
      { merge: true },
    )

    revalidatePath("/dashboard/admin-settings")
    return { success: true }
  } catch (error) {
    console.error("Error updating settings:", error)
    return { success: false, error: "Failed to update settings" }
  }
}

export async function getSettings() {
  // Ensure user is authenticated
  const user = await requireAdmin()

  try {
    const settingsDoc = await adminDb.collection("settings").doc("general").get()

    if (!settingsDoc.exists) {
      // Create default settings if they don't exist
      const defaultSettings = {
        maintenanceMode: false,
        autoApproveUsers: false,
        createdAt: new Date(),
      }

      await adminDb.collection("settings").doc("general").set(defaultSettings)

      return { success: true, settings: defaultSettings }
    }

    return { success: true, settings: settingsDoc.data() }
  } catch (error) {
    console.error("Error getting settings:", error)
    return {
      success: false,
      error: "Failed to get settings",
      settings: { maintenanceMode: false, autoApproveUsers: false },
    }
  }
}

