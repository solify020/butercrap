// This file provides a client-side API for interacting with the server
// It abstracts away direct Firestore access from client components

import type { LinkItem } from "@/components/staff-dashboard"

// Fetch links based on the current user's role
export async function fetchLinks(): Promise<LinkItem[]> {
  try {
    const response = await fetch("/api/links/fetch")

    if (!response.ok) {
      throw new Error("Failed to fetch links")
    }

    const data = await response.json()
    return data.links || []
  } catch (error) {
    console.error("Error fetching links:", error)
    throw error
  }
}

// Add a new link
export async function addLink(
  name: string,
  url: string,
  type: "site" | "app",
  imageUrl?: string,
  color?: string,
): Promise<string> {
  try {
    const response = await fetch("/api/links/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, url, type, imageUrl, color }),
    })

    if (!response.ok) {
      throw new Error("Failed to add link")
    }

    const data = await response.json()
    return data.id
  } catch (error) {
    console.error("Error adding link:", error)
    throw error
  }
}

// Delete a link
export async function deleteLink(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/links/delete?id=${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error("Failed to delete link")
    }
  } catch (error) {
    console.error("Error deleting link:", error)
    throw error
  }
}

// Check authentication status
export async function checkAuthStatus(): Promise<{ authenticated: boolean; role?: string }> {
  try {
    const response = await fetch("/api/auth/check-session")

    if (!response.ok) {
      return { authenticated: false }
    }

    return await response.json()
  } catch (error) {
    console.error("Error checking auth status:", error)
    return { authenticated: false }
  }
}

// Sign out the current user
export async function signOut(): Promise<void> {
  try {
    await fetch("/api/auth/logout", { method: "POST" })
  } catch (error) {
    console.error("Error signing out:", error)
    throw error
  }
}

