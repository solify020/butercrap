import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Simple in-memory cache for maintenance mode
// This is Edge Runtime compatible
let maintenanceMode = false
let lastFetchTime = 0
const CACHE_TTL = 60 * 1000 // 1 minute

// Function to check maintenance mode without using Firebase Admin
export async function checkMaintenanceMode(request: NextRequest) {
  try {
    const now = Date.now()

    // Refresh the cache if needed
    if (now - lastFetchTime > CACHE_TTL) {
      // Fetch maintenance status from an API endpoint instead of directly from Firestore
      const response = await fetch(new URL("/api/admin/maintenance-status", request.url).toString())

      if (response.ok) {
        const data = await response.json()
        maintenanceMode = data.maintenanceMode
        lastFetchTime = now
      }
    }

    return maintenanceMode
  } catch (error) {
    console.error("Error checking maintenance mode:", error)
    return false
  }
}

// Middleware to apply maintenance mode
export async function applyMaintenanceMode(request: NextRequest) {
  // Skip for API routes and static assets
  const path = request.nextUrl.pathname
  if (
    path.startsWith("/api/") ||
    path.startsWith("/_next/") ||
    path.startsWith("/static/") ||
    path === "/" ||
    path === "/maintenance"
  ) {
    return null
  }

  try {
    // Check if maintenance mode is enabled
    const isMaintenanceMode = await checkMaintenanceMode(request)

    // If maintenance mode is enabled and user is not an owner
    if (isMaintenanceMode) {
      const userRole = request.cookies.get("user-role")?.value

      // Allow owners to bypass maintenance mode
      if (userRole !== "owner") {
        // Redirect to maintenance page
        return NextResponse.redirect(new URL("/maintenance", request.url))
      }
    }
  } catch (error) {
    console.error("Error applying maintenance mode:", error)
  }

  return null
}

