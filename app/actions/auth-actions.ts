"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { adminAuth } from "@/lib/firebase-admin"

export async function createSession(idToken: string) {
  try {
    // Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken)

    // Create a session cookie
    const expiresIn = 60 * 60 * 24 * 5 * 1000 // 5 days
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn })

    // Set the session cookie
    cookies().set("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    })

    return { success: true }
  } catch (error) {
    console.error("Error creating session:", error)
    return { success: false, error: "Failed to create session" }
  }
}

export async function signOut() {
  cookies().delete("session")
  redirect("/")
}

export async function validateSession() {
  try {
    const sessionCookie = cookies().get("session")?.value

    if (!sessionCookie) {
      return null
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true)
    return decodedClaims
  } catch (error) {
    console.error("Error validating session:", error)
    return null
  }
}

