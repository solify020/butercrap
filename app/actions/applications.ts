"use server"

import { adminDb } from "@/lib/firebase-admin"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/nextauth/route"
import { revalidatePath } from "next/cache"

export async function addApplication(formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return { success: false, error: "Not authenticated" }
  }

  const userRole = session.user.role

  if (userRole !== "owner" && userRole !== "admin") {
    return { success: false, error: "Not authorized" }
  }

  const title = formData.get("title") as string
  const url = formData.get("url") as string
  const description = formData.get("description") as string
  const icon = formData.get("icon") as string

  if (!title || !url) {
    return { success: false, error: "Title and URL are required" }
  }

  try {
    await adminDb.collection("applications").add({
      title,
      url,
      description: description || "",
      icon: icon || "",
      createdBy: session.user.id,
      createdAt: new Date(),
    })

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error adding application:", error)
    return { success: false, error: "Failed to add application" }
  }
}

export async function getApplications() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return { success: false, error: "Not authenticated", applications: [] }
  }

  try {
    const applicationsSnapshot = await adminDb.collection("applications").orderBy("createdAt", "desc").get()

    const applications = applicationsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate().toISOString(),
    }))

    return { success: true, applications }
  } catch (error) {
    console.error("Error getting applications:", error)
    return { success: false, error: "Failed to get applications", applications: [] }
  }
}

export async function deleteApplication(id: string) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return { success: false, error: "Not authenticated" }
  }

  const userRole = session.user.role

  if (userRole !== "owner" && userRole !== "admin") {
    return { success: false, error: "Not authorized" }
  }

  try {
    await adminDb.collection("applications").doc(id).delete()

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error deleting application:", error)
    return { success: false, error: "Failed to delete application" }
  }
}

