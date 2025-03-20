"use server"

import { adminDb } from "@/lib/firebase-admin"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"

export async function addTask(formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return { success: false, error: "Not authenticated" }
  }

  const userRole = session.user.role

  if (userRole !== "owner" && userRole !== "admin") {
    return { success: false, error: "Not authorized" }
  }

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const assignedTo = formData.get("assignedTo") as string
  const dueDate = formData.get("dueDate") as string
  const priority = formData.get("priority") as string

  if (!title || !assignedTo) {
    return { success: false, error: "Title and assignee are required" }
  }

  try {
    await adminDb.collection("tasks").add({
      title,
      description: description || "",
      assignedTo,
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: priority || "medium",
      status: "pending",
      createdBy: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    revalidatePath("/dashboard/staff-tasks")
    return { success: true }
  } catch (error) {
    console.error("Error adding task:", error)
    return { success: false, error: "Failed to add task" }
  }
}

export async function getTasks() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return { success: false, error: "Not authenticated", tasks: [] }
  }

  try {
    let tasksQuery = adminDb.collection("tasks")

    // If user is staff, only show tasks assigned to them
    if (session.user.role === "staff") {
      tasksQuery = tasksQuery.where("assignedTo", "==", session.user.id)
    }

    const tasksSnapshot = await tasksQuery.orderBy("createdAt", "desc").get()

    const tasks = tasksSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate().toISOString(),
      updatedAt: doc.data().updatedAt.toDate().toISOString(),
      dueDate: doc.data().dueDate ? doc.data().dueDate.toDate().toISOString() : null,
    }))

    return { success: true, tasks }
  } catch (error) {
    console.error("Error getting tasks:", error)
    return { success: false, error: "Failed to get tasks", tasks: [] }
  }
}

export async function updateTaskStatus(id: string, status: string) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return { success: false, error: "Not authenticated" }
  }

  try {
    // Get the task to check if the user is authorized to update it
    const taskDoc = await adminDb.collection("tasks").doc(id).get()

    if (!taskDoc.exists) {
      return { success: false, error: "Task not found" }
    }

    const task = taskDoc.data()

    // Staff can only update tasks assigned to them
    if (session.user.role === "staff" && task?.assignedTo !== session.user.id) {
      return { success: false, error: "Not authorized to update this task" }
    }

    await adminDb.collection("tasks").doc(id).update({
      status,
      updatedAt: new Date(),
      updatedBy: session.user.id,
    })

    revalidatePath("/dashboard/staff-tasks")
    return { success: true }
  } catch (error) {
    console.error("Error updating task status:", error)
    return { success: false, error: "Failed to update task status" }
  }
}

export async function deleteTask(id: string) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return { success: false, error: "Not authenticated" }
  }

  const userRole = session.user.role

  if (userRole !== "owner" && userRole !== "admin") {
    return { success: false, error: "Not authorized" }
  }

  try {
    await adminDb.collection("tasks").doc(id).delete()

    revalidatePath("/dashboard/staff-tasks")
    return { success: true }
  } catch (error) {
    console.error("Error deleting task:", error)
    return { success: false, error: "Failed to delete task" }
  }
}

