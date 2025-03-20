"use server"

import { adminDb } from "@/lib/firebase-admin"
import { revalidatePath } from "next/cache"

// Get follower stats
export async function getFollowerStats() {
  try {
    const statsSnapshot = await adminDb.collection("followerStats").orderBy("date", "desc").limit(30).get()

    const stats = statsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate().toISOString(),
    }))

    return { success: true, stats }
  } catch (error) {
    console.error("Error getting follower stats:", error)
    return { success: false, error: "Failed to get follower stats" }
  }
}

// Add follower stats
export async function addFollowerStats(formData: FormData) {
  try {
    const date = new Date(formData.get("date") as string)
    const platform = formData.get("platform") as string
    const count = Number.parseInt(formData.get("count") as string)
    const change = Number.parseInt(formData.get("change") as string)

    // Create stats document in Firestore
    const docRef = adminDb.collection("followerStats").doc()
    await docRef.set({
      date,
      platform,
      count,
      change,
      createdAt: new Date(),
    })

    revalidatePath("/owner/followers")
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error("Error adding follower stats:", error)
    return { success: false, error: "Failed to add follower stats" }
  }
}

// Update follower stats
export async function updateFollowerStats(formData: FormData) {
  try {
    const id = formData.get("id") as string
    const date = new Date(formData.get("date") as string)
    const platform = formData.get("platform") as string
    const count = Number.parseInt(formData.get("count") as string)
    const change = Number.parseInt(formData.get("change") as string)

    // Update stats document in Firestore
    await adminDb.collection("followerStats").doc(id).update({
      date,
      platform,
      count,
      change,
      updatedAt: new Date(),
    })

    revalidatePath("/owner/followers")
    return { success: true }
  } catch (error) {
    console.error("Error updating follower stats:", error)
    return { success: false, error: "Failed to update follower stats" }
  }
}

// Delete follower stats
export async function deleteFollowerStats(formData: FormData) {
  try {
    const id = formData.get("id") as string

    // Delete stats document from Firestore
    await adminDb.collection("followerStats").doc(id).delete()

    revalidatePath("/owner/followers")
    return { success: true }
  } catch (error) {
    console.error("Error deleting follower stats:", error)
    return { success: false, error: "Failed to delete follower stats" }
  }
}

