"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

// Define public routes that don't require authentication
const publicRoutes = ["/login", "/pending-approval"]

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    // Skip auth check if still loading
    if (isLoading) return

    // Check if the route requires authentication
    const requiresAuth = !publicRoutes.includes(pathname)

    // Function to check if user is authorized
    const checkAuth = () => {
      // If user is not logged in and trying to access protected route
      if (!user && requiresAuth) {
        console.log("Not authorized, redirecting to login")
        setAuthorized(false)
        router.push("/login")
        return
      }

      // If user is logged in and trying to access login page
      if (user && pathname === "/login") {
        console.log("Already logged in, redirecting to dashboard")
        setAuthorized(false)
        router.push("/dashboard")
        return
      }

      // User is authorized
      console.log("User is authorized")
      setAuthorized(true)
    }

    // Run the auth check
    checkAuth()
    setChecked(true)
  }, [user, isLoading, pathname, router])

  // Always render children to prevent white screen
  return <>{children}</>
}

