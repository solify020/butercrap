"use server"

import { requireAuth, requireAdmin } from "@/lib/auth-utils"
import { adminDb } from "@/lib/firebase-admin"
import { revalidatePath } from "next/cache"

export async function getResources() {
  // Ensure user is authenticated
  const user = await requireAuth()

  try {
    const snapshot = await adminDb.collection("resources").get()
    return {
      success: true,
      resources: snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString() || null,
      })),
    }
  } catch (error) {
    console.error("Error fetching resources:", error)
    return { success: false, error: "Failed to fetch resources", resources: [] }
  }
}

export async function addResource(formData: FormData) {
  // Ensure user is admin
  const user = await requireAdmin()

  const title = formData.get("title") as string
  const url = formData.get("url") as string
  const description = formData.get("description") as string

  if (!title || !url) {
    return { success: false, error: "Title and URL are required" }
  }

  try {
    await adminDb.collection("resources").add({
      title,
      url,
      description: description || "",
      createdBy: user.id,
      createdAt: new Date(),
    })

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error adding resource:", error)
    return { success: false, error: "Failed to add resource" }
  }
}

export async function updateResource(id: string, formData: FormData) {
  // Ensure user is admin
  const user = await requireAdmin()

  const title = formData.get("title") as string
  const url = formData.get("url") as string
  const description = formData.get("description") as string

  if (!title || !url) {
    return { success: false, error: "Title and URL are required" }
  }

  try {
    await adminDb
      .collection("resources")
      .doc(id)
      .update({
        title,
        url,
        description: description || "",
        updatedBy: user.id,
        updatedAt: new Date(),
      })

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error updating resource:", error)
    return { success: false, error: "Failed to update resource" }
  }
}

export async function deleteResource(id: string) {
  // Ensure user is admin
  const user = await requireAdmin()

  try {
    await adminDb.collection("resources").doc(id).delete()

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error deleting resource:", error)
    return { success: false, error: "Failed to delete resource" }
  }
}

