"use client"

import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

// Export as a named export, not default
export function DebugInfo() {
  const { user, isLoading, isAuthenticated, userRoles } = useAuth()
  const pathname = usePathname()

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <div className="fixed bottom-0 right-0 z-50 p-2 text-xs bg-black/80 text-white rounded-tl-md font-mono">
      <div>Path: {pathname}</div>
      <div>Auth: {isAuthenticated ? "✅" : "❌"}</div>
      <div>Loading: {isLoading ? "⏳" : "✅"}</div>
      <div>User: {user?.email || "None"}</div>
      <div>Roles: {userRoles.length ? userRoles.join(", ") : "None"}</div>
    </div>
  )
}

