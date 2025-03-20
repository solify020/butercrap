"use server"

import { adminDb } from "@/lib/firebase-admin"
import { revalidatePath } from "next/cache"

// Get all Mega links
export async function getMegaLinks() {
  try {
    const linksSnapshot = await adminDb.collection("megaLinks").orderBy("createdAt", "desc").get()

    const links = linksSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString(),
    }))

    return { success: true, links }
  } catch (error) {
    console.error("Error getting Mega links:", error)
    return { success: false, error: "Failed to get Mega links" }
  }
}

// Add a new Mega link
export async function addMegaLink(formData: FormData) {
  try {
    const title = formData.get("title") as string
    const url = formData.get("url") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string

    // Create link document in Firestore
    const docRef = adminDb.collection("megaLinks").doc()
    await docRef.set({
      title,
      url,
      description,
      category,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    revalidatePath("/owner/mega")
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error("Error adding Mega link:", error)
    return { success: false, error: "Failed to add Mega link" }
  }
}

// Update a Mega link
export async function updateMegaLink(formData: FormData) {
  try {
    const id = formData.get("id") as string
    const title = formData.get("title") as string
    const url = formData.get("url") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string

    // Update link document in Firestore
    await adminDb.collection("megaLinks").doc(id).update({
      title,
      url,
      description,
      category,
      updatedAt: new Date(),
    })

    revalidatePath("/owner/mega")
    return { success: true }
  } catch (error) {
    console.error("Error updating Mega link:", error)
    return { success: false, error: "Failed to update Mega link" }
  }
}

// Delete a Mega link
export async function deleteMegaLink(formData: FormData) {
  try {
    const id = formData.get("id") as string

    // Delete link document from Firestore
    await adminDb.collection("megaLinks").doc(id).delete()

    revalidatePath("/owner/mega")
    return { success: true }
  } catch (error) {
    console.error("Error deleting Mega link:", error)
    return { success: false, error: "Failed to delete Mega link" }
  }
}

