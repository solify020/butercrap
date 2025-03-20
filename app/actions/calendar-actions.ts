"use server"

import { adminDb } from "@/lib/firebase-admin"
import { revalidatePath } from "next/cache"

// Get all calendar events
export async function getCalendarEvents() {
  try {
    const eventsSnapshot = await adminDb.collection("calendarEvents").orderBy("date", "desc").get()

    const events = eventsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate().toISOString(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString(),
    }))

    return { success: true, events }
  } catch (error) {
    console.error("Error getting calendar events:", error)
    return { success: false, error: "Failed to get calendar events" }
  }
}

// Add a new calendar event
export async function addCalendarEvent(formData: FormData) {
  try {
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const date = new Date(formData.get("date") as string)
    const platform = formData.get("platform") as string
    const status = formData.get("status") as string

    // Create event document in Firestore
    const docRef = adminDb.collection("calendarEvents").doc()
    await docRef.set({
      title,
      description,
      date,
      platform,
      status,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    revalidatePath("/owner/calendar")
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error("Error adding calendar event:", error)
    return { success: false, error: "Failed to add calendar event" }
  }
}

// Update a calendar event
export async function updateCalendarEvent(formData: FormData) {
  try {
    const id = formData.get("id") as string
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const date = new Date(formData.get("date") as string)
    const platform = formData.get("platform") as string
    const status = formData.get("status") as string

    // Update event document in Firestore
    await adminDb.collection("calendarEvents").doc(id).update({
      title,
      description,
      date,
      platform,
      status,
      updatedAt: new Date(),
    })

    revalidatePath("/owner/calendar")
    return { success: true }
  } catch (error) {
    console.error("Error updating calendar event:", error)
    return { success: false, error: "Failed to update calendar event" }
  }
}

// Delete a calendar event
export async function deleteCalendarEvent(formData: FormData) {
  try {
    const id = formData.get("id") as string

    // Delete event document from Firestore
    await adminDb.collection("calendarEvents").doc(id).delete()

    revalidatePath("/owner/calendar")
    return { success: true }
  } catch (error) {
    console.error("Error deleting calendar event:", error)
    return { success: false, error: "Failed to delete calendar event" }
  }
}

