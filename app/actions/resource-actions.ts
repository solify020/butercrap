"use server"

import { db } from "@/lib/firebase-admin"
import { revalidatePath } from "next/cache"

export async function getResources() {
  try {
    if (!db) {
      throw new Error("Database not initialized")
    }

    const resourcesSnapshot = await db.collection("resources").get()
    const resources = resourcesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return { resources }
  } catch (error) {
    console.error("Error fetching resources:", error)
    return { error: "Failed to fetch resources" }
  }
}

export async function getApplications() {
  try {
    if (!db) {
      throw new Error("Database not initialized")
    }

    const applicationsSnapshot = await db.collection("applications").get()
    const applications = applicationsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return { applications }
  } catch (error) {
    console.error("Error fetching applications:", error)
    return { error: "Failed to fetch applications" }
  }
}

export async function addResource(formData: FormData) {
  try {
    if (!db) {
      throw new Error("Database not initialized")
    }

    const title = formData.get("title") as string
    const url = formData.get("url") as string

    if (!title || !url) {
      throw new Error("Title and URL are required")
    }

    await db.collection("resources").add({
      title,
      url,
      createdAt: new Date(),
    })

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error adding resource:", error)
    return { error: "Failed to add resource" }
  }
}

export async function addApplication(formData: FormData) {
  try {
    if (!db) {
      throw new Error("Database not initialized")
    }

    const title = formData.get("title") as string
    const url = formData.get("url") as string

    if (!title || !url) {
      throw new Error("Title and URL are required")
    }

    await db.collection("applications").add({
      title,
      url,
      createdAt: new Date(),
    })

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error adding application:", error)
    return { error: "Failed to add application" }
  }
}

export async function deleteResource(id: string) {
  try {
    if (!db) {
      throw new Error("Database not initialized")
    }

    await db.collection("resources").doc(id).delete()

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error deleting resource:", error)
    return { error: "Failed to delete resource" }
  }
}

export async function deleteApplication(id: string) {
  try {
    if (!db) {
      throw new Error("Database not initialized")
    }

    await db.collection("applications").doc(id).delete()

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error deleting application:", error)
    return { error: "Failed to delete application" }
  }
}

