"use server"

import { adminDb } from "@/lib/firebase-admin"
import { revalidatePath } from "next/cache"

// Get all tasks
export async function getTasks() {
  try {
    const tasksSnapshot = await adminDb.collection("tasks").orderBy("createdAt", "desc").get()

    const tasks = tasksSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dueDate: doc.data().dueDate?.toDate().toISOString(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString(),
    }))

    return { success: true, tasks }
  } catch (error) {
    console.error("Error getting tasks:", error)
    return { success: false, error: "Failed to get tasks" }
  }
}

// Add a new task
export async function addTask(formData: FormData) {
  try {
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const assignedTo = formData.get("assignedTo") as string
    const dueDate = new Date(formData.get("dueDate") as string)
    const priority = formData.get("priority") as string
    const status = formData.get("status") as string

    // Create task document in Firestore
    const docRef = adminDb.collection("tasks").doc()
    await docRef.set({
      title,
      description,
      assignedTo,
      dueDate,
      priority,
      status,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    revalidatePath("/owner/tasks")
    revalidatePath("/staff/tasks")
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error("Error adding task:", error)
    return { success: false, error: "Failed to add task" }
  }
}

// Update a task
export async function updateTask(formData: FormData) {
  try {
    const id = formData.get("id") as string
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const assignedTo = formData.get("assignedTo") as string
    const dueDate = new Date(formData.get("dueDate") as string)
    const priority = formData.get("priority") as string
    const status = formData.get("status") as string

    // Update task document in Firestore
    await adminDb.collection("tasks").doc(id).update({
      title,
      description,
      assignedTo,
      dueDate,
      priority,
      status,
      updatedAt: new Date(),
    })

    revalidatePath("/owner/tasks")
    revalidatePath("/staff/tasks")
    return { success: true }
  } catch (error) {
    console.error("Error updating task:", error)
    return { success: false, error: "Failed to update task" }
  }
}

// Delete a task
export async function deleteTask(formData: FormData) {
  try {
    const id = formData.get("id") as string

    // Delete task document from Firestore
    await adminDb.collection("tasks").doc(id).delete()

    revalidatePath("/owner/tasks")
    revalidatePath("/staff/tasks")
    return { success: true }
  } catch (error) {
    console.error("Error deleting task:", error)
    return { success: false, error: "Failed to delete task" }
  }
}

// Update task status
export async function updateTaskStatus(formData: FormData) {
  try {
    const id = formData.get("id") as string
    const status = formData.get("status") as string

    // Update task status in Firestore
    await adminDb.collection("tasks").doc(id).update({
      status,
      updatedAt: new Date(),
    })

    revalidatePath("/owner/tasks")
    revalidatePath("/staff/tasks")
    return { success: true }
  } catch (error) {
    console.error("Error updating task status:", error)
    return { success: false, error: "Failed to update task status" }
  }
}

