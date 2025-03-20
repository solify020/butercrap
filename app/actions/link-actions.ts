"use server"

import { adminDb } from "@/lib/firebase-admin"
import { revalidatePath } from "next/cache"

// Get all links
export async function getLinks() {
  try {
    const linksSnapshot = await adminDb.collection("links").orderBy("createdAt", "desc").get()

    const links = linksSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString(),
    }))

    return { success: true, links }
  } catch (error) {
    console.error("Error getting links:", error)
    return { success: false, error: "Failed to get links" }
  }
}

// Add a new link
export async function addLink(formData: FormData) {
  try {
    const title = formData.get("title") as string
    const url = formData.get("url") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string

    // Create link document in Firestore
    const docRef = adminDb.collection("links").doc()
    await docRef.set({
      title,
      url,
      description,
      category,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    revalidatePath("/owner")
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error("Error adding link:", error)
    return { success: false, error: "Failed to add link" }
  }
}

// Update a link
export async function updateLink(formData: FormData) {
  try {
    const id = formData.get("id") as string
    const title = formData.get("title") as string
    const url = formData.get("url") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string

    // Update link document in Firestore
    await adminDb.collection("links").doc(id).update({
      title,
      url,
      description,
      category,
      updatedAt: new Date(),
    })

    revalidatePath("/owner")
    return { success: true }
  } catch (error) {
    console.error("Error updating link:", error)
    return { success: false, error: "Failed to update link" }
  }
}

// Delete a link
export async function deleteLink(formData: FormData) {
  try {
    const id = formData.get("id") as string

    // Delete link document from Firestore
    await adminDb.collection("links").doc(id).delete()

    revalidatePath("/owner")
    return { success: true }
  } catch (error) {
    console.error("Error deleting link:", error)
    return { success: false, error: "Failed to delete link" }
  }
}

