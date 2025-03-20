"use server"

import { adminDb } from "@/lib/firebase-admin"
import { revalidatePath } from "next/cache"

// Get maintenance status
export async function getMaintenanceStatus() {
  try {
    const docRef = adminDb.collection("settings").doc("maintenance")
    const doc = await docRef.get()

    if (!doc.exists) {
      // Create default maintenance document if it doesn't exist
      await docRef.set({
        enabled: false,
        message: "The system is currently undergoing maintenance. Please check back later.",
        updatedAt: new Date(),
      })

      return {
        success: true,
        maintenance: {
          enabled: false,
          message: "The system is currently undergoing maintenance. Please check back later.",
        },
      }
    }

    return {
      success: true,
      maintenance: doc.data(),
    }
  } catch (error) {
    console.error("Error getting maintenance status:", error)
    return { success: false, error: "Failed to get maintenance status" }
  }
}

// Update maintenance status
export async function updateMaintenanceStatus(formData: FormData) {
  try {
    const enabled = formData.get("enabled") === "true"
    const message = formData.get("message") as string

    // Update maintenance document in Firestore
    await adminDb.collection("settings").doc("maintenance").update({
      enabled,
      message,
      updatedAt: new Date(),
    })

    revalidatePath("/owner/admin")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error updating maintenance status:", error)
    return { success: false, error: "Failed to update maintenance status" }
  }
}

